import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export const Chips = <T extends string | number>({ options, value, onChange }: Props<T>) => (
  <View style={styles.row}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Pressable
          key={String(option.value)}
          onPress={() => onChange(option.value)}
          style={[styles.chip, selected && styles.selected]}
        >
          <Text style={[styles.text, selected && styles.selectedText]}>{option.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  selectedText: { color: colors.primaryText },
});
