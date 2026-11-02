import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth';
import { Button } from '../../src/components/Button';
import { Chips } from '../../src/components/Chips';
import { Input } from '../../src/components/Input';
import { formatDate } from '../../src/format';
import { colors, currencies, radius } from '../../src/theme';

const reminderOptions = [0, 1, 3, 7].map((value) => ({
  value,
  label: value === 0 ? 'Same day' : value === 1 ? '1 day' : `${value} days`,
}));

export default function Settings() {
  const router = useRouter();
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const run = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (e) {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : 'Please try again');
    }
  };

  const saveName = async () => {
    setSaving(true);
    await run(() => updateProfile({ name: name.trim() }));
    setSaving(false);
  };

  const confirmDelete = () => {
    Alert.alert('Delete account', 'This permanently deletes your account and all subscriptions.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => run(deleteAccount) },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Input label="Name" value={name} onChangeText={setName} />
        <Text style={styles.email}>{user.email}</Text>
        <Button
          title="Save name"
          variant="ghost"
          onPress={saveName}
          loading={saving}
          disabled={!name.trim() || name.trim() === user.name}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Currency</Text>
        <Chips
          options={currencies.map((value) => ({ value, label: value }))}
          value={user.currency}
          onChange={(currency) => run(() => updateProfile({ currency }))}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Remind me before renewal</Text>
        <Chips
          options={reminderOptions}
          value={user.reminderDaysBefore}
          onChange={(reminderDaysBefore) => run(() => updateProfile({ reminderDaysBefore }))}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Plan</Text>
        <Text style={styles.email}>
          {user.premium && user.premiumUntil
            ? `Premium until ${formatDate(user.premiumUntil)}`
            : 'Free plan'}
        </Text>
        <Button title={user.premium ? 'Extend Premium' : 'Upgrade to Premium'} onPress={() => router.push('/premium')} />
      </View>

      <Button title="Log out" variant="ghost" onPress={() => run(logout)} />
      <Button title="Delete account" variant="danger" onPress={confirmDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 14, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  email: { color: colors.muted, fontSize: 14 },
});
