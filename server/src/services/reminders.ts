import cron from 'node-cron';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { config } from '../config';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';
import { addDays, rollForward, startOfUtcDay } from '../utils/billing';

const expo = new Expo();

const describe = (days: number) => {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

export const runReminders = async () => {
  const today = startOfUtcDay();
  const stale = await Subscription.find({ active: true, nextBillingDate: { $lt: today } });
  for (const sub of stale) {
    sub.nextBillingDate = rollForward(sub.nextBillingDate, sub.cycle);
    await sub.save();
  }

  const users = await User.find({ 'pushTokens.0': { $exists: true } });
  for (const user of users) {
    const horizon = addDays(today, user.reminderDaysBefore + 1);
    const due = await Subscription.find({
      user: user._id,
      active: true,
      nextBillingDate: { $gte: today, $lt: horizon },
    });
    const pending = due.filter(
      (sub) => !sub.lastReminderFor || sub.lastReminderFor.getTime() !== sub.nextBillingDate.getTime()
    );
    if (!pending.length) continue;

    const tokens = user.pushTokens.filter((token) => Expo.isExpoPushToken(token));
    const messages: ExpoPushMessage[] = [];
    for (const sub of pending) {
      const days = Math.round((sub.nextBillingDate.getTime() - today.getTime()) / 86400000);
      for (const token of tokens) {
        messages.push({
          to: token,
          sound: 'default',
          title: 'Upcoming renewal',
          body: `${sub.name} renews ${describe(days)} (${user.currency} ${sub.amount})`,
          data: { subscriptionId: sub.id },
        });
      }
    }

    for (const chunk of expo.chunkPushNotifications(messages)) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Push send failed', error);
      }
    }

    for (const sub of pending) {
      sub.lastReminderFor = sub.nextBillingDate;
      await sub.save();
    }
  }
};

export const startReminders = () => {
  cron.schedule(
    '0 8 * * *',
    () => {
      runReminders().catch((error) => console.error('Reminder job failed', error));
    },
    { timezone: config.reminderTz }
  );
  runReminders().catch((error) => console.error('Reminder job failed', error));
};
