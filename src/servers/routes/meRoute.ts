import bcrypt from 'bcrypt';
import express from 'express';
import {
  addWelcomeItems,
  ItemType,
  removeItem
} from '../../controllers/resource-controller';
import { invalidateUser } from '../../controllers/socket-controller';
import { getUserByEmail, getUserById } from '../../controllers/user-controller';
import { toPersonalUserData } from '../../database/schemas/user';
import authenticate from '../../middlewares/authenticate';
import identify from '../../middlewares/identify';

const router = express.Router();

export default router;

router.get('/', authenticate, async (req, res) => {
  const user = await getUserById(req.id);
  if (!user) return res.sendStatus(404);

  res.json(toPersonalUserData(user));
});

router.post('/email', authenticate, identify, async (req, res) => {
  // Check password
  const user = req.user;
  if (!user.isRegistered) return res.sendStatus(401);
  const password = req.body.password;
  if (!password || !(await bcrypt.compare(password, user.password))) {
    res.sendStatus(401);
    return;
  }

  const email = req.body.email;

  // Is the email already registered?
  if (await getUserByEmail(email)) {
    console.log('❌', email, 'is already registered');
    return res.status(409).send(`The Email ${email} is already registered.`);
  }

  user.email = email;
  await user.save();

  invalidateUser(user);
  res.sendStatus(200);
});

router.post('/password', authenticate, identify, async (req, res) => {
  // Check password
  const user = req.user;
  if (!user.isRegistered) return res.sendStatus(401);
  const password = req.body.password;
  if (!password || !(await bcrypt.compare(password, user.password))) {
    res.sendStatus(401);
    return;
  }

  user.password = await bcrypt.hash(req.body.newPassword, 10);
  await user.save();

  invalidateUser(user);
  res.sendStatus(200);
});

router.post('/name', authenticate, identify, async (req, res) => {
  const user = req.user;

  const canChange = await removeItem(req.id, ItemType.NAME_CHANGE);
  if (!canChange) return res.sendStatus(409);

  user.name = req.body.name;
  await user.save();

  invalidateUser(user);
  res.sendStatus(200);
});

router.post('/avatar', authenticate, identify, async (req, res) => {
  const user = req.user;

  // Ensure the user owns the avatar
  if (!user.inventory.includes(req.body.avatar)) return res.sendStatus(409);

  user.avatar = req.body.avatar;
  await user.save();

  invalidateUser(user);
  res.sendStatus(200);
});

router.post('/wallpaper', authenticate, identify, async (req, res) => {
  const user = req.user;

  // Ensure the user owns the wallpaper
  if (!user.inventory.includes(req.body.wallpaper)) return res.sendStatus(409);

  user.wallpaper = req.body.wallpaper;
  await user.save();

  invalidateUser(user);
  res.sendStatus(200);
});

router.post('/note', authenticate, identify, async (req, res) => {
  const user = req.user;

  user.note = req.body.note;
  await user.save();

  invalidateUser(user);
  res.sendStatus(200);
});

router.post('/verify', authenticate, identify, async (req, res) => {
  const user = await getUserById(req.id);
  if (!user) return res.sendStatus(404);

  const code = req.body.code;
  if (code !== user.verifyCode) return res.sendStatus(401);

  if (!user.isVerified) {
    user.isVerified = true;
    addWelcomeItems(user.id);
    await user.save();
  }

  invalidateUser(user);
  res.sendStatus(200);
});
