import jwt from 'jsonwebtoken';

export function log(...args: any[]) {
  console.log(...args);
}

const firstNames = [
  'John',
  'William',
  'James',
  'Mary',
  'George',
  'Joseph',
  'Charles',
  'Henry',
  'Robert',
  'Edward',
  'Thomas',
  'Anna',
  'Frank',
  'Margaret',
  'Alice',
  'Arthur',
  'Florence',
  'Elizabeth',
  'Paul',
  'Pauline',
  'Emma',
  'Clara',
  'Annie',
  'Harold',
  'Lillian',
  'Louis',
  'Grace',
  'Ethel',
  'Martha',
  'Fred',
  'Bessie',
  'Catherine',
  'Hattie',
  'Mabel',
  'Jessie',
  'Nellie',
  'Ruth',
  'Gertrude',
  'Helen',
  'Esther',
  'Agnes',
  'Edith',
  'Edna'
];
export function generateGuestName(): string {
  let name: string = firstNames[Math.floor(Math.random() * firstNames.length)] + '-';
  for (let i = 0; i < 5; i++) name += Math.floor(Math.random() * 9);
  return name;
}

export function generateVerifyCode(): string {
  const chars = '123456789abcdefghijklmnpqrstuvwxyz';
  let code: string = '';
  for (let i = 0; i < 6; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code.toUpperCase();
}

export function experienceNeededFromLevel(level: number): number {
  return Math.round(100 + (level - 1) * 7);
}

export function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  });
}
