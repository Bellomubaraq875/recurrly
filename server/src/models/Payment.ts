import { Schema, Types, model } from 'mongoose';

export interface IPayment {
  user: Types.ObjectId;
  reference: string;
  plan: 'monthly' | 'yearly';
  amountKobo: number;
  status: 'pending' | 'success';
}

const schema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reference: { type: String, required: true, unique: true },
    plan: { type: String, enum: ['monthly', 'yearly'], required: true },
    amountKobo: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success'], default: 'pending' },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', schema);
