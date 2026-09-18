import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLanguage } from "../context/LanguageContext";
import { useAppTheme } from "../context/ThemeContext";

type LangCode = "en" | "de" | "fr" | "it" | "es" | "ur";

type AboutContentItem = {
  title: string;
  intro: string;
  whatItDoesHeading: string;
  bullets: string[];
  territoriesHeading: string;
  territoriesBody1: string;
  territoriesBody2: string;
  dataHeading: string;
  dataBody: string;
  footerNote: string;
};

const ABOUT_CONTENT: Record<LangCode, AboutContentItem> = {
  en: {
    title: "About WorldWise",
    intro:
      "WorldWise is a small, offline-first app for learning every country in the world — its flag, its capital, and the facts behind it. Built for browsing as much as focused learning.",
    whatItDoesHeading: "What it does",
    bullets: [
      'A random country on every visit; "Surprise me" brings the next one.',
      "The flag and key facts: capital, population, area, density, government, languages, currency and neighbours.",
      "Search for any country, in any of six languages.",
      "A full list of every country, filterable by region.",
      "A quiz for flags and capitals.",
      "Four themes and six languages, switchable at any time.",
    ],
    territoriesHeading: "Countries and territories",
    territoriesBody1:
      "Alongside sovereign states, WorldWise includes territories with a special or disputed status. They're findable via search, the list, and random selection like any other entry.",
    territoriesBody2:
      "Including these follows the dataset's own scope and serves learning and completeness only — it makes no political claim about sovereignty or territorial disputes.",
    dataHeading: "Data & sources",
    dataBody:
      "Country data comes from the open-source world-countries package (ODbL). Population figures come from the World Bank's public API. Founding dates and government types come from Wikidata (public domain). Flags come from flag-icons (MIT).",
    footerNote: "A personal project — no ads, no tracking.",
  },
  de: {
    title: "Über WorldWise",
    intro:
      "WorldWise ist eine kleine, offline-fähige App, um jedes Land der Welt kennenzulernen — Flagge, Hauptstadt und die Fakten dahinter. Zum Stöbern genauso wie zum gezielten Lernen.",
    whatItDoesHeading: "Was die App kann",
    bullets: [
      "Bei jedem Besuch ein zufälliges Land; „Überrasch mich\" zeigt das nächste.",
      "Flagge und Kernfakten: Hauptstadt, Bevölkerung, Fläche, Dichte, Regierung, Sprachen, Währung und Nachbarn.",
      "Suche nach jedem Land, in sechs Sprachen.",
      "Eine vollständige Liste aller Länder, filterbar nach Region.",
      "Ein Quiz zu Flaggen und Hauptstädten.",
      "Vier Designs und sechs Sprachen, jederzeit umschaltbar.",
    ],
    territoriesHeading: "Länder und Gebiete",
    territoriesBody1:
      "Neben souveränen Staaten enthält WorldWise auch Gebiete mit besonderem oder umstrittenem Status. Sie sind über Suche, Liste und Zufallsauswahl wie jeder andere Eintrag auffindbar.",
    territoriesBody2:
      "Das folgt dem Umfang des zugrunde liegenden Datensatzes und dient nur dem Lernen und der Vollständigkeit — ohne politische Aussage zu Souveränität oder Gebietsstreitigkeiten.",
    dataHeading: "Daten & Quellen",
    dataBody:
      "Länderdaten stammen aus dem Open-Source-Paket world-countries (ODbL). Bevölkerungszahlen von der öffentlichen API der Weltbank. Gründungsdaten und Regierungsformen von Wikidata (gemeinfrei). Flaggen von flag-icons (MIT).",
    footerNote: "Ein privates Projekt — keine Werbung, kein Tracking.",
  },
  fr: {
    title: "À propos de WorldWise",
    intro:
      "WorldWise est une petite application hors ligne pour découvrir tous les pays du monde — leur drapeau, leur capitale et les faits qui les entourent. Pour naviguer autant que pour apprendre.",
    whatItDoesHeading: "Ce que l'appli propose",
    bullets: [
      "Un pays aléatoire à chaque visite ; « Surprends-moi » en propose un autre.",
      "Le drapeau et les faits clés : capitale, population, superficie, densité, gouvernement, langues, monnaie et voisins.",
      "Recherchez n'importe quel pays, en six langues.",
      "Une liste complète de tous les pays, filtrable par région.",
      "Un quiz sur les drapeaux et les capitales.",
      "Quatre thèmes et six langues, modifiables à tout moment.",
    ],
    territoriesHeading: "Pays et territoires",
    territoriesBody1:
      "Outre les États souverains, WorldWise inclut des territoires au statut particulier ou contesté. Ils sont accessibles via la recherche, la liste et la sélection aléatoire comme n'importe quelle autre entrée.",
    territoriesBody2:
      "Cela suit simplement le périmètre du jeu de données et sert uniquement l'apprentissage et l'exhaustivité — sans aucune prise de position politique sur la souveraineté ou les différends territoriaux.",
    dataHeading: "Données et sources",
    dataBody:
      "Les données pays proviennent du paquet open-source world-countries (ODbL). La population provient de l'API publique de la Banque mondiale. Les dates de fondation et types de gouvernement proviennent de Wikidata (domaine public). Les drapeaux proviennent de flag-icons (MIT).",
    footerNote: "Un projet personnel — sans publicité, sans suivi.",
  },
  it: {
    title: "Informazioni su WorldWise",
    intro:
      "WorldWise è una piccola app offline-first per conoscere ogni paese del mondo — la sua bandiera, la sua capitale e i fatti che lo riguardano. Pensata sia per esplorare che per studiare.",
    whatItDoesHeading: "Cosa fa l'app",
    bullets: [
      'Un paese casuale a ogni visita; "Sorprendimi" ne mostra un altro.',
      "La bandiera e i fatti chiave: capitale, popolazione, area, densità, governo, lingue, valuta e paesi confinanti.",
      "Cerca qualsiasi paese, in sei lingue.",
      "Un elenco completo di tutti i paesi, filtrabile per regione.",
      "Un quiz su bandiere e capitali.",
      "Quattro temi e sei lingue, modificabili in qualsiasi momento.",
    ],
    territoriesHeading: "Paesi e territori",
    territoriesBody1:
      "Oltre agli stati sovrani, WorldWise include territori con uno status speciale o conteso. Sono raggiungibili tramite ricerca, elenco e selezione casuale come qualsiasi altra voce.",
    territoriesBody2:
      "La loro inclusione segue semplicemente l'ambito del dataset e serve solo a scopo didattico e di completezza, senza alcuna presa di posizione politica su sovranità o dispute territoriali.",
    dataHeading: "Dati e fonti",
    dataBody:
      "I dati sui paesi provengono dal pacchetto open-source world-countries (ODbL). La popolazione proviene dall'API pubblica della Banca Mondiale. Date di fondazione e forme di governo provengono da Wikidata (dominio pubblico). Le bandiere provengono da flag-icons (MIT).",
    footerNote: "Un progetto personale — senza pubblicità, senza tracciamento.",
  },
  es: {
    title: "Acerca de WorldWise",
    intro:
      "WorldWise es una pequeña app sin conexión para conocer todos los países del mundo — su bandera, su capital y los datos que hay detrás. Pensada tanto para explorar como para estudiar.",
    whatItDoesHeading: "Qué hace la app",
    bullets: [
      'Un país aleatorio en cada visita; "Sorpréndeme" muestra el siguiente.',
      "La bandera y los datos clave: capital, población, área, densidad, gobierno, idiomas, moneda y países vecinos.",
      "Busca cualquier país, en seis idiomas.",
      "Una lista completa de todos los países, filtrable por región.",
      "Un cuestionario sobre banderas y capitales.",
      "Cuatro temas y seis idiomas, intercambiables en cualquier momento.",
    ],
    territoriesHeading: "Países y territorios",
    territoriesBody1:
      "Además de los estados soberanos, WorldWise incluye territorios con un estatus especial o en disputa. Se pueden encontrar mediante la búsqueda, la lista y la selección aleatoria como cualquier otra entrada.",
    territoriesBody2:
      "Incluirlos sigue simplemente el alcance del conjunto de datos y solo sirve al aprendizaje y a la exhaustividad, sin ninguna postura política sobre soberanía o disputas territoriales.",
    dataHeading: "Datos y fuentes",
    dataBody:
      "Los datos de los países provienen del paquete de código abierto world-countries (ODbL). La población proviene de la API pública del Banco Mundial. Las fechas de fundación y las formas de gobierno provienen de Wikidata (dominio publico). Las banderas provienen de flag-icons (MIT).",
    footerNote: "Un personal project — sin publicidad, sin seguimiento.",
  },
  ur: {
    title: "WorldWise کے بارے میں",
    intro:
      "WorldWise دنیا کے ہر ملک کو جاننے کے لیے ایک چھوٹی، آف لائن ایپ ہے — اس کا پرچم، دارالحکومت اور اس کے پیچھے کی حقیقتیں۔ سیر کرنے کے لیے بھی اور توجہ سے سیکھنے کے لیے بھی۔",
    whatItDoesHeading: "یہ ایپ کیا کرتی ہے",
    bullets: [
      'ہر وزٹ پر ایک بے ترتیب ملک؛ "مجھے حیران کریں" اگلا ملک دکھاتا ہے۔',
      "پرچم اور اہم حقائق: دارالحکومت، آبادی، رقبہ، کثافت، حکومت، زبانیں، کرنسی اور پڑوسی ممالک۔",
      "کسی بھی ملک کو، چھ زبانوں میں تلاش کریں۔",
      "تمام ممالک کی مکمل فہرست، خطے کے لحاظ سے فلٹر کی جا سکتی ہے۔",
      "پرچموں اور دارالحکومتوں کے بارے میں ایک کوئز۔",
      "چار تھیمز اور چھ زبانیں، کسی بھی وقت تبدیل کی جا سکتی ہیں۔",
    ],
    territoriesHeading: "ممالک اور علاقے",
    territoriesBody1:
      "خودمختار ممالک کے علاوہ، WorldWise میں خصوصی یا متنازعہ حیثیت رکھنے والے علاقے بھی شامل ہیں۔ یہ تلاش، فہرست اور بے ترتیب انتخاب کے ذریعے دیگر اندراجات کی طرح قابل رسائی ہیں۔",
    territoriesBody2:
      "انہیں شامل کرنا صرف ڈیٹا سیٹ کے دائرہ کار کی پیروی کرتا ہے اور محض سیکھنے اور تکمیل کے مقصد کے لیے ہے — یہ خودمختاری یا علاقائی تنازعات کے بارے میں کوئی سیاسی مؤقف پیش نہیں کرتا۔",
    dataHeading: "ڈیٹا اور ذرائع",
    dataBody:
      "ملکی ڈیٹا اوپن سورس پیکج world-countries (ODbL) سے حاصل کیا گیا ہے۔ آبادی کے اعداد و شمار ورلڈ بینک کے عوامی API سے ہیں۔ قیام کی تاریخیں اور حکومت کی اقسام Wikidata (پبلک ڈومین) سے ہیں۔ پرچم flag-icons (MIT) سے ہیں۔",
    footerNote: "ایک ذاتی منصوبہ — کوئی اشتہار نہیں، کوئی ٹریکنگ نہیں۔",
  },
};

const LANGUAGE_PILLS: { code: LangCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "ur", label: "اردو" },
];

export default function AboutScreen() {
  const { theme } = useAppTheme();
  const { languageCode, setLanguageCode, isRTL } = useLanguage();
  const router = useRouter();

  const content = ABOUT_CONTENT[languageCode as LangCode] ?? ABOUT_CONTENT.en;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={[styles.backRow, isRTL && styles.rowReverse]}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={18} color={theme.colors.accent} />
          <Text style={[styles.backLabel, { color: theme.colors.accent }]}>WorldWise</Text>
        </Pressable>

        <View style={[styles.langRow, isRTL && styles.rowReverse]}>
          {LANGUAGE_PILLS.map((lang) => {
            const active = lang.code === languageCode;
            return (
              <Pressable
                key={lang.code}
                onPress={() => setLanguageCode(lang.code as any)}
                style={[
                  styles.langPill,
                  { backgroundColor: active ? theme.colors.pillActiveBackground : theme.colors.pillBackground },
                ]}
              >
                <Text
                  style={{
                    color: active ? theme.colors.pillActiveText : theme.colors.textSecondary,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  {lang.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.title, { color: theme.colors.text }, isRTL && styles.rtlText]}>
          {content.title}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }, isRTL && styles.rtlText]}>
          {content.intro}
        </Text>

        <Text style={[styles.heading, { color: theme.colors.text }, isRTL && styles.rtlText]}>
          {content.whatItDoesHeading}
        </Text>
        {content.bullets.map((bullet, i) => (
          <View key={i} style={[styles.bulletRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.bulletDot, { color: theme.colors.accent }]}>•</Text>
            <Text style={[styles.bulletText, { color: theme.colors.textSecondary }, isRTL && styles.rtlText]}>
              {bullet}
            </Text>
          </View>
        ))}

        <Text style={[styles.heading, { color: theme.colors.text }, isRTL && styles.rtlText]}>
          {content.territoriesHeading}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }, isRTL && styles.rtlText]}>
          {content.territoriesBody1}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }, isRTL && styles.rtlText]}>
          {content.territoriesBody2}
        </Text>

        <Text style={[styles.heading, { color: theme.colors.text }, isRTL && styles.rtlText]}>
          {content.dataHeading}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }, isRTL && styles.rtlText]}>
          {content.dataBody}
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.footerNote, { color: theme.colors.textMuted }, isRTL && styles.rtlText]}>
          {content.footerNote}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  rowReverse: { flexDirection: "row-reverse" },
  rtlText: { textAlign: "right", writingDirection: "rtl" },
  backRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 20 },
  backLabel: { fontSize: 14, fontWeight: "700" },
  langRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  langPill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18 },
  title: { fontSize: 32, fontWeight: "800", marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: "800", marginTop: 24, marginBottom: 10 },
  paragraph: { fontSize: 15, lineHeight: 23, marginBottom: 10 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, gap: 8 },
  bulletDot: { fontSize: 15, lineHeight: 23 },
  bulletText: { fontSize: 15, lineHeight: 23, flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginTop: 28, marginBottom: 16 },
  footerNote: { fontSize: 13, textAlign: "center" },
});