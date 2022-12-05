import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { toPublicUserData } from '../database/schemas/user';
import Signal from '../Signal';
import { getUserById } from './user-controller';

const sockets = {};
let socketsToInvalidate = [];

export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  INVALIDATE = 'invalidate'
}

export function startSocketServer(app) {
  const httpServer = createServer(app);
  const config = {
    cors: {
      origin: [
        'http://localhost:4000',
        'https://localhost:4000',
        'http://84.166.18.6:4000'
      ],
      methods: ['GET', 'POST']
    }
  };
  const io = new Server(httpServer, config);

  io.on('connection', (socket) => {
    // Is socket authenticated?
    console.log(socket.id, 'connected');

    const token: string = socket.handshake.query.token as string;
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, data) => {
      const id = data['id'];
      let user = await getUserById(id);
      if (!user) return;
      user.socket = socket.id;
      await user.save();
      sockets[socket.id] = socket;

      // Subscribe to general-chat room
      socket.join('general-chat');

      socket.on('chat', async (message) => {
        // Broadcast the message, date, and user to the general-chat room
        user = await getUserById(user.id);
        console.log('💬', user.name, ': ', message);
        io.to('general-chat').emit('chat', {
          message: message,
          time: new Date().getTime(),
          user: toPublicUserData(user)
        });
      });

      socket.on('disconnect', async () => {
        user = await getUserById(id);
        user.socket = null;
        await user.save();
        delete sockets[socket.id];

        Signal.instance.emit(SocketEvent.DISCONNECT, user);
        console.log('🔌 User', user.name, 'disconnected');
      });
    });
  });

  httpServer.listen(process.env.PORT, () => {
    console.log('💻', 'Socket server is listening on port', process.env.PORT);
  });

  startInvalidationInterval();
}

function startInvalidationInterval() {
  setInterval(() => {
    if (socketsToInvalidate.length === 0) return;

    // Reduce invalidations to unique strings
    socketsToInvalidate = [...new Set(socketsToInvalidate)];

    socketsToInvalidate.forEach((id) => {
      sockets[id].emit('invalidate');
    });

    socketsToInvalidate = [];
  }, 100);
}

export function invalidateUser(user) {
  const socketId: string = user.socket;
  const socket: Socket = sockets[socketId];
  if (!socket) return;

  socketsToInvalidate.push(socketId);
}
