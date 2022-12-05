export {};

declare global {
  namespace Express {
    interface Request {
      id: string; // The user's id
      user?: any; // The user's data
    }
  }
}
