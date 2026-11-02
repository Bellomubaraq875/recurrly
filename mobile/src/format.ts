import { Cycle } from './types';

export const cycleLabels: Record<Cycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const daysUntil = (iso: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  const local = new Date(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  return Math.round((local.getTime() - today.getTime()) / 86400000);
};

export const describeDue = (iso: string) => {
  const days = daysUntil(iso);
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 30) return `In ${days} days`;
  return formatDate(iso);
};

export const isoToLocalDate = (iso: string) => {
  const date = new Date(iso);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const localDateToIso = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();

export const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en', { month: 'short', timeZone: 'UTC' });
