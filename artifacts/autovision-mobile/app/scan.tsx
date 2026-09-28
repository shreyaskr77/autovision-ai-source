import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { analyzeImage, type AnalysisResponse } from '@workspace/api-client-react';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useColors } from '@/hooks/useColors';
import { useScan } from '@/context/ScanContext';

export default function ScanScreen() {
  const colors = useColors();
  const router = useRouter();
  const { image, setImage, setResult } = useScan();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!image || isAnalyzing) return;
    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage({
        image: { uri: image.uri, name: image.name, type: image.type } as unknown as Blob,
      });
      setResult(result as AnalysisResponse);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/result');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The analysis service could not process this image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!image) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="image" size={42} color={colors.mutedForeground} />
        <Text style={[styles.title, { color: colors.foreground }]}>No image selected</Text>
        <PrimaryButton label="Back to home" icon="arrow-left" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable accessibilityLabel="Close image preview" onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card }]}>
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>Image preview</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={[styles.previewFrame, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />
      </View>
      <View style={styles.heading}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>READY TO SCAN</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Review your image</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>We’ll validate the image and send it to the AutoVision analysis service.</Text>
      </View>
      {error && (
        <View style={[styles.error, { backgroundColor: colors.card, borderColor: colors.destructive }]}>
          <Feather name="alert-circle" size={18} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.foreground }]}>{error}</Text>
        </View>
      )}
      {isAnalyzing ? (
        <View style={[styles.processing, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.processingTitle, { color: colors.foreground }]}>Analyzing image</Text>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>Validating upload and checking available models…</Text>
          </View>
        </View>
      ) : (
        <PrimaryButton label="Analyze vehicle" icon="cpu" onPress={runAnalysis} />
      )}
      <Pressable
        disabled={isAnalyzing}
        onPress={() => {
          setImage(null);
          router.replace('/');
        }}
        style={styles.replace}
      >
        <Text style={[styles.replaceText, { color: colors.mutedForeground }]}>Choose a different image</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, padding: 22, paddingBottom: 48 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  iconButton: { alignItems: 'center', borderRadius: 14, height: 40, justifyContent: 'center', width: 40 },
  topTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  previewFrame: { aspectRatio: 1.18, borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
  preview: { height: '100%', width: '100%' },
  heading: { gap: 7, paddingTop: 5 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.3 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.8 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  error: { alignItems: 'flex-start', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 14 },
  errorText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 19 },
  processing: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 13, padding: 16 },
  processingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginBottom: 3 },
  replace: { alignItems: 'center', padding: 6 },
  replaceText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  centered: { alignItems: 'center', flex: 1, gap: 14, justifyContent: 'center', padding: 24 },
});