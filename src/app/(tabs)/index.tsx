import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useAppTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import CountryFlag from "@/components/CountryFlag";
import WorldMap from "@/components/WorldMap";
import { getAllCountries, getCountryByCode, getRandomCountry } from "@/data/data";
import Animated , {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withDecay,
  runOnJS,
} from "react-native-reanimated";

function getCurrencies(raw: any): { code: string; name: string; symbol: string }[] {
  if (!raw.currencies) return [];
  return Object.entries(raw.currencies).map(([code, val]: [string, any]) => ({
    code,
    name: val?.name || code,
    symbol: val?.symbol || "",
  }));
}

function getLanguages(raw: any): string[] {
  return raw.languages ? (Object.values(raw.languages) as string[]) : [];
}

function getGovernment(raw: any): { form: string; system: string } {
  const gov = raw.government;
  if (typeof gov === "string") {
    const parts = gov.split("·");
    return {
      form: parts[0]?.trim() || "Republic / State",
      system: parts[1]?.trim() || "Standard governance",
    };
  }
  return {
    form: gov?.form || (raw.unMember ? "Republic / State" : "Territory"),
    system: gov?.system || (raw.independent ? "Standard governance" : "Dependent territory"),
  };
}

function getCallingCodes(raw: any): string[] {
  if (!raw.idd?.root) return [];
  return raw.idd.suffixes?.length > 0
    ? raw.idd.suffixes.map((s: string) => `${raw.idd.root}${s}`)
    : [raw.idd.root];
}

function getNeighbours(raw: any): any[] {
  const codes: string[] = raw.borders || [];
  return codes.map((code) => getCountryByCode(code)).filter(Boolean);
}

function getDensity(raw: any): number | undefined {
  if (!raw.population || !raw.area) return undefined;
  return Math.round(raw.population / raw.area);
}

export default function ExploreScreen() {
  const { theme } = useAppTheme();
  const { t, isRTL } = useLanguage();
  const [country, setCountry] = useState<any>(() => getAllCountries()[0]);
  const [favorite, setFavorite] = useState(false);
  const [mapScope, setMapScope] = useState<"world" | "continent" | "region">("region");
const scale = useSharedValue(2.2);
const savedScale = useSharedValue(2.2);
const translateX = useSharedValue(-100);
const translateY = useSharedValue(-50);
const savedTranslateX = useSharedValue(-100);
const savedTranslateY = useSharedValue(-50);

// Clamp so the map can't be zoomed/panned into empty space forever
const MIN_SCALE = 1;
const MAX_SCALE = 6;

const handleScopeChange = (scope: "world" | "continent" | "region") => {
  setMapScope(scope);
  let targetScale = 2.2;
  let targetX = -100;
  let targetY = -50;

  if (scope === "world") {
    targetScale = 1;
    targetX = 0;
    targetY = 0;
  } else if (scope === "continent") {
    targetScale = 1.5;
    targetX = -40;
    targetY = -20;
  }

  const config = { duration: 400, easing: Easing.inOut(Easing.ease) };
  scale.value = withTiming(targetScale, config);
  savedScale.value = targetScale;
  translateX.value = withTiming(targetX, config);
  savedTranslateX.value = targetX;
  translateY.value = withTiming(targetY, config);
  savedTranslateY.value = targetY;
};

// Pinch: zooms around the actual pinch focal point, not the map's origin —
// this is the technique that makes zooming feel "locked" under your fingers
// instead of drifting, like Google Maps.
const pinchGesture = Gesture.Pinch()
  .onUpdate((event) => {
    const newScale = Math.max(MIN_SCALE, Math.min(savedScale.value * event.scale, MAX_SCALE));

    // Adjust translate so the point under the pinch (event.focalX/focalY)
    // stays visually fixed as scale changes.
    const scaleDelta = newScale / scale.value;
    translateX.value =
      event.focalX - (event.focalX - translateX.value) * scaleDelta;
    translateY.value =
      event.focalY - (event.focalY - translateY.value) * scaleDelta;

    scale.value = newScale;
  })
  .onEnd(() => {
    savedScale.value = scale.value;
    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  });

// Pan: onEnd now uses withDecay to glide and decelerate using the gesture's
// actual velocity, instead of stopping instantly — this is the single
// biggest thing that makes a map "feel" smooth like Google Maps.
const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    translateX.value = savedTranslateX.value + event.translationX;
    translateY.value = savedTranslateY.value + event.translationY;
  })
  .onEnd((event) => {
    translateX.value = withDecay({
      velocity: event.velocityX,
      deceleration: 0.998, // closer to 1 = glides further; Google Maps-ish feel
    });
    translateY.value = withDecay({
      velocity: event.velocityY,
      deceleration: 0.998,
    });
    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  });

const composedGestures = Gesture.Simultaneous(pinchGesture, panGesture);

const animatedGroupProps = useAnimatedProps(() => ({
  transform: `translate(${translateX.value} ${translateY.value}) scale(${scale.value})`,
}));
const handleResetZoom = () => {
  const config = { duration: 300 };
  scale.value = withTiming(2.2, config);
  savedScale.value = 2.2;
  translateX.value = withTiming(-100, config);
  savedTranslateX.value = -100;
  translateY.value = withTiming(-50, config);
  savedTranslateY.value = -50;
  setMapScope("region");
};
  const selectCountry = (next: any) => {
    setCountry(next);
    setFavorite(false);
  };

  // Tapping a country ON the map resolves the tapped cca3 back to a full record
  const handleMapSelect = (cca3: string) => {
    const found = getCountryByCode(cca3);
    if (found) selectCountry(found);
  };

  const government = getGovernment(country);
  const neighbours = getNeighbours(country);
  const density = getDensity(country);
  const currencies = getCurrencies(country);
  const languages = getLanguages(country);
  const callingCodes = getCallingCodes(country);
  const total = getAllCountries().length;

  const showRandom = () => selectCountry(getRandomCountry());

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Header
        seenCount={total}
        totalCount={total}
        onSurpriseMe={showRandom}
        onSelectCountry={selectCountry}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }, isRTL && styles.rtlText]}>
            {t(country.region?.toLowerCase() as any) || country.region} · {country.subregion}
          </Text>

          <View style={[styles.titleRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{country.name.common}</Text>
            <Pressable onPress={() => setFavorite((f) => !f)} hitSlop={10}>
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={22}
                color={favorite ? theme.colors.accent : theme.colors.textMuted}
              />
            </Pressable>
          </View>
          <Text style={[styles.official, { color: theme.colors.textSecondary }, isRTL && styles.rtlText]}>
            {country.name.official}
          </Text>

          {/* Vertical Stack: Big Flag Card on top, Full-width Interactive Map below */}
          <View style={styles.verticalContainer}>
            {/* Top: Larger Flag Card */}
            <View style={[styles.flagCardContainerLarge, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, isRTL && styles.rowReverse]}>
              <CountryFlag cca2={country.cca2} size={72} />
              <View style={styles.flagTextContainer}>
                <Text style={[styles.flagTitleLarge, { color: theme.colors.text }]}>{country.name.common}</Text>
                <Text style={[styles.cca3TextLarge, { color: theme.colors.textMuted }]}>{country.cca3} · {country.region}</Text>
              </View>
            </View>

            {/* Bottom: Full Interactive Map Card */}
            <View style={[styles.mapCardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.topBar}>
                <Pressable onPress={handleResetZoom} style={[styles.resetButton, { backgroundColor: theme.colors.pillBackground || theme.colors.surface }]}>
                  <Ionicons name="refresh" size={10} color={theme.colors.accent} />
                  <Text style={[styles.resetText, { color: theme.colors.accent }]}>Reset</Text>
                </Pressable>

                <View style={[styles.pillContainer, { backgroundColor: theme.colors.pillBackground || theme.colors.surface }]}>
                  {(["world", "continent", "region"] as const).map((scope) => {
                    const isActive = mapScope === scope;
                    return (
                      <Pressable
                        key={scope}
                        onPress={() => handleScopeChange(scope)}
                        style={[styles.pill, { backgroundColor: isActive ? theme.colors.accent : "transparent" }]}
                      >
                        <Text style={[styles.pillText, { color: isActive ? "#FFFFFF" : theme.colors.textMuted }]}>
                          {scope}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Map: gestures wrap the WorldMap component, which renders real per-country borders from geoPaths.json */}
              <View style={styles.mapContainerLarge}>
                <GestureDetector gesture={composedGestures}>
                  <Animated.View style={styles.gestureWrapper}>
                    <WorldMap
                      selectedCCA3={country.cca3}
                      accentColor={theme.colors.accent}
                      fillColor={theme.colors.card || "#1E293B"}
                      borderColor={theme.colors.border}
                      animatedGroupProps={animatedGroupProps}
                      onSelectCountry={handleMapSelect}
                    />
                  </Animated.View>
                </GestureDetector>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
            {t("population")} · {t("area")}
          </Text>
          <View style={styles.grid}>
            <FactCard theme={theme} label={t("capital")} value={(country.capital || []).join(", ") || "—"} full />
            <FactCard
              theme={theme}
              label={t("population")}
              value={country.population ? country.population.toLocaleString() : "Not available right now"}
            />
            <FactCard
              theme={theme}
              label={t("area")}
              value={country.area ? `${country.area.toLocaleString()} km²` : "Not available right now"}
            />
            <FactCard
              theme={theme}
              label={t("density")}
              value={density !== undefined ? `${density} /km²` : "Not available right now"}
            />
            <FactCard
              theme={theme}
              label={t("founded") || "Founded"}
              value={country.founded ? String(country.founded) : "Not available right now"}
            />
          </View>

          <Section theme={theme} label={t("government")}>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {government.form.charAt(0).toUpperCase() + government.form.slice(1)}
            </Text>
            {government.system ? (
              <Text style={{ color: theme.colors.textSecondary, textTransform: "capitalize", fontSize: 13, marginTop: 2 }}>
                {government.system}
              </Text>
            ) : null}
          </Section>

          <Section theme={theme} label={t("languages")}>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {languages.length > 0 ? languages.join(", ") : "—"}
            </Text>
          </Section>

          <Section theme={theme} label={t("currency")}>
            {currencies.length > 0 ? (
              currencies.map((c) => (
                <Text key={c.code} style={[styles.value, { color: theme.colors.text }]}>
                  {c.name} ({c.code})
                </Text>
              ))
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>—</Text>
            )}
          </Section>

          <Section theme={theme} label={t("callingCode")}>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {callingCodes.length > 0 ? callingCodes.join(", ") : "—"}
            </Text>
          </Section>

          {neighbours.length > 0 && (
            <Section theme={theme} label={t("neighbours")}>
              <View style={[styles.chipsRow, isRTL && styles.rowReverse]}>
                {neighbours.map((n: any) => (
                  <Pressable
                    key={n.cca3}
                    onPress={() => selectCountry(n)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.colors.pillBackground || theme.colors.card, borderColor: theme.colors.border },
                    ]}
                  >
                    <CountryFlag cca2={n.cca2} size={14} />
                    <Text style={{ color: theme.colors.text, marginLeft: 6, fontWeight: "600" }}>
                      {n.name.common}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Section>
          )}

          <Text style={[styles.wikiLink, { color: theme.colors.accent }]}>
            {t("readOnWikipedia")} ↗
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FactCard({ theme, label, value, full }: { theme: any; label: string; value: string; full?: boolean }) {
  return (
    <View
      style={[
        styles.factCard,
        full && styles.factCardFull,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.factLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.factValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

function Section({ theme, label, children }: { theme: any; label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
  rowReverse: { flexDirection: "row-reverse" },
  rtlText: { textAlign: "right", writingDirection: "rtl" },
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  title: { fontSize: 34, fontWeight: "800" },
  official: { fontSize: 14, marginBottom: 16 },
  verticalContainer: { gap: 12, marginBottom: 20 },
  flagCardContainerLarge: { borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 16 },
  flagTextContainer: { flex: 1 },
  flagTitleLarge: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  cca3TextLarge: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  mapCardContainer: { borderWidth: 1, borderRadius: 16, padding: 12 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, zIndex: 10 },
  resetButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  resetText: { fontSize: 10, fontWeight: "700" },
  pillContainer: { flexDirection: "row", borderRadius: 14, padding: 2 },
  pill: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 },
  pillText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  mapContainerLarge: { height: 340, borderRadius: 12, overflow: "hidden" },
  gestureWrapper: { flex: 1, width: "100%", height: "100%" },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  factCard: { flexBasis: "47%", borderWidth: 1, borderRadius: 12, padding: 12 },
  factCardFull: { flexBasis: "100%" },
  factLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4 },
  factValue: { fontSize: 16, fontWeight: "700" },
  section: { marginBottom: 20 },
  value: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  wikiLink: { fontSize: 14, fontWeight: "700", textAlign: "center", marginTop: 10 },
});