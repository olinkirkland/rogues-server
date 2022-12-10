import { v4 as uuid } from 'uuid';
import User from '../database/schemas/user';
import { generateGuestName, generateVerifyCode } from '../util';

export async function registerUser(user, email: string, password: string) {
  if (user.isRegistered) return false;

  user.isRegistered = true;
  user.email = email;
  user.password = password;
  await user.save();

  return true;
}

export async function createGuestUser() {
  const user = await new User({
    id: uuid(),
    email: null,
    password: null,
    isRegistered: false,
    name: generateGuestName(),
    verifyCode: generateVerifyCode(),
    note: 'This user prefers to keep an air of mystery about them.',
    avatar: 'inmQ-K0Zd',
    inventory: [],
    gold: 0,
    level: 1,
    experience: 0
  }).save();
  return user;
}

export async function deleteUser(id: string) {
  // Delete user from database
  const user = await User.findOne({
    id: id
  });
  if (!user) return;
  await user.delete();
}

export async function getUserById(id: string) {
  return await User.findOne({ id: id });
}

export async function getUserByEmail(email: string) {
  return await User.findOne({ email: email });
}
