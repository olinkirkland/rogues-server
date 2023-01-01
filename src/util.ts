import jwt from 'jsonwebtoken';

const ALLOWED_ORIGINS = [
  'localhost',
  '127.0.0.1',
  '185.104.138.31',
  '84.166.21.65'
];
export function getAllowedOrigins(): string[] {
  let result = [];
  for (const origin of ALLOWED_ORIGINS) {
    result.push(`http://${origin}:5173`);
    result.push(`https://${origin}:5173`);
  }
  return result;
}

export function log(...args: any[]) {
  console.log(...args);
}

// TODO move this to a json file
export function generateDefaultName(): string {
  let name: string = 'Anon-' + Math.floor(Math.random() * 10000);
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

export function validateEnv(): Boolean {
  const requiredProperties = [
    'MAIN_PORT',
    'AUTH_PORT',
    'SOCKET_PORT',
    'REFRESH_TOKEN_SECRET',
    'ACCESS_TOKEN_SECRET',
    'DATABASE_URL'
  ];
  let missingProperties = [];
  requiredProperties.forEach((requiredProperty) => {
    if (!process.env[requiredProperty])
      missingProperties.push(requiredProperty);
  });
  if (missingProperties.length) {
    log(
      '\x1b[31m%s\x1b[0m',
      'Missing .env properties: ' + missingProperties.join(', ')
    );
  } else {
    log();
    log(
      '\x1b[36m%s\x1b[0m',
      '============ ENVIRONMENT VARIABLES ============='
    );
    requiredProperties.forEach((key) => {
      const value =
        process.env[key].length > 24
          ? '(too long to display)'
          : process.env[key];
      let separator = '';
      for (let i = 0; i < 48 - key.length - value.length; i++) separator += '.';
      log(key + separator + value);
    });
    log();
  }

  return !missingProperties.length;
}
