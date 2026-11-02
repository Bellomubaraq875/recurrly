import { HydratedDocument, Schema, Types, model } from 'mongoose';
import { Cycle, categories, cycles } from '../utils/billing';

export interface ISubscription {
  user: Types.ObjectId;
  name: string;
  amount: number;
  cycle: Cycle;
  category: string;
  nextBillingDate: Date;
  notes: string;
  active: boolean;
  lastReminderFor: Date | null;
}

const schema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    amount: { type: Number, required: true, min: 0 },
    cycle: { type: String, enum: cycles, required: true },
    category: { type: String, enum: categories, default: 'Other' },
    nextBillingDate: { type: Date, required: true },
    notes: { type: String, default: '', maxlength: 300 },
    active: { type: Boolean, default: true },
    lastReminderFor: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret: any) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.user;
        delete ret.lastReminderFor;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

schema.index({ user: 1, nextBillingDate: 1 });

export const Subscription = model<ISubscription>('Subscription', schema);

export type SubscriptionDoc = HydratedDocument<ISubscription>;
