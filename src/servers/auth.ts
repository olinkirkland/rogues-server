import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { addItem, ItemType } from '../controllers/resource-controller';
import {
  createGuestUser,
  deleteUser,
  getUserByEmail,
  registerUser
} from '../controllers/user-controller';
import { connectToDatabase } from '../database/database';
import authenticate from '../middlewares/authenticate';
import identify from '../middlewares/identify';

import lag from '../middlewares/lag';
import { generateAccessToken, log, validateEnv } from '../util';

dotenv.config();
if (!validateEnv()) {
  // Exit application
  process.exit();
}

const app = express();

// Orange
log('\x1b[33m%s\x1b[0m', '================= SLOW MODE ON =================');
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

setTimeout(() => {
  connectToDatabase().then((result) => {
    if (!result) {
      log('\x1b[31m%s\x1b[0m', 'Exiting...');
      setTimeout(process.exit, 1000);
    }
  });
});

let refreshTokens: Array<{ id: string; token: string }> = [];

app.get('/', (req, res) => {
  res.send('Authentication server is running.');
});

// Client demands a new access token
app.post('/token', (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(401).send('No refresh token provided.');
  if (!refreshTokens.find((t) => t.token === refreshToken))
    return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, { id }) => {
    if (err) return res.sendStatus(401);
    const accessToken = generateAccessToken({ id: id });
    res.json({ id: id, accessToken: accessToken });
  });
});

app.post('/login', async (req, res) => {
  // If the email and password are both null, create a guest account
  const isGuest = !(req.body.email && req.body.password);
  const user = isGuest
    ? await createGuestUser()
    : await getUserByEmail(req.body.email);

  // If user is not found, return 401
  if (!user) return res.status(401).send('Incorrect email or password.');

  // Login with email and password combination (if registered)
  if (
    !isGuest &&
    (!user || !(await bcrypt.compare(req.body.password, user.password)))
  ) {
    res.status(401).send('Incorrect email or password.');
    return;
  }

  const payload = { id: user.id };
  const accessToken = generateAccessToken(payload);

  // If a refresh token already exists, remove it; This logs out any concurrent sessions
  refreshTokens = refreshTokens.filter((t) => t.id !== user.id);

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push({ id: user.id, token: refreshToken });

  log(
    `${
      isGuest ? 'Guest' : user.email
    } logged in with a token ending in ${refreshToken.slice(-5)}`
  );

  res.json({
    id: user.id,
    accessToken: accessToken,
    refreshToken: refreshToken
  });
});

app.get('/logout', authenticate, identify, async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).send('User not found.');

  // Find the refresh token by user id
  const refreshToken = refreshTokens.find((t) => t.id === user.id);
  if (!refreshToken) return res.status(401).send('Refresh token not found.');

  refreshTokens = refreshTokens.filter((t) => t.id !== user.id);
  log(`${user.email} logged out`);
  res.status(200).send('Logged out.');
});

app.post('/register', authenticate, identify, async (req, res) => {
  const user = req.user;
  try {
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, 10);

    log(`Registering a new account for email ${email}`);

    // Is the email already registered?
    if (await getUserByEmail(email)) {
      log(`  ${email} is already registered`);
      return res.status(409).send(`The email ${email} is already registered.`);
    }

    const isUserRegistered = await registerUser(user, email, password);
    log(
      `  ${email} was ${
        isUserRegistered ? '' : 'not'
      }    } registered successfully`
    );

    // addItem(user.id, ItemType.NAME_CHANGE);
    res.status(201).send('User registered.');
  } catch (err) {
    log(`Error registering user: ${err}`);
    res.status(500);
  }
});

app.delete('/delete', authenticate, identify, async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).send('User not found.');
  deleteUser(user.id);
  log(`${user.email} deleted their account`);
  return res.status(200).send('Account deleted.');
});

app.listen(process.env.AUTH_PORT, () => {
  return log(`Auth server is listening on port ${process.env.AUTH_PORT}`);
});
