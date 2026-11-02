import { config } from '../config';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { addMonths } from '../utils/billing';
import { HttpError } from '../utils/http';

export const plans = {
  monthly: { months: 1, kobo: () => config.premiumMonthlyKobo },
  yearly: { months: 12, kobo: () => config.premiumYearlyKobo },
} as const;

export const paystack = async (path: string, init: { method?: string; body?: unknown } = {}) => {
  if (!config.paystackSecret) throw new HttpError(503, 'Payments are not configured');
  const response = await fetch(`https://api.paystack.co${path}`, {
    method: init.method ?? 'GET',
    headers: { Authorization: `Bearer ${config.paystackSecret}`, 'Content-Type': 'application/json' },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const json: any = await response.json().catch(() => null);
  if (!response.ok || !json || !json.status) throw new HttpError(502, json?.message ?? 'Payment provider error');
  return json.data;
};

export const applyPayment = async (reference: string) => {
  const payment = await Payment.findOne({ reference });
  if (!payment) return null;
  if (payment.status === 'success') return payment;

  const data = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (data.status !== 'success' || data.amount !== payment.amountKobo) return payment;

  const claimed = await Payment.findOneAndUpdate({ reference, status: 'pending' }, { status: 'success' }, { new: true });
  if (!claimed) return payment;

  const user = await User.findById(payment.user);
  if (user) {
    const now = new Date();
    const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
    user.premiumUntil = addMonths(base, plans[payment.plan].months);
    await user.save();
  }
  return claimed;
};
