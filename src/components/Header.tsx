import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import ThemeLanguageMenu from "./ThemeLanguageMenu";
import CountryFlag from "./CountryFlag";
import { Country, searchCountries } from "@/data/countries";
import { useRouter, usePathname } from "expo-router";

interface HeaderProps {
  seenCount?: number;
  totalCount?: number;
  onSurpriseMe?: () => void;
  onSelectCountry?: (country: Country) => void;
}

export default function Header({
  seenCount,
  totalCount,
  onSurpriseMe,
  onSelectCountry,
}: HeaderProps) {
  const { theme } = useAppTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const [menuVisible, setMenuVisible] = useState(false);
  const [query, setQuery] = useState("");
  const results = query.length > 0 ? searchCountries(query) : [];

  const activeTab: "explore" | "list" | "quiz" = pathname.includes("/list")
    ? "list"
    : pathname.includes("/quiz")
    ? "quiz"
    : "explore";

  const goTo = (tab: "explore" | "list" | "quiz") => {
    if (tab === "explore") router.push("/(tabs)");
    if (tab === "list") router.push("/(tabs)/list");
    if (tab === "quiz") router.push("/(tabs)/quiz");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top row: brand + menu icon */}
      <View style={[styles.topRow, isRTL && styles.rowReverse]}>
        <View style={[styles.brandRow, isRTL && styles.rowReverse]}>
          <View style={[styles.logoCircle, { borderColor: theme.colors.accent }]}>
            <Ionicons name="globe-outline" size={20} color={theme.colors.accent} />
          </View>
          <View style={{ marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}>
            <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
              {t("appName")}
            </Text>
            <Text style={[styles.brandTagline, { color: theme.colors.textMuted }]}>
              {t("tagline")}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setMenuVisible(true)}
          style={[styles.menuButton, { borderColor: theme.colors.border }]}
          hitSlop={8}
        >
          <Ionicons name="menu" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: theme.colors.textSecondary }, isRTL && styles.textRTL]}>
        {t("descriptionLine1")} {t("descriptionLine2")}{" "}
        <Text
          onPress={() => router.push("/about")}
          style={{ color: theme.colors.accent, fontWeight: "700" }}
        >
          {t("moreInfo")}
        </Text>
      </Text>

      {/* Search Bar Wrapper */}
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.colors.inputBackground || theme.colors.surface,
              borderColor: theme.colors.inputBorder || theme.colors.border,
            },
            isRTL && styles.rowReverse,
          ]}
        >
          <Ionicons name="search" size={16} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.searchInput,
              { color: theme.colors.text, textAlign: isRTL ? "right" : "left" },
            ]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </Pressable>
          )}
        </View>

        {results.length > 0 && (
          <View
            style={[
              styles.resultsBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            {results.slice(0, 8).map((item) => (
              <Pressable
                key={item.cca3}
                style={[styles.resultRow, isRTL && styles.rowReverse]}
                onPress={() => {
                  setQuery("");
                  onSelectCountry?.(item);
                }}
              >
                <CountryFlag cca2={item.cca2} size={18} />
                <Text
                  style={{
                    color: theme.colors.text,
                    marginLeft: isRTL ? 0 : 10,
                    marginRight: isRTL ? 10 : 0,
                    fontWeight: "600",
                  }}
                >
                  {item.name.common}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Pills + Surprise me */}
      <View style={[styles.actionsRow, isRTL && styles.rowReverse]}>
        <View style={[styles.pillGroup, { backgroundColor: theme.colors.pillBackground }]}>
          {(["explore", "list", "quiz"] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => goTo(tab)}
                style={[
                  styles.pill,
                  active && { backgroundColor: theme.colors.pillActiveBackground || theme.colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.pillLabel,
                    { color: active ? (theme.colors.pillActiveText || "#FFFFFF") : theme.colors.textSecondary },
                  ]}
                >
                  {t(tab)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {onSurpriseMe && (
          <Pressable
            onPress={onSurpriseMe}
            style={[styles.surpriseButton, { backgroundColor: theme.colors.text }]}
          >
            <Ionicons name="shuffle" size={16} color={theme.colors.background} />
            <Text style={[styles.surpriseLabel, { color: theme.colors.background }]}>
              {t("surpriseMe")}
            </Text>
          </Pressable>
        )}
      </View>

      {typeof seenCount === "number" && typeof totalCount === "number" && (
        <Text style={[styles.seenCount, { color: theme.colors.textMuted }, isRTL && styles.textRTL]}>
          {t("seenOf", { total: totalCount }).replace("{total}", String(totalCount))} · {seenCount}
        </Text>
      )}

      <ThemeLanguageMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  rowReverse: { flexDirection: "row-reverse" },
  textRTL: { textAlign: "right", writingDirection: "rtl" },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logoCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  brandTitle: { fontSize: 18, fontWeight: "800" },
  brandTagline: { fontSize: 11, fontWeight: "600" },
  menuButton: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  searchWrapper: { position: "relative", zIndex: 99, marginBottom: 14 },
  searchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, height: "100%" },
  resultsBox: { position: "absolute", top: 48, left: 0, right: 0, borderWidth: 1, borderRadius: 12, maxHeight: 220, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, zIndex: 100 },
  resultRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(150,150,150,0.2)" },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  pillGroup: { flexDirection: "row", borderRadius: 12, padding: 3, gap: 2 },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 9 },
  pillLabel: { fontSize: 12, fontWeight: "700" },
  surpriseButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  surpriseLabel: { fontSize: 12, fontWeight: "700" },
  seenCount: { fontSize: 11, fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
});