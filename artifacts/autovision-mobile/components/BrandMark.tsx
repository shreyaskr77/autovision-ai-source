import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { backgroundColor: colors.primary }]}>
        <Feather name="aperture" size={compact ? 16 : 19} color={colors.primaryForeground} />
      </View>
      {!compact && <Text style={[styles.wordmark, { color: colors.foreground }]}>AutoVision <Text style={{ color: colors.primary }}>AI</Text></Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  mark: { alignItems: 'center', borderRadius: 12, height: 38, justifyContent: 'center', width: 38 },
  wordmark: { fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: -0.3 },
});