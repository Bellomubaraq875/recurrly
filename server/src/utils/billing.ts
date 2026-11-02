export type Cycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const cycles: Cycle[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

export const categories = [
  'Entertainment',
  'Music',
  'Productivity',
  'Cloud',
  'Utilities',
  'Health',
  'Education',
  'Finance',
  'Other',
] as const;

const DAY = 86400000;

export const startOfUtcDay = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY);

export const addMonths = (date: Date, months: number) => {
  const day = date.getUTCDate();
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
};

export const addCycle = (date: Date, cycle: Cycle) => {
  if (cycle === 'weekly') return addDays(date, 7);
  if (cycle === 'monthly') return addMonths(date, 1);
  if (cycle === 'quarterly') return addMonths(date, 3);
  return addMonths(date, 12);
};

export const rollForward = (date: Date, cycle: Cycle, now = new Date()) => {
  const today = startOfUtcDay(now);
  let next = startOfUtcDay(date);
  while (next < today) next = addCycle(next, cycle);
  return next;
};

export const monthlyCost = (amount: number, cycle: Cycle) => {
  if (cycle === 'weekly') return (amount * 52) / 12;
  if (cycle === 'monthly') return amount;
  if (cycle === 'quarterly') return amount / 3;
  return amount / 12;
};

export const round2 = (value: number) => Math.round(value * 100) / 100;

export const projectMonths = (
  subs: { amount: number; cycle: Cycle; nextBillingDate: Date }[],
  count: number
) => {
  const now = new Date();
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + count, 1));
  const totals = Array.from({ length: count }, () => 0);
  for (const sub of subs) {
    let date = rollForward(sub.nextBillingDate, sub.cycle);
    while (date < end) {
      const index = (date.getUTCFullYear() - first.getUTCFullYear()) * 12 + date.getUTCMonth() - first.getUTCMonth();
      if (index >= 0 && index < count) totals[index] += sub.amount;
      date = addCycle(date, sub.cycle);
    }
  }
  return totals.map((total, index) => {
    const month = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + index, 1));
    return { month: month.toISOString().slice(0, 7), total: round2(total) };
  });
};
