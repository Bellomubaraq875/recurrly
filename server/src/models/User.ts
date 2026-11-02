import { HydratedDocument, Schema, model } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  currency: string;
  reminderDaysBefore: number;
  premiumUntil: Date | null;
  pushTokens: string[];
}

const schema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    currency: { type: String, default: 'NGN' },
    reminderDaysBefore: { type: Number, default: 3, min: 0, max: 14 },
    premiumUntil: { type: Date, default: null },
    pushTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', schema);

export type UserDoc = HydratedDocument<IUser>;

export const isPremium = (user: IUser) => !!user.premiumUntil && user.premiumUntil.getTime() > Date.now();

export const publicUser = (user: UserDoc) => ({
  id: user.id as string,
  email: user.email,
  name: user.name,
  currency: user.currency,
  reminderDaysBefore: user.reminderDaysBefore,
  premium: isPremium(user),
  premiumUntil: user.premiumUntil,
});
