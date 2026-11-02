import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { api } from '../src/api';
import { useAuth } from '../src/auth';
import { Button } from '../src/components/Button';
import { formatDate, formatMoney } from '../src/format';
import { colors, radius } from '../src/theme';
import { Plans } from '../src/types';

type Plan = 'monthly' | 'yearly';

export default function Premium() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [plans, setPlans] = useState<Plans | null>(null);
  const [selected, setSelected] = useState<Plan>('yearly');
  const [busy, setBusy] = useState(false);
  const [pendingReference, setPendingReference] = useState<string | null>(null);

  useEffect(() => {
    api.plans().then(setPlans).catch(() => undefined);
  }, []);

  const verify = async (reference: string) => {
    setBusy(true);
    try {
      const result = await api.verifyPayment(reference);
      setUser(result.user);
      if (result.success) {
        setPendingReference(null);
        Alert.alert('Welcome to Premium', 'Your upgrade is active.', [{ text: 'Done', onPress: () => router.back() }]);
      } else {
        Alert.alert('Payment not confirmed yet', 'If you completed the payment, tap "I\'ve paid, check status" in a moment.');
      }
    } catch (e) {
      Alert.alert('Could not verify payment', e instanceof Error ? e.message : 'Please try again');
    } finally {
      setBusy(false);
    }
  };

  const subscribe = async () => {
    setBusy(true);
    try {
      const { authorizationUrl, reference } = await api.initializePayment(selected);
      setPendingReference(reference);
      await WebBrowser.openBrowserAsync(authorizationUrl);
      setBusy(false);
      await verify(reference);
    } catch (e) {
      setBusy(false);
      Alert.alert('Could not start payment', e instanceof Error ? e.message : 'Please try again');
    }
  };

  const perks = [
    `Unlimited subscriptions (free plan is limited to ${plans?.freeLimit ?? 5})`,
    'Six-month spending projection chart',
    'Priority for new features',
  ];

  const prices: Record<Plan, string> = {
    monthly: plans ? formatMoney(plans.monthlyKobo / 100, plans.currency) : '',
    yearly: plans ? formatMoney(plans.yearlyKobo / 100, plans.currency) : '',
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="sparkles" size={36} color={colors.warning} />
        <Text style={styles.title}>Go Premium</Text>
        {user?.premium && user.premiumUntil && (
          <Text style={styles.active}>Active until {formatDate(user.premiumUntil)}</Text>
        )}
      </View>

      <View style={styles.perks}>
        {perks.map((perk) => (
          <View key={perk} style={styles.perk}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        {(['monthly', 'yearly'] as Plan[]).map((plan) => (
          <Pressable
            key={plan}
            onPress={() => setSelected(plan)}
            style={[styles.plan, selected === plan && styles.planSelected]}
          >
            <Text style={styles.planName}>{plan === 'monthly' ? 'Monthly' : 'Yearly'}</Text>
            <Text style={styles.planPrice}>{prices[plan] || '...'}</Text>
            <Text style={styles.planMeta}>{plan === 'monthly' ? 'per month' : 'per year, save about 17%'}</Text>
          </Pressable>
        ))}
      </View>

      <Button title={user?.premium ? 'Extend Premium' : 'Subscribe'} onPress={subscribe} loading={busy} disabled={!plans} />
      {pendingReference && (
        <Button title="I've paid, check status" variant="ghost" onPress={() => verify(pendingReference)} disabled={busy} />
      )}
      <Text style={styles.fine}>Payments are processed securely by Paystack. Each payment adds time to your plan and does not renew automatically.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 18, paddingBottom: 40 },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  active: { color: colors.success, fontWeight: '600' },
  perks: { gap: 12, backgroundColor: colors.surface, padding: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  perk: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  perkText: { color: colors.text, fontSize: 15, flex: 1 },
  plans: { flexDirection: 'row', gap: 12 },
  plan: { flex: 1, padding: 16, gap: 4, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  planSelected: { borderColor: colors.primary },
  planName: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  planPrice: { color: colors.text, fontSize: 20, fontWeight: '800' },
  planMeta: { color: colors.muted, fontSize: 12 },
  fine: { color: colors.muted, fontSize: 12, textAlign: 'center' },
});
