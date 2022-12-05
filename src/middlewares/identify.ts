import { getUserById } from '../controllers/user-controller';

export default async function identify(req, res, next) {
  const user = await getUserById(req.id);
  if (!user) return res.status(404).send('User not found.');
  req.user = user;

  next();
}
