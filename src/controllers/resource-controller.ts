import { experienceNeededFromLevel } from '../util';
import { invalidateUser } from './socket-controller';
import { getUserById } from './user-controller';

export enum ItemType {
  NAME_CHANGE = 'x8d0-fb9v'
}

export async function addGold(id: string, amount: number) {
  const user = await getUserById(id);
  if (!user) return false;

  user.gold += amount;
  await user.save();
  return true;
}

export async function addExperience(id: string, amount: number) {
  const user = await getUserById(id);
  if (!user) return false;

  amount = Math.floor(amount);

  console.log(
    '✨',
    `${user.name} received +${amount} experience (${user.experience} -> ${
      user.experience + amount
    })`
  );

  let experience = user.experience + amount;
  let level = user.level;

  while (experience >= experienceNeededFromLevel(level)) {
    // Level up
    level++;
    experience -= experienceNeededFromLevel(level);
    console.log('🌟', user.name, `leveled up (${level - 1} -> ${level})`);
  }

  user.level = level;
  user.experience = experience;

  await user.save();

  invalidateUser(user);
  return true;
}

export async function addItem(id: string, item: string) {
  const user = await getUserById(id);
  if (!user) return false;

  user.inventory.push(item);
  await user.save();

  invalidateUser(user);
  return true;
}

export async function removeItem(id: string, item: string) {
  const user = await getUserById(id);
  if (!user) return false;

  // Does the user have this item?
  if (!user.inventory.includes(item)) return false;

  user.inventory.splice(user.inventory.indexOf(item), 1);
  await user.save();

  invalidateUser(user);
  return true;
}

export async function addWelcomeItems(id: string) {
  const user = await getUserById(id);
  if (!user) return false;

  await addGold(id, 500);
  await user.save();

  invalidateUser(user);
  return true;
}
