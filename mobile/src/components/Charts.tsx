import { StyleSheet, Text, View } from 'react-native';
import { formatMoney, monthLabel } from '../format';
import { categoryColors, colors, radius } from '../theme';

export const BarChart = ({ data, currency }: { data: { month: string; total: number }[]; currency: string }) => {
  const max = Math.max(...data.map((item) => item.total), 1);
  return (
    <View style={styles.chart}>
      {data.map((item) => (
        <View key={item.month} style={styles.column}>
          <Text style={styles.value} numberOfLines={1}>
            {item.total > 0 ? formatMoney(item.total, currency).replace(/\.00$/, '') : '-'}
          </Text>
          <View style={styles.track}>
            <View style={[styles.bar, { height: `${Math.max((item.total / max) * 100, 2)}%` }]} />
          </View>
          <Text style={styles.label}>{monthLabel(item.month)}</Text>
        </View>
      ))}
    </View>
  );
};

export const CategoryBars = ({
  data,
  currency,
}: {
  data: { category: string; monthly: number }[];
  currency: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.monthly, 0) || 1;
  return (
    <View style={styles.list}>
      {data.map((item) => {
        const tint = categoryColors[item.category] ?? colors.muted;
        return (
          <View key={item.category} style={styles.row}>
            <View style={styles.rowHead}>
              <Text style={styles.rowName}>{item.category}</Text>
              <Text style={styles.rowValue}>{formatMoney(item.monthly, currency)}</Text>
            </View>
            <View style={styles.rail}>
              <View style={[styles.fill, { width: `${(item.monthly / total) * 100}%`, backgroundColor: tint }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 180, gap: 8 },
  column: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  value: { color: colors.muted, fontSize: 10 },
  track: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: colors.primary, borderRadius: radius.sm },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  list: { gap: 14 },
  row: { gap: 6 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between' },
  rowName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  rowValue: { color: colors.muted, fontSize: 14 },
  rail: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
