import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { api } from '../../src/api';
import { useAuth } from '../../src/auth';
import { SubscriptionCard } from '../../src/components/SubscriptionCard';
import { formatMoney } from '../../src/format';
import { colors, radius } from '../../src/theme';
import { Stats, Subscription } from '../../src/types';

export default function Subscriptions() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([api.listSubscriptions(), api.stats()]);
      setItems(list.subscriptions);
      setStats(summary);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load subscriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const currency = user?.currency ?? 'NGN';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.primary}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Monthly spend</Text>
            <Text style={styles.summaryValue}>{formatMoney(stats?.monthlyTotal ?? 0, currency)}</Text>
            <Text style={styles.summaryMeta}>
              {stats?.activeCount ?? 0} active · {formatMoney(stats?.yearlyTotal ?? 0, currency)} per year
            </Text>
            {!!error && <Text style={styles.error}>{error}</Text>}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="albums-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No subscriptions yet</Text>
            <Text style={styles.emptyText}>Add your first recurring payment to start tracking renewals.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            currency={currency}
            onPress={() => router.push({ pathname: '/subscription-form', params: { id: item.id } })}
          />
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/subscription-form')}>
        <Ionicons name="add" size={30} color={colors.primaryText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 110, flexGrow: 1 },
  gap: { height: 10 },
  summary: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 20,
    gap: 4,
  },
  summaryLabel: { color: '#E4E0FF', fontSize: 14, fontWeight: '600' },
  summaryValue: { color: colors.primaryText, fontSize: 34, fontWeight: '800' },
  summaryMeta: { color: '#E4E0FF', fontSize: 13 },
  error: { color: '#FFD0D5', marginTop: 8 },
  empty: { alignItems: 'center', gap: 10, paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptyText: { color: colors.muted, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
