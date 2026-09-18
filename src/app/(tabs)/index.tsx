import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import CountryFlag from "@/components/CountryFlag";
import { getAllCountries, getCountryByCode, getRandomCountry } from "@/data/data";
import CountryMapCard from "@/components/CountryMapCard.";
// data.ts hands back raw world-countries objects — normalize just what
// this screen displays, right here.
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
  // Uses direct attributes if available, or handles custom lookups/fallbacks
  return {
    form: raw.government?.form || raw.unMember ? "Republic / State" : "Territory",
    system: raw.government?.system || raw.independent ? "Standard governance" : "Dependent territory",
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

  const government = getGovernment(country);
  const neighbours = getNeighbours(country);
  const density = getDensity(country);
  const currencies = getCurrencies(country);
  const languages = getLanguages(country);
  const callingCodes = getCallingCodes(country);
  const total = getAllCountries().length;

  const showRandom = () => {
    setCountry(getRandomCountry());
    setFavorite(false);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header
          seenCount={total}
          totalCount={total}
          onSurpriseMe={showRandom}
          onSelectCountry={(c: any) => {
            setCountry(c);
            setFavorite(false);
          }}
        />

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

          <View style={styles.flagWrap}>
            <CountryFlag cca2={country.cca2} size={100} />
          </View>
 {/* Left: Flag Card */}


  {/* Right: Interactive Map Card */}
  <CountryMapCard country={country} theme={theme} />

          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
            {t("population")} · {t("area")}
          </Text>
          <View style={styles.grid}>
            <FactCard theme={theme} label={t("capital")} value={(country.capital || []).join(", ") || ""} full />
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
              {country.government
                ? country.government.split("·")[0].trim().charAt(0).toUpperCase() + country.government.split("·")[0].trim().slice(1)
                : "—"}
            </Text>
            {country.government?.includes("·") && (
              <Text style={{ color: theme.colors.textSecondary, textTransform: "capitalize", fontSize: 13, marginTop: 2 }}>
                {country.government.split("·")[1].trim()}
              </Text>
            )}
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
                    onPress={() => {
                      setCountry(n);
                      setFavorite(false);
                    }}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.colors.pillBackground, borderColor: theme.colors.border },
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

          {/* <Pressable style={[styles.quizButton, { backgroundColor: theme.colors.accent }]}>
            <Text style={{ color: theme.colors.accentText, fontWeight: "700" }}>
              {t("takeQuizAbout", { country: country.name.common })}
            </Text>
          </Pressable> */}

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
  flagWrap: { marginBottom: 20 },
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
  quizButton: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8, marginBottom: 16 },
  wikiLink: { fontSize: 14, fontWeight: "700", textAlign: "center" },
});