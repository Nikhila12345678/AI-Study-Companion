import mongoose from 'mongoose';
import { env } from './env.js';

let connected = false;

export async function connectDB() {
  if (connected) return mongoose.connection;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  connected = true;
  // eslint-disable-next-line no-console
  console.log('[db] connected to MongoDB');
  return mongoose.connection;
}

export async function disconnectDB() {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}
