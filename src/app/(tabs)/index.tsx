import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withDecay,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  ZoomIn,
} from "react-native-reanimated";

import { useAppTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import CountryFlag from "@/components/CountryFlag";
import WorldMap from "@/components/WorldMap";
import { getAllCountries, getCountryByCode, getRandomCountry } from "@/data/data";

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 520;

function ScaleInText({
  animKey,
  children,
  style,
  numberOfLines,
}: {
  animKey: string;
  children: React.ReactNode;
  style?: any;
  numberOfLines?: number;
}) {
  return (
    <Animated.Text
      key={animKey}
      entering={(ZoomIn as any).duration(280).easing(Easing.out(Easing.back(1.2)))}
      style={style}
      numberOfLines={numberOfLines}
    >
      {children}
    </Animated.Text>
  );
}

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

function getPathCentroid(d?: string): { x: number; y: number } | null {
  if (!d) return null;
  const numbers = d.match(/-?\d+\.?\d*/g);
  if (!numbers || numbers.length < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    sumX += parseFloat(numbers[i]);
    sumY += parseFloat(numbers[i + 1]);
    count++;
  }
  if (count === 0) return null;
  return { x: sumX / count, y: sumY / count };
}

export default function ExploreScreen() {
  const { theme } = useAppTheme();
  const { t, isRTL } = useLanguage();
  const [country, setCountry] = React.useState<any>(() => getAllCountries()[0]);
  const [favorite, setFavorite] = React.useState(false);
  const [mapScope, setMapScope] = React.useState<"world" | "continent" | "region">("region");

  const scale = useSharedValue(2.2);
  const savedScale = useSharedValue(2.2);
  const translateX = useSharedValue(-100);
  const translateY = useSharedValue(-50);
  const savedTranslateX = useSharedValue(-100);
  const savedTranslateY = useSharedValue(-50);

  const scrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  const MIN_SCALE = 1;
  const MAX_SCALE = 6;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentScrollY = event.contentOffset.y;
      const previousScrollY = scrollY.value;
      scrollY.value = currentScrollY;

      if (currentScrollY <= 0) {
        headerTranslateY.value = withTiming(0, { duration: 150 });
        headerOpacity.value = withTiming(1, { duration: 150 });
      } else if (currentScrollY > previousScrollY && currentScrollY > 40) {
        headerTranslateY.value = withTiming(-180, { duration: 200 });
        headerOpacity.value = withTiming(0, { duration: 200 });
      } else if (currentScrollY < previousScrollY) {
        headerTranslateY.value = withTiming(0, { duration: 200 });
        headerOpacity.value = withTiming(1, { duration: 200 });
      }
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
    opacity: headerOpacity.value,
  }));

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

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = Math.max(MIN_SCALE, Math.min(savedScale.value * event.scale, MAX_SCALE));
      const scaleDelta = newScale / scale.value;
      translateX.value = event.focalX - (event.focalX - translateX.value) * scaleDelta;
      translateY.value = event.focalY - (event.focalY - translateY.value) * scaleDelta;
      scale.value = newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd((event) => {
      translateX.value = withDecay({ velocity: event.velocityX, deceleration: 0.998 });
      translateY.value = withDecay({ velocity: event.velocityY, deceleration: 0.998 });
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

  useEffect(() => {
    const centroid = getPathCentroid(country?.geoPath);
    if (!centroid) return;

    const targetScale = savedScale.value;
    const targetX = VIEWBOX_WIDTH / 2 - targetScale * centroid.x;
    const targetY = VIEWBOX_HEIGHT / 2 - targetScale * centroid.y;

    const config = { duration: 500, easing: Easing.out(Easing.cubic) };
    translateX.value = withTiming(targetX, config);
    translateY.value = withTiming(targetY, config);
    savedTranslateX.value = targetX;
    savedTranslateY.value = targetY;
  }, [country?.cca3]);

  const selectCountry = (next: any) => {
    setCountry(next);
    setFavorite(false);
  };

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
      <Animated.View style={[styles.headerContainer, { backgroundColor: theme.colors.background }, headerAnimatedStyle]}>
        <Header
          seenCount={total}
          totalCount={total}
          onSurpriseMe={showRandom}
          onSelectCountry={selectCountry}
        />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.body}>
          <ScaleInText
            animKey={`eyebrow-${country.cca3}`}
            style={[styles.eyebrow, { color: theme.colors.accent }, isRTL && styles.rtlText]}
          >
            {t(country.region?.toLowerCase() as any) || country.region} · {country.subregion}
          </ScaleInText>

          <View style={[styles.titleRow, isRTL && styles.rowReverse]}>
            <ScaleInText
              animKey={`title-${country.cca3}`}
              style={[styles.title, { color: theme.colors.text }]}
            >
              {country.name.common}
            </ScaleInText>
            <Pressable onPress={() => setFavorite((f) => !f)} hitSlop={10}>
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={22}
                color={favorite ? theme.colors.accent : theme.colors.textMuted}
              />
            </Pressable>
          </View>
          <ScaleInText
            animKey={`official-${country.cca3}`}
            style={[styles.official, { color: theme.colors.textSecondary }, isRTL && styles.rtlText]}
          >
            {country.name.official}
          </ScaleInText>

          <View
            style={[
              styles.flagCardContainerLarge,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              isRTL && styles.rowReverse,
            ]}
          >
            <CountryFlag cca2={country.cca2} size={72} />
            <View style={styles.flagTextContainer}>
              <ScaleInText
                animKey={`flagtitle-${country.cca3}`}
                style={[styles.flagTitleLarge, { color: theme.colors.text }]}
              >
                {country.name.common}
              </ScaleInText>
              <Text style={[styles.cca3TextLarge, { color: theme.colors.textMuted }]}>
                {country.cca3} · {country.region}
              </Text>
            </View>
          </View>

          <View style={styles.mapWrapper}>
            <View
              style={[
                styles.mapCardContainer,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.topBar}>
                <Pressable
                  onPress={handleResetZoom}
                  style={[
                    styles.resetButton,
                    { backgroundColor: theme.colors.pillBackground || theme.colors.surface },
                  ]}
                >
                  <Ionicons name="refresh" size={10} color={theme.colors.accent} />
                  <Text style={[styles.resetText, { color: theme.colors.accent }]}>Reset</Text>
                </Pressable>

                <View
                  style={[
                    styles.pillContainer,
                    { backgroundColor: theme.colors.pillBackground || theme.colors.surface },
                  ]}
                >
                  {(["world", "continent", "region"] as const).map((scope) => {
                    const isActive = mapScope === scope;
                    return (
                      <Pressable
                        key={scope}
                        onPress={() => handleScopeChange(scope)}
                        style={[
                          styles.pill,
                          { backgroundColor: isActive ? theme.colors.accent : "transparent" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            { color: isActive ? "#FFFFFF" : theme.colors.textMuted },
                          ]}
                        >
                          {scope}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

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
            <FactCard
              theme={theme}
              animKey={`capital-${country.cca3}`}
              label={t("capital")}
              value={(country.capital || []).join(", ") || "—"}
              full
            />
            <FactCard
              theme={theme}
              animKey={`population-${country.cca3}`}
              label={t("population")}
              value={country.population ? country.population.toLocaleString() : "—"}
            />
            <FactCard
              theme={theme}
              animKey={`area-${country.cca3}`}
              label={t("area")}
              value={country.area ? `${country.area.toLocaleString()} km²` : "—"}
            />
            <FactCard
              theme={theme}
              animKey={`density-${country.cca3}`}
              label={t("density")}
              value={density !== undefined ? `${density} /km²` : "—"}
            />
            <FactCard
              theme={theme}
              animKey={`founded-${country.cca3}`}
              label={t("founded") || "Founded"}
              value={country.founded ? String(country.founded) : "—"}
            />
          </View>

          <Section theme={theme} label={t("government")}>
            <ScaleInText
              animKey={`govform-${country.cca3}`}
              style={[styles.value, { color: theme.colors.text }]}
            >
              {government.form.charAt(0).toUpperCase() + government.form.slice(1)}
            </ScaleInText>
            {government.system ? (
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  textTransform: "capitalize",
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {government.system}
              </Text>
            ) : null}
          </Section>

          <Section theme={theme} label={t("languages")}>
            <ScaleInText
              animKey={`languages-${country.cca3}`}
              style={[styles.value, { color: theme.colors.text }]}
            >
              {languages.length > 0 ? languages.join(", ") : "—"}
            </ScaleInText>
          </Section>

          <Section theme={theme} label={t("currency")}>
            {currencies.length > 0 ? (
              currencies.map((c) => (
                <ScaleInText
                  key={c.code}
                  animKey={`currency-${country.cca3}-${c.code}`}
                  style={[styles.value, { color: theme.colors.text }]}
                >
                  {c.name} ({c.code})
                </ScaleInText>
              ))
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>—</Text>
            )}
          </Section>

          <Section theme={theme} label={t("callingCode")}>
            <ScaleInText
              animKey={`calling-${country.cca3}`}
              style={[styles.value, { color: theme.colors.text }]}
            >
              {callingCodes.length > 0 ? callingCodes.join(", ") : "—"}
            </ScaleInText>
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
                      {
                        backgroundColor: theme.colors.pillBackground || theme.colors.card,
                        borderColor: theme.colors.border,
                      },
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
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function FactCard({
  theme,
  animKey,
  label,
  value,
  full,
}: {
  theme: any;
  animKey: string;
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <View
      style={[
        styles.factCard,
        full && styles.factCardFull,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.factLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <ScaleInText animKey={animKey} style={[styles.factValue, { color: theme.colors.text }]}>
        {value}
      </ScaleInText>
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
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  scrollContent: {
    paddingTop: 190,
  },
  body: { paddingHorizontal: 16, paddingBottom: 40 },
  rowReverse: { flexDirection: "row-reverse" },
  rtlText: { textAlign: "right", writingDirection: "rtl" },
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  title: { fontSize: 34, fontWeight: "800" },
  official: { fontSize: 14, marginBottom: 16 },
  flagCardContainerLarge: { borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 16 },
  flagTextContainer: { flex: 1 },
  flagTitleLarge: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  cca3TextLarge: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  mapWrapper: { marginTop: 12, marginBottom: 20 },
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