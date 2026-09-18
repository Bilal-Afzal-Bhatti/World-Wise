import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

/** Converts an ISO alpha-2 code ("MG") into its regional-indicator flag emoji (🇲🇬) */
export function cca2ToFlagEmoji(cca2: string): string {
  return cca2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

interface CountryFlagProps {
  cca2: string;
  size?: number;
  style?: ViewStyle;
}

/**
 * Renders a country flag. Uses the emoji flag as a lightweight, dependency-free
 * fallback. To use the real flag-icons SVGs (assets/flags/4x3/{cca2}.svg per
 * the spec), swap this for react-native-svg's SvgUri/SvgXml pointed at the
 * bundled asset for `cca2`.
 */
export default function CountryFlag({ cca2, size = 48, style }: CountryFlagProps) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.container,
        {
          width: size * 1.4,
          height: size,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.7 }}>{cca2ToFlagEmoji(cca2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
