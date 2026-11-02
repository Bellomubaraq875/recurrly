import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';
import { Subscription } from '../models/Subscription';
import { User, isPremium } from '../models/User';
import { refreshDates } from '../services/subscriptionService';
import { categories, cycles, startOfUtcDay } from '../utils/billing';
import { HttpError, asyncHandler } from '../utils/http';

const router = Router();

router.use(requireAuth);

const baseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  amount: z.number({ invalid_type_error: 'Enter a valid amount' }).min(0, 'Amount cannot be negative').max(100000000),
  cycle: z.enum(cycles as [string, ...string[]]),
  category: z.enum(categories as unknown as [string, ...string[]]).default('Other'),
  nextBillingDate: z.coerce.date({ invalid_type_error: 'Enter a valid date' }),
  notes: z.string().trim().max(300).default(''),
  active: z.boolean().default(true),
});

const updateSchema = baseSchema.partial();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const subs = await Subscription.find({ user: req.userId });
    await refreshDates(subs);
    subs.sort((a, b) => a.nextBillingDate.getTime() - b.nextBillingDate.getTime());
    res.json({ subscriptions: subs.map((sub) => sub.toJSON()) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.userId });
    if (!sub) throw new HttpError(404, 'Subscription not found');
    await refreshDates([sub]);
    res.json({ subscription: sub.toJSON() });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = baseSchema.parse(req.body);
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, 'Account not found');
    if (!isPremium(user)) {
      const count = await Subscription.countDocuments({ user: req.userId });
      if (count >= config.freeLimit) {
        throw new HttpError(403, `Free plan is limited to ${config.freeLimit} subscriptions. Upgrade to add more.`, 'PREMIUM_REQUIRED');
      }
    }
    const sub = await Subscription.create({
      ...body,
      cycle: body.cycle as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
      user: req.userId,
      nextBillingDate: startOfUtcDay(body.nextBillingDate),
    });
    res.status(201).json({ subscription: sub.toJSON() });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = updateSchema.parse(req.body);
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.userId });
    if (!sub) throw new HttpError(404, 'Subscription not found');
    if (body.name !== undefined) sub.name = body.name;
    if (body.amount !== undefined) sub.amount = body.amount;
    if (body.cycle !== undefined) sub.cycle = body.cycle as typeof sub.cycle;
    if (body.category !== undefined) sub.category = body.category;
    if (body.notes !== undefined) sub.notes = body.notes;
    if (body.active !== undefined) sub.active = body.active;
    if (body.nextBillingDate !== undefined) {
      sub.nextBillingDate = startOfUtcDay(body.nextBillingDate);
      sub.lastReminderFor = null;
    }
    await sub.save();
    res.json({ subscription: sub.toJSON() });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await Subscription.deleteOne({ _id: req.params.id, user: req.userId });
    if (!result.deletedCount) throw new HttpError(404, 'Subscription not found');
    res.json({ ok: true });
  })
);

export default router;
