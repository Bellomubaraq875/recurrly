import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Switch, Text, View, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError, api } from '../src/api';
import { Button } from '../src/components/Button';
import { Chips } from '../src/components/Chips';
import { Input } from '../src/components/Input';
import { cycleLabels, formatDate, isoToLocalDate, localDateToIso } from '../src/format';
import { categories, colors, radius } from '../src/theme';
import { Cycle } from '../src/types';

const cycleOptions = (Object.keys(cycleLabels) as Cycle[]).map((value) => ({ value, label: cycleLabels[value] }));
const categoryOptions = categories.map((value) => ({ value, label: value }));

export default function SubscriptionForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [category, setCategory] = useState('Entertainment');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .getSubscription(id)
      .then(({ subscription }) => {
        setName(subscription.name);
        setAmount(String(subscription.amount));
        setCycle(subscription.cycle);
        setCategory(subscription.category);
        setDate(isoToLocalDate(subscription.nextBillingDate));
        setNotes(subscription.notes);
        setActive(subscription.active);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load subscription'))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    const parsed = Number(amount.replace(',', '.'));
    if (!name.trim()) return setError('Enter a name');
    if (!Number.isFinite(parsed) || parsed < 0 || amount.trim() === '') return setError('Enter a valid amount');
    setSaving(true);
    setError('');
    const body = {
      name: name.trim(),
      amount: parsed,
      cycle,
      category,
      nextBillingDate: localDateToIso(date),
      notes: notes.trim(),
      active,
    };
    try {
      if (id) await api.updateSubscription(id, body);
      else await api.createSubscription(body);
      router.back();
    } catch (e) {
      if (e instanceof ApiError && e.code === 'PREMIUM_REQUIRED') {
        Alert.alert('Upgrade required', e.message, [
          { text: 'Not now', style: 'cancel' },
          { text: 'See Premium', onPress: () => router.replace('/premium') },
        ]);
      } else {
        setError(e instanceof Error ? e.message : 'Could not save');
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (!id) return;
    Alert.alert('Delete subscription', `Remove ${name || 'this subscription'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteSubscription(id);
            router.back();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: editing ? 'Edit subscription' : 'New subscription' }} />
      <Input label="Name" value={name} onChangeText={setName} placeholder="Netflix" maxLength={60} />
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />

      <View style={styles.group}>
        <Text style={styles.label}>Billing cycle</Text>
        <Chips options={cycleOptions} value={cycle} onChange={setCycle} />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Category</Text>
        <Chips options={categoryOptions} value={category} onChange={setCategory} />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Next billing date</Text>
        <Pressable style={styles.dateButton} onPress={() => setShowPicker((value) => !value)}>
          <Text style={styles.dateText}>{formatDate(localDateToIso(date))}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            themeVariant="dark"
            onChange={(_event, selected) => {
              if (Platform.OS === 'android') setShowPicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}
      </View>

      <Input
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={300}
        style={styles.notes}
        placeholder="Plan details, login email, cancel link"
      />

      {editing && (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Active</Text>
          <Switch value={active} onValueChange={setActive} trackColor={{ true: colors.primary }} />
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button title={editing ? 'Save changes' : 'Add subscription'} onPress={save} loading={saving} />
      {editing && <Button title="Delete" variant="danger" onPress={remove} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 18, paddingBottom: 40 },
  group: { gap: 8 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  dateButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dateText: { color: colors.text, fontSize: 16 },
  notes: { height: 90, paddingTop: 14, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  error: { color: colors.danger, fontSize: 14 },
});
