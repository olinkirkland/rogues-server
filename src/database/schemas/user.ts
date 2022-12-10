import { model, Schema } from 'mongoose';

export default model(
  'User',
  new Schema({
    socket: {
      type: String,
      required: false
    },
    id: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: false
    },
    password: {
      type: String,
      required: false
    },
    isRegistered: {
      type: Boolean,
      required: true
    },
    verifyCode: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    inventory: {
      type: Array,
      required: true
    },
    gold: {
      type: Number,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    experience: {
      type: Number,
      required: true
    },
    avatar: {
      type: String,
      required: true
    },
    note: {
      type: String,
      required: true
    }
  })
);

export function toPublicUserData(user) {
  const propertiesToReturn = ['id', 'name', 'avatar', 'note', 'level'];
  const publicUserData = {};
  propertiesToReturn.forEach((property) => {
    publicUserData[property] = user[property];
  });
  return publicUserData;
}

export function toPersonalUserData(user) {
  const propertiesToReturn = [
    'id',
    'name',
    'avatar',
    'note',
    'level',
    'email',
    'inventory',
    'gold',
    'experience',
    'isVerified'
  ];
  const publicUserData = {};
  propertiesToReturn.forEach((property) => {
    publicUserData[property] = user[property];
  });
  return publicUserData;
}
