import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { addItem, ItemType } from '../controllers/resource-controller';
import { getUserByEmail, registerUser } from '../controllers/user-controller';
import { connectToDatabase } from '../database/database';
import authenticate from '../middlewares/authenticate';
import identify from '../middlewares/identify';

import lag from '../middlewares/lag';
import { generateAccessToken, log } from '../util';

dotenv.config();

const app = express();
app.use(lag);
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true
  })
);

connectToDatabase();

let refreshTokensWithUserIds: Array<{ id: string; token: string }> = [];

app.get('/', (req, res) => {
  res.send('Authentication server is running.');
});

// Client demands a new refresh token
app.get('/token', (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(401).send('No refresh token provided.');
  if (!refreshTokensWithUserIds.find((t) => t.token === refreshToken))
    return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, { id }) => {
    if (err) return res.sendStatus(401);
    const accessToken = generateAccessToken({ id: id });
    res.json({ id: id, accessToken: accessToken });
  });
});

app.post('/login', async (req, res) => {
  // Login with email and password combination
  const user = await getUserByEmail(req.body.email);
  if (!user) return res.status(401).send('Incorrect email or password.');
  if (await bcrypt.compare(req.body.password, user.password)) {
    const payload = { id: user.id };
    const accessToken = generateAccessToken(payload);

    // If a refresh token already exists, remove it; This logs out any concurrent sessions
    refreshTokensWithUserIds = refreshTokensWithUserIds.filter(
      (t) => t.id !== user.id
    );

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    refreshTokensWithUserIds.push({ id: user.id, token: refreshToken });

    log(
      `${user.id} logged in with a token ending in ${refreshToken.slice(-5)}`
    );

    res.json({
      id: user.id,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } else {
    res.status(401).send('Incorrect email or password.');
  }
});

app.get('/logout', authenticate, identify, async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).send('User not found.');

  refreshTokensWithUserIds = refreshTokensWithUserIds.filter(
    (t) => t.token !== req.body.refreshToken
  );

  log('Logged out user', user.id);
  res.status(200).send('Logged out.');
});

app.post('/register', async (req, res) => {
  try {
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, 10);

    log('Registering email', email);

    // Is the email already registered?
    if (await getUserByEmail(email)) {
      log(email, 'is already registered.');
      return res.status(409).send(`The email ${email} is already registered.`);
    }

    const user = await registerUser(email, password);
    log(email, 'registered successfully.');

    addItem(user.id, ItemType.NAME_CHANGE);
    res.status(201).send('User registered.');
  } catch (err) {
    log('Error registering user:', err);
    res.status(500);
  }
});

app.listen(process.env.PORT, () => {
  return log('Auth server is listening on port', process.env.PORT);
});