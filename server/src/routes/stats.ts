import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Subscription } from '../models/Subscription';
import { User, isPremium } from '../models/User';
import { refreshDates } from '../services/subscriptionService';
import { addDays, monthlyCost, projectMonths, round2, startOfUtcDay } from '../utils/billing';
import { HttpError, asyncHandler } from '../utils/http';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, 'Account not found');

    const subs = await Subscription.find({ user: req.userId, active: true });
    await refreshDates(subs);

    const monthlyTotal = subs.reduce((sum, sub) => sum + monthlyCost(sub.amount, sub.cycle), 0);

    const categoryMap = new Map<string, number>();
    for (const sub of subs) {
      categoryMap.set(sub.category, (categoryMap.get(sub.category) ?? 0) + monthlyCost(sub.amount, sub.cycle));
    }
    const byCategory = [...categoryMap.entries()]
      .map(([category, monthly]) => ({ category, monthly: round2(monthly) }))
      .sort((a, b) => b.monthly - a.monthly);

    const horizon = addDays(startOfUtcDay(), 30);
    const upcoming = subs
      .filter((sub) => sub.nextBillingDate < horizon)
      .sort((a, b) => a.nextBillingDate.getTime() - b.nextBillingDate.getTime())
      .map((sub) => sub.toJSON());

    res.json({
      currency: user.currency,
      activeCount: subs.length,
      monthlyTotal: round2(monthlyTotal),
      yearlyTotal: round2(monthlyTotal * 12),
      byCategory,
      upcoming,
      trend: isPremium(user) ? projectMonths(subs, 6) : null,
    });
  })
);

export default router;
