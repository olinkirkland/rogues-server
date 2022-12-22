import { connect } from 'mongoose';
import { log } from '../util';

export async function returnAfterOneSecond() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}

export async function connectToDatabase() {
  log('Connecting to database...');
  return new Promise((resolve) => {
    connect(process.env.DATABASE_URL)
      .then((res) => {
        log('\x1b[32m%s\x1b[0m', 'Connected to database');
        resolve(true);
      })
      .catch((err) => {
        log('\x1b[31m%s\x1b[0m', 'Failed to connect to database');
        resolve(false);
      });
  });
}
