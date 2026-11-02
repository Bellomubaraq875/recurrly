import mongoose from 'mongoose';
import { connectDb } from '../db';
import { Payment } from '../models/Payment';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';

const run = async () => {
  await connectDb();
  for (const model of [User, Subscription, Payment]) {
    await model.createCollection().catch(() => undefined);
    await model.syncIndexes();
  }
  console.log('Database ready: collections and indexes created');
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
