import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { useColors } from '@/hooks/useColors';

const steps = [
  ['upload-cloud', 'Image preprocessing', 'Orientation and format checks prepare your image for analysis.'],
  ['target', 'Vehicle detection', 'A configured detector locates each vehicle and draws its bounding box.'],
  ['cpu', 'Make and model', 'A separately trained classifier provides predictions only when its weights are available.'],
  ['droplet', 'Colour estimation', 'Colour sampling is sensitive to lighting, reflections, glass, and shadows.'],
] as const;

export default function AboutScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>About AutoVision</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.brand}>
        <BrandMark />
        <Text style={[styles.title, { color: colors.foreground }]}>Discover every detail.</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>A transparent vehicle recognition tool built to show what the models know — and what they don’t.</Text>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How it works</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {steps.map(([icon, title, description]) => (
          <View key={title} style={styles.step}>
            <View style={[styles.stepIcon, { backgroundColor: colors.accent }]}>
              <Feather name={icon} size={18} color={colors.accentForeground} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>{title}</Text>
              <Text style={[styles.body, { color: colors.mutedForeground }]}>{description}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Limitations</Text>
      <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="info" size={18} color={colors.primary} />
        <Text style={[styles.body, { color: colors.mutedForeground }]}>Image-based recognition depends on angle, resolution, lighting, occlusion, and the classes represented in the training data. AutoVision does not identify exact model years unless the classifier was trained for that task.</Text>
      </View>
      <Text style={[styles.version, { color: colors.mutedForeground }]}>AutoVision AI · Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, padding: 22, paddingBottom: 56 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  iconButton: { alignItems: 'center', borderRadius: 14, height: 40, justifyContent: 'center', width: 40 },
  topTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  brand: { gap: 14, paddingBottom: 8, paddingTop: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.8 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 5 },
  card: { borderRadius: 18, borderWidth: 1, gap: 19, padding: 17 },
  step: { alignItems: 'flex-start', flexDirection: 'row', gap: 13 },
  stepIcon: { alignItems: 'center', borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  stepTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  note: { alignItems: 'flex-start', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 11, padding: 16 },
  version: { fontFamily: 'Inter_500Medium', fontSize: 12, textAlign: 'center' },
});