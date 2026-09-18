import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import CountryFlag from "@/components/CountryFlag";
import { countries, Country, TOTAL_COUNTRIES_KNOWN } from "@/data/countries";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestion() {
  const answerCountry = countries[Math.floor(Math.random() * countries.length)];
  const wrongPool = countries.filter((c) => c.cca3 !== answerCountry.cca3);
  const wrongs = shuffle(wrongPool).slice(0, 3);
  const options = shuffle([answerCountry, ...wrongs]);
  return { answerCountry, options };
}

export default function QuizScreen() {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const [question, setQuestion] = useState(buildQuestion);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);

  const isCorrectPicked = selected === question.answerCountry.cca3;

  const pick = (country: Country) => {
    if (selected) return;
    setSelected(country.cca3);
    setAsked((n) => n + 1);
    const correct = country.cca3 === question.answerCountry.cca3;
    if (correct) setScore((s) => s + 1);
    Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
  };

  const next = () => {
    setQuestion(buildQuestion());
    setSelected(null);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Header seenCount={countries.length} totalCount={TOTAL_COUNTRIES_KNOWN} />

      <View style={styles.body}>
        <Text style={[styles.scoreText, { color: theme.colors.textMuted }]}>
          {t("score")}: {score} / {asked}
        </Text>

        <Text style={[styles.question, { color: theme.colors.text }]}>
          {t("whatIsCapitalOf", { country: question.answerCountry.name.common })}
        </Text>

        <View style={[styles.flagCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <CountryFlag cca2={question.answerCountry.cca2} size={90} />
        </View>

        <View style={styles.optionsGrid}>
          {question.options.map((option, i) => {
            const isSelected = selected === option.cca3;
            const isAnswer = option.cca3 === question.answerCountry.cca3;
            const showState = Boolean(selected);
            let bg = theme.colors.card;
            let borderColor = theme.colors.border;
            if (showState && isAnswer) {
              bg = "#00ff00";
              borderColor = "#4CAF50";
            } else if (showState && isSelected && !isAnswer) {
              bg = "#f3412e";
              borderColor = "#E8412C";
            }
            return (
              <Pressable
                key={option.cca3}
                onPress={() => pick(option)}
                style={[styles.optionCard, { backgroundColor: bg, borderColor }]}
              >
                <Text style={[styles.optionIndex, { color: theme.colors.textMuted }]}>{i + 1}</Text>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {option.capital.join(", ")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selected && (
          <View style={styles.feedbackBlock}>
            <Text
              style={{
                color: isCorrectPicked ? "#4CAF50" : "#E8412C",
                fontWeight: "800",
                fontSize: 16,
                marginBottom: 10,
              }}
            >
              {isCorrectPicked ? t("correct") : t("incorrect")}
            </Text>
            <Pressable
              onPress={next}
              style={[styles.nextButton, { backgroundColor: theme.colors.accent }]}
            >
              <Text style={{ color: theme.colors.accentText, fontWeight: "700" }}>{t("next")}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: 16, paddingTop: 8 },
  scoreText: { fontSize: 12, marginBottom: 8, textAlign: "center" },
  question: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  flagCard: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionCard: {
    flexBasis: "47%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 8,
  },
  optionIndex: { fontSize: 12, fontWeight: "700" },
  optionLabel: { fontSize: 14, fontWeight: "700", flexShrink: 1 },
  feedbackBlock: { alignItems: "center", marginTop: 24 },
  nextButton: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
});
