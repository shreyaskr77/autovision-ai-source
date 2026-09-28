import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function PrimaryButton({
  label,
  icon,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: secondary ? colors.secondary : colors.primary, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 },
      ]}
    >
      <Feather name={icon} size={18} color={secondary ? colors.secondaryForeground : colors.primaryForeground} />
      <Text style={[styles.label, { color: secondary ? colors.secondaryForeground : colors.primaryForeground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 10, justifyContent: 'center', minHeight: 54, paddingHorizontal: 18 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});