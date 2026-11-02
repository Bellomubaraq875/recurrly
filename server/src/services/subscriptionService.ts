import { SubscriptionDoc } from '../models/Subscription';
import { rollForward, startOfUtcDay } from '../utils/billing';

export const refreshDates = async (subs: SubscriptionDoc[]) => {
  const today = startOfUtcDay();
  const stale = subs.filter((sub) => sub.nextBillingDate < today);
  await Promise.all(
    stale.map((sub) => {
      sub.nextBillingDate = rollForward(sub.nextBillingDate, sub.cycle);
      return sub.save();
    })
  );
  return subs;
};
