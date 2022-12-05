import { connect } from 'mongoose';

export function connectToDatabase() {
  connect(process.env.DATABASE_URL)
    .then(() => {
      console.log('Connected to database');
    })
    .catch((err) => {
      console.error(err);
    });
}
