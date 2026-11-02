import dotenv from 'dotenv';

dotenv.config();

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable ${key}`);
  return value;
};

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  paystackSecret: process.env.PAYSTACK_SECRET_KEY || '',
  premiumMonthlyKobo: Number(process.env.PREMIUM_MONTHLY_KOBO) || 150000,
  premiumYearlyKobo: Number(process.env.PREMIUM_YEARLY_KOBO) || 1500000,
  reminderTz: process.env.REMINDER_TZ || 'Africa/Lagos',
  freeLimit: 5,
};
