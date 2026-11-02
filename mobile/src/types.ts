export type Cycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  reminderDaysBefore: number;
  premium: boolean;
  premiumUntil: string | null;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  category: string;
  nextBillingDate: string;
  notes: string;
  active: boolean;
}

export interface SubscriptionInput {
  name: string;
  amount: number;
  cycle: Cycle;
  category: string;
  nextBillingDate: string;
  notes: string;
  active: boolean;
}

export interface Stats {
  currency: string;
  activeCount: number;
  monthlyTotal: number;
  yearlyTotal: number;
  byCategory: { category: string; monthly: number }[];
  upcoming: Subscription[];
  trend: { month: string; total: number }[] | null;
}

export interface Plans {
  currency: string;
  freeLimit: number;
  monthlyKobo: number;
  yearlyKobo: number;
}
