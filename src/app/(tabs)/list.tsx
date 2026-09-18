import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { useAppTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import CountryFlag from "@/components/CountryFlag";
import { getAllCountries } from "@/data/data";
import { useRouter } from "expo-router";

const REGIONS = ["all", "africa", "americas", "asia", "europe", "oceania"] as const;

export default function ListScreen() {
  const { theme } = useAppTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [activeRegion, setActiveRegion] = useState<(typeof REGIONS)[number]>("all");

  const allCountries = useMemo(() => getAllCountries(), []);

  const filtered = useMemo(() => {
    const sorted = [...allCountries].sort((a, b) => a.name.common.localeCompare(b.name.common));
    if (activeRegion === "all") return sorted;
    return sorted.filter((c) => c.region.toLowerCase() === activeRegion);
  }, [allCountries, activeRegion]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Header seenCount={allCountries.length} totalCount={allCountries.length} />

      <View style={[styles.filterRow, isRTL && styles.rowReverse]}>
        {REGIONS.map((region) => {
          const active = activeRegion === region;
          return (
            <Pressable
              key={region}
              onPress={() => setActiveRegion(region)}
              style={[
                styles.filterPill,
                { backgroundColor: active ? theme.colors.pillActiveBackground : theme.colors.pillBackground },
              ]}
            >
              <Text
                style={{
                  color: active ? theme.colors.pillActiveText : theme.colors.textSecondary,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {t(region)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Virtualized: FlashList only mounts/recycles what's on screen, unlike
          FlatList measuring all ~250 rows up front */}
      <View style={{ flex: 1 }}>
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.cca3}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }} />
          )}
          renderItem={({ item }: ListRenderItemInfo<ReturnType<typeof getAllCountries>[number]>) => (
            <CountryRow country={item} theme={theme} isRTL={isRTL} t={t} onPress={() => router.push({ pathname: "/(tabs)" })} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function CountryRow({
  country,
  theme,
  isRTL,
  t,
  onPress,
}: {
  country: any;
  theme: any;
  isRTL: boolean;
  t: (k: any) => string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, isRTL && styles.rowReverse]}>
      <CountryFlag cca2={country.cca2} size={26} />
      <View style={{ flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }}>
        <Text style={[styles.countryName, { color: theme.colors.text }]} numberOfLines={1}>
          {country.name.common}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }} numberOfLines={1}>
          {(country.capital || []).join(", ") || "—"} · {t("density")}{" "}
          {country.density !== undefined ? `${country.density}/km²` : "—"}
        </Text>
      </View>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
        {country.population ? country.population.toLocaleString() : "—"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  rowReverse: { flexDirection: "row-reverse" },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  countryName: { fontSize: 15, fontWeight: "700" },
});