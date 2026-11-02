import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';
import { Payment } from '../models/Payment';
import { User, publicUser } from '../models/User';
import { applyPayment, paystack, plans } from '../services/paystack';
import { HttpError, asyncHandler } from '../utils/http';

const router = Router();

const initSchema = z.object({ plan: z.enum(['monthly', 'yearly']) });
const verifySchema = z.object({ reference: z.string().min(5).max(100) });

router.get('/plans', (_req, res) => {
  res.json({
    currency: 'NGN',
    freeLimit: config.freeLimit,
    monthlyKobo: config.premiumMonthlyKobo,
    yearlyKobo: config.premiumYearlyKobo,
  });
});

router.post(
  '/initialize',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { plan } = initSchema.parse(req.body);
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, 'Account not found');
    const amountKobo = plans[plan].kobo();
    const reference = `rcl_${crypto.randomBytes(10).toString('hex')}`;
    await Payment.create({ user: user._id, reference, plan, amountKobo });
    const data = await paystack('/transaction/initialize', {
      method: 'POST',
      body: { email: user.email, amount: amountKobo, reference, metadata: { userId: user.id, plan } },
    });
    res.json({ authorizationUrl: data.authorization_url, reference });
  })
);

router.post(
  '/verify',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { reference } = verifySchema.parse(req.body);
    const payment = await Payment.findOne({ reference, user: req.userId });
    if (!payment) throw new HttpError(404, 'Payment not found');
    const result = await applyPayment(reference);
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, 'Account not found');
    res.json({ success: result?.status === 'success', user: publicUser(user) });
  })
);

export const webhookHandler = asyncHandler(async (req, res) => {
  const raw = req.body as Buffer;
  const signature = String(req.headers['x-paystack-signature'] ?? '');
  const expected = crypto.createHmac('sha512', config.paystackSecret).update(raw).digest('hex');
  const valid =
    signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) throw new HttpError(401, 'Invalid signature');
  const event = JSON.parse(raw.toString('utf8'));
  if (event.event === 'charge.success' && event.data?.reference) await applyPayment(event.data.reference);
  res.sendStatus(200);
});

export default router;
