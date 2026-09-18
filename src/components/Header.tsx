import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
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

      {/* Search */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
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
          <FlatList
            data={results.slice(0, 8)}
            keyExtractor={(item) => item.cca3}
            renderItem={({ item }) => (
              <Pressable
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
                  }}
                >
                  {item.name.common}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

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
                  active && { backgroundColor: theme.colors.pillActiveBackground },
                ]}
              >
                <Text
                  style={[
                    styles.pillLabel,
                    { color: active ? theme.colors.pillActiveText : theme.colors.textSecondary },
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
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  brandTagline: {
    fontSize: 12,
    fontStyle: "italic",
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  textRTL: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  resultsBox: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 220,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    flexWrap: "wrap",
    gap: 10,
  },
  pillGroup: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 17,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  surpriseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  surpriseLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  seenCount: {
    fontSize: 12,
    marginTop: 10,
  },
});
