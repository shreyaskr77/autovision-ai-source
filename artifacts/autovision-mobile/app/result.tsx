import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useColors } from '@/hooks/useColors';
import { useScan } from '@/context/ScanContext';

export default function ResultScreen() {
  const colors = useColors();
  const router = useRouter();
  const { image, result, saveCurrentScan } = useScan();
  const [saved, setSaved] = useState(false);

  if (!image || !result) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="activity" size={42} color={colors.mutedForeground} />
        <Text style={[styles.title, { color: colors.foreground }]}>No result to show</Text>
        <PrimaryButton label="Start a new scan" icon="camera" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const vehicle = result.vehicles[0];
  const save = async () => {
    await saveCurrentScan();
    setSaved(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable accessibilityLabel="Back to home" onPress={() => router.replace('/')} style={[styles.iconButton, { backgroundColor: colors.card }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>Analysis result</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={[styles.imageFrame, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image source={{ uri: image.uri }} style={styles.image} resizeMode="cover" />
        {vehicle && (
          <View style={[styles.boundingBox, { borderColor: colors.primary, left: `${vehicle.bounding_box.x * 100}%`, top: `${vehicle.bounding_box.y * 100}%`, width: `${vehicle.bounding_box.width * 100}%`, height: `${vehicle.bounding_box.height * 100}%` }]} />
        )}
      </View>
      <View style={styles.heading}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>SCAN COMPLETE</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{vehicle ? `${vehicle.make} ${vehicle.model}` : 'Recognition unavailable'}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          {vehicle ? 'Vehicle details were returned by the configured models.' : result.error ?? 'No vehicle could be identified from this image.'}
        </Text>
      </View>
      {vehicle ? (
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Detail label="Make" value={vehicle.make} colors={colors} />
          <Detail label="Model" value={vehicle.model} colors={colors} />
          <Detail label="Colour" value={vehicle.colour} colors={colors} swatch={vehicle.colour_hex} />
          <Detail label="Detection confidence" value={`${Math.round(vehicle.detection_confidence * 100)}%`} colors={colors} />
          <Detail label="Classification confidence" value={`${Math.round(vehicle.classification_confidence * 100)}%`} colors={colors} />
        </View>
      ) : (
        <View style={[styles.unavailable, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statusIcon, { backgroundColor: colors.accent }]}>
            <Feather name="cpu" size={20} color={colors.accentForeground} />
          </View>
          <Text style={[styles.unavailableTitle, { color: colors.foreground }]}>Model weights required</Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            The app will not invent a make or model. Install the detector and classifier weights described in the backend README to unlock vehicle recognition.
          </Text>
        </View>
      )}
      <PrimaryButton label={saved ? 'Saved to history' : 'Save result'} icon={saved ? 'check' : 'bookmark'} onPress={save} disabled={saved} secondary={saved} />
      <PrimaryButton label="Analyze another image" icon="refresh-cw" onPress={() => router.replace('/')} secondary />
      <Text style={[styles.footnote, { color: colors.mutedForeground }]}>Processed in {result.processing_time_ms} ms · Results can vary with image quality and lighting.</Text>
    </ScrollView>
  );
}

function Detail({ label, value, colors, swatch }: { label: string; value: string; colors: ReturnType<typeof useColors>; swatch?: string }) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.detailValueRow}>
        {swatch && <View style={[styles.swatch, { backgroundColor: swatch }]} />}
        <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, padding: 22, paddingBottom: 48 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  iconButton: { alignItems: 'center', borderRadius: 14, height: 40, justifyContent: 'center', width: 40 },
  topTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  imageFrame: { aspectRatio: 1.18, borderRadius: 22, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  image: { height: '100%', width: '100%' },
  boundingBox: { borderRadius: 8, borderWidth: 2, position: 'absolute' },
  heading: { gap: 7 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.3 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 27, letterSpacing: -0.8 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  detailCard: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 16 },
  detailRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  detailValueRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  swatch: { borderRadius: 8, height: 16, width: 16 },
  unavailable: { borderRadius: 18, borderWidth: 1, gap: 10, padding: 18 },
  statusIcon: { alignItems: 'center', borderRadius: 12, height: 40, justifyContent: 'center', width: 40 },
  unavailableTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  footnote: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  centered: { alignItems: 'center', flex: 1, gap: 14, justifyContent: 'center', padding: 24 },
});