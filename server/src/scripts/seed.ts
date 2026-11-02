import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from '../db';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';
import { addDays, startOfUtcDay } from '../utils/billing';

const email = 'demo@recurrly.app';
const password = 'Demo12345!';

const run = async () => {
  await connectDb();
  const existing = await User.findOne({ email });
  if (existing) {
    await Subscription.deleteMany({ user: existing._id });
    await existing.deleteOne();
  }
  const user = await User.create({
    name: 'Demo User',
    email,
    passwordHash: await bcrypt.hash(password, 12),
    currency: 'NGN',
  });
  const today = startOfUtcDay();
  await Subscription.insertMany([
    { user: user._id, name: 'Netflix', amount: 4500, cycle: 'monthly', category: 'Entertainment', nextBillingDate: addDays(today, 2) },
    { user: user._id, name: 'Spotify', amount: 1700, cycle: 'monthly', category: 'Music', nextBillingDate: addDays(today, 5) },
    { user: user._id, name: 'iCloud 200GB', amount: 1200, cycle: 'monthly', category: 'Cloud', nextBillingDate: addDays(today, 9) },
    { user: user._id, name: 'Gym', amount: 45000, cycle: 'quarterly', category: 'Health', nextBillingDate: addDays(today, 20) },
    { user: user._id, name: 'Notion', amount: 96000, cycle: 'yearly', category: 'Productivity', nextBillingDate: addDays(today, 120) },
  ]);
  console.log(`Seeded demo account: ${email} / ${password}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
