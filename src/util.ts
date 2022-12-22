import jwt from 'jsonwebtoken';

export function log(...args: any[]) {
  console.log(...args);
}

// TODO move this to a json file
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
  let name: string =
    firstNames[Math.floor(Math.random() * firstNames.length)] + '-';
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

export function validateEnv(): Boolean {
  const requiredProperties = [
    'MAIN_PORT',
    'AUTH_PORT',
    'SOCKET_PORT',
    'REFRESH_TOKEN_SECRET',
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
