import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeName } from "@/constants/themes";
import { LanguageCode } from "@/constants/translations";

interface ThemeLanguageMenuProps {
  visible: boolean;
  onClose: () => void;
}

type Section = "root" | "theme" | "language";

export default function ThemeLanguageMenu({ visible, onClose }: ThemeLanguageMenuProps) {
  const { theme, themeName, setThemeName, availableThemes } = useAppTheme();
  const { languageCode, setLanguageCode, availableLanguages, t } = useLanguage();
  const router = useRouter();
  const [section, setSection] = useState<Section>("root");

  const close = () => {
    setSection("root");
    onClose();
  };

  const goToAbout = () => {
    close();
    router.push("/about");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {section === "root" && (
            <>
              <MenuRow
                icon="color-palette-outline"
                label={t("theme")}
                value={availableThemes.find((th) => th.name === themeName)?.label}
                onPress={() => setSection("theme")}
                textColor={theme.colors.text}
                mutedColor={theme.colors.textMuted}
                borderColor={theme.colors.border}
              />
              <MenuRow
                icon="language-outline"
                label={t("language")}
                value={availableLanguages.find((l) => l.code === languageCode)?.nativeLabel}
                onPress={() => setSection("language")}
                textColor={theme.colors.text}
                mutedColor={theme.colors.textMuted}
                borderColor={theme.colors.border}
              />
              <Pressable onPress={goToAbout} style={styles.rootRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={theme.colors.text}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.rootLabel, { color: theme.colors.text }]}>
                  About
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </Pressable>
            </>
          )}

          {section === "theme" && (
            <>
              <BackRow
                label={t("theme")}
                onPress={() => setSection("root")}
                textColor={theme.colors.text}
              />
              {availableThemes.map((th, i) => (
                <Pressable
                  key={th.name}
                  onPress={() => {
                    setThemeName(th.name as ThemeName);
                    close();
                  }}
                  style={[
                    styles.optionRow,
                    i < availableThemes.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={[styles.swatch, { backgroundColor: th.swatch }]} />
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: theme.colors.text },
                      th.name === themeName && { fontWeight: "700" },
                    ]}
                  >
                    {th.label}
                  </Text>
                  {th.name === themeName && (
                    <Ionicons name="checkmark" size={18} color={theme.colors.accent} />
                  )}
                </Pressable>
              ))}
            </>
          )}

          {section === "language" && (
            <>
              <BackRow
                label={t("language")}
                onPress={() => setSection("root")}
                textColor={theme.colors.text}
              />
              {availableLanguages.map((lang, i) => (
                <Pressable
                  key={lang.code}
                  onPress={() => {
                    setLanguageCode(lang.code as LanguageCode);
                    close();
                  }}
                  style={[
                    styles.optionRow,
                    i < availableLanguages.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={styles.flagEmoji}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: theme.colors.text },
                      lang.code === languageCode && { fontWeight: "700" },
                    ]}
                  >
                    {lang.nativeLabel}
                  </Text>
                  {lang.code === languageCode && (
                    <Ionicons name="checkmark" size={18} color={theme.colors.accent} />
                  )}
                </Pressable>
              ))}
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MenuRow({
  icon,
  label,
  value,
  onPress,
  textColor,
  mutedColor,
  borderColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.rootRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor }]}
    >
      <Ionicons name={icon} size={18} color={textColor} style={{ marginRight: 10 }} />
      <Text style={[styles.rootLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.rootValue, { color: mutedColor }]} numberOfLines={1}>
        {value}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={mutedColor} />
    </Pressable>
  );
}

function BackRow({
  label,
  onPress,
  textColor,
}: {
  label: string;
  onPress: () => void;
  textColor: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.backRow}>
      <Ionicons name="chevron-back" size={18} color={textColor} />
      <Text style={[styles.backLabel, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "flex-end",
    paddingTop: 90,
    paddingRight: 16,
  },
  sheet: {
    width: 240,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  rootRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rootLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  rootValue: {
    fontSize: 13,
    marginRight: 6,
    maxWidth: 80,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  flagEmoji: {
    fontSize: 18,
  },
});