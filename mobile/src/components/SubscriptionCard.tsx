import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cycleLabels, daysUntil, describeDue, formatMoney } from '../format';
import { categoryColors, colors, radius } from '../theme';
import { Subscription } from '../types';

interface Props {
  subscription: Subscription;
  currency: string;
  onPress: () => void;
}

export const SubscriptionCard = ({ subscription, currency, onPress }: Props) => {
  const tint = categoryColors[subscription.category] ?? colors.muted;
  const soon = subscription.active && daysUntil(subscription.nextBillingDate) <= 3;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.avatar, { backgroundColor: `${tint}33` }]}>
        <Text style={[styles.initial, { color: tint }]}>{subscription.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {subscription.name}
        </Text>
        <Text style={styles.meta}>
          {subscription.category} · {cycleLabels[subscription.cycle]}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatMoney(subscription.amount, currency)}</Text>
        <Text style={[styles.due, soon && styles.dueSoon, !subscription.active && styles.paused]}>
          {subscription.active ? describeDue(subscription.nextBillingDate) : 'Paused'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 18, fontWeight: '800' },
  middle: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 13 },
  right: { alignItems: 'flex-end', gap: 2 },
  amount: { color: colors.text, fontSize: 16, fontWeight: '700' },
  due: { color: colors.muted, fontSize: 12 },
  dueSoon: { color: colors.warning, fontWeight: '700' },
  paused: { color: colors.muted, fontStyle: 'italic' },
});
