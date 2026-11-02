import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api } from '../../src/api';
import { Button } from '../../src/components/Button';
import { BarChart, CategoryBars } from '../../src/components/Charts';
import { SubscriptionCard } from '../../src/components/SubscriptionCard';
import { formatMoney } from '../../src/format';
import { colors, radius } from '../../src/theme';
import { Stats } from '../../src/types';

export default function Insights() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      api
        .stats()
        .then((result) => {
          setStats(result);
          setError('');
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Could not load insights'));
    }, [])
  );

  if (!stats) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Per month</Text>
          <Text style={styles.statValue}>{formatMoney(stats.monthlyTotal, stats.currency)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Per year</Text>
          <Text style={styles.statValue}>{formatMoney(stats.yearlyTotal, stats.currency)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending by category</Text>
        {stats.byCategory.length ? (
          <CategoryBars data={stats.byCategory} currency={stats.currency} />
        ) : (
          <Text style={styles.muted}>Add subscriptions to see your breakdown.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next 6 months</Text>
        {stats.trend ? (
          <BarChart data={stats.trend} currency={stats.currency} />
        ) : (
          <View style={styles.locked}>
            <Text style={styles.muted}>Upgrade to Premium to see your projected spending for the coming months.</Text>
            <Button title="Unlock with Premium" onPress={() => router.push('/premium')} />
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Due in the next 30 days</Text>
        {stats.upcoming.length ? (
          <View style={styles.upcoming}>
            {stats.upcoming.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                currency={stats.currency}
                onPress={() => router.push({ pathname: '/subscription-form', params: { id: sub.id } })}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>Nothing is due in the next 30 days.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, gap: 4, borderWidth: 1, borderColor: colors.border },
  statLabel: { color: colors.muted, fontSize: 13 },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  muted: { color: colors.muted, fontSize: 14 },
  error: { color: colors.danger },
  locked: { gap: 14 },
  upcoming: { gap: 10 },
});
