import jwt from 'jsonwebtoken';

export function log(...args: any[]) {
  console.log(...args);
}

export function generateGuestName(): string {
  let name: string = 'Anon_';
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
