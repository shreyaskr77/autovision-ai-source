import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useColors } from '@/hooks/useColors';
import { useScan } from '@/context/ScanContext';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { history, setImage, setResult } = useScan();

  const pick = async (camera: boolean) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(camera ? 'Camera access needed' : 'Photo access needed', 'Allow access in Settings to choose an image for analysis.');
      return;
    }
    const response = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (response.canceled || !response.assets[0]) return;
    const asset = response.assets[0];
    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
      Alert.alert('Image is too large', 'Choose an image smaller than 10 MB.');
      return;
    }
    setImage({ uri: asset.uri, name: asset.fileName ?? `vehicle-${Date.now()}.jpg`, type: asset.mimeType ?? 'image/jpeg' });
    setResult(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/scan');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BrandMark />
        <Pressable accessibilityLabel="About AutoVision" onPress={() => router.push('/about')} style={[styles.headerButton, { backgroundColor: colors.card }]}>
          <Feather name="info" size={19} color={colors.foreground} />
        </Pressable>
      </View>
      <View style={styles.hero}>
        <Text style={[styles.kicker, { color: colors.primary }]}>AI-POWERED VEHICLE INSIGHT</Text>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>Identify{'\n'}any car.</Text>
        <Text style={[styles.heroBody, { color: colors.mutedForeground }]}>Capture a vehicle or choose an image to reveal what AutoVision can recognize.</Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="Upload an image" icon="upload-cloud" onPress={() => pick(false)} />
        <PrimaryButton label="Capture a photo" icon="camera" onPress={() => pick(true)} secondary />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent scans</Text>
        {history.length > 0 && <Pressable onPress={() => router.push('/history')}><Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text></Pressable>}
      </View>
      {history.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
            <Feather name="layers" size={22} color={colors.accentForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your scan history is empty</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Results you save will appear here for quick reference.</Text>
        </View>
      ) : (
        <View style={styles.recentList}>
          {history.slice(0, 2).map((scan) => (
            <Pressable key={scan.id} onPress={() => { setImage(scan.image); setResult(scan.result); router.push('/result'); }} style={[styles.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={{ uri: scan.image.uri }} style={styles.thumb} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.recentTitle, { color: colors.foreground }]} numberOfLines={1}>{scan.result.vehicles[0] ? `${scan.result.vehicles[0].make} ${scan.result.vehicles[0].model}` : 'Recognition unavailable'}</Text>
                <Text style={[styles.recentMeta, { color: colors.mutedForeground }]}>{new Date(scan.savedAt).toLocaleDateString()}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      )}
      <View style={[styles.trust, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="shield" size={16} color={colors.primary} />
        <Text style={[styles.trustText, { color: colors.mutedForeground }]}>AutoVision never invents a prediction when the model is unsure.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 22, padding: 22, paddingBottom: 48 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  headerButton: { alignItems: 'center', borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  hero: { gap: 12, paddingTop: 30 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.3 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 48, letterSpacing: -2.2, lineHeight: 51 },
  heroBody: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, maxWidth: 330 },
  actions: { gap: 10, paddingTop: 6 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  empty: { alignItems: 'center', borderRadius: 19, borderWidth: 1, gap: 8, paddingHorizontal: 24, paddingVertical: 27 },
  emptyIcon: { alignItems: 'center', borderRadius: 14, height: 48, justifyContent: 'center', marginBottom: 5, width: 48 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  recentList: { gap: 10 },
  recentCard: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 10 },
  thumb: { borderRadius: 11, height: 54, width: 64 },
  recentTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  recentMeta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  trust: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 9, padding: 13 },
  trustText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
});
