import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useScan } from '@/context/ScanContext';

export default function HistoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { history, setImage, setResult, deleteScan, clearHistory, isHydrated } = useScan();

  const confirmClear = () => Alert.alert('Clear scan history?', 'This removes all saved results from this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear all', style: 'destructive', onPress: () => void clearHistory() },
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: colors.primary }]}>ARCHIVE</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Scan history</Text>
        </View>
        {history.length > 0 && <Pressable onPress={confirmClear}><Text style={[styles.clear, { color: colors.destructive }]}>Clear all</Text></Pressable>}
      </View>
      {!isHydrated ? null : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={history.length === 0 ? styles.emptyList : styles.list}
          scrollEnabled={history.length > 0}
          ListEmptyComponent={
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="clock" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved scans yet</Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Save an analysis to build a private history on this device.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const vehicle = item.result.vehicles[0];
            return (
              <Pressable onPress={() => { setImage(item.image); setResult(item.result); router.push('/result'); }} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: item.image.uri }} style={styles.image} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>{vehicle ? `${vehicle.make} ${vehicle.model}` : 'Recognition unavailable'}</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>{new Date(item.savedAt).toLocaleDateString()} · {vehicle?.colour ?? 'Pending model weights'}</Text>
                </View>
                <Pressable accessibilityLabel="Delete scan" hitSlop={10} onPress={() => void deleteScan(item.id)} style={styles.delete}>
                  <Feather name="trash-2" size={17} color={colors.mutedForeground} />
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 28 },
  header: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 19 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.3, marginBottom: 6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -1 },
  clear: { fontFamily: 'Inter_600SemiBold', fontSize: 13, paddingBottom: 4 },
  list: { gap: 10, paddingBottom: 40 },
  emptyList: { flex: 1, justifyContent: 'center', paddingBottom: 70 },
  empty: { alignItems: 'center', borderRadius: 19, borderWidth: 1, gap: 9, paddingHorizontal: 25, paddingVertical: 30 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  card: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 10 },
  image: { borderRadius: 11, height: 64, width: 78 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  delete: { padding: 7 },
});