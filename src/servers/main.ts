import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { startSocketServer } from '../controllers/socket-controller';
import { getUserById } from '../controllers/user-controller';
import { connectToDatabase } from '../database/database';
import { toPublicUserData } from '../database/schemas/user';
import authenticate from '../middlewares/authenticate';
import identify from '../middlewares/identify';
import lag from '../middlewares/lag';
import { log } from '../util';

dotenv.config();
const app = express();

log('\x1b[31m%s\x1b[0m', '============ SLOW MODE ON ============');
app.use(lag);

app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://84.166.21.65:5173',
      'https://84.166.21.65:5173'
    ],
    credentials: true
  })
);

connectToDatabase();
setTimeout(() => startSocketServer(app));

app.get('/', (req, res) => {
  res.send(`Hello World! It's me, the main server.`);
});

app.get('/user/:id', authenticate, async (req, res) => {
  const targetUser = await getUserById(req.params.id);
  if (!targetUser) return res.status(404);

  res.json(toPublicUserData(targetUser));
});

app.get('/me', authenticate, identify, async (req, res) => {
  res.json(toPublicUserData(req.user));
});

app.listen(process.env.MAIN_PORT, () => {
  return log(`Main server is listening on port ${process.env.MAIN_PORT}`);
});
