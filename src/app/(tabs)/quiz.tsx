import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import * as Haptics from "expo-haptics";
import Animated, { ZoomIn, FadeIn, Easing } from "react-native-reanimated";
import { useAppTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import CountryFlag from "@/components/CountryFlag";
import { getAllCountries } from "@/data/data";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getQuizEligibleCountries() {
  return getAllCountries().filter((c: any) => c.capital && c.capital.length > 0);
}

function buildQuestion() {
  const pool = getQuizEligibleCountries();
  const answerCountry = pool[Math.floor(Math.random() * pool.length)];
  const wrongPool = pool.filter((c: any) => c.cca3 !== answerCountry.cca3);
  const wrongs = shuffle(wrongPool).slice(0, 3);
  const options = shuffle([answerCountry, ...wrongs]);
  return { answerCountry, options };
}

export default function QuizScreen() {
  const { theme } = useAppTheme();
  const { t, isRTL } = useLanguage();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const insets = useSafeAreaInsets();

  const tabBarHeight = Platform.OS === "ios" ? 88 : 64;

  const scrollRef = useRef<ScrollView>(null);

  const [question, setQuestion] = useState(buildQuestion);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);

  const total = getAllCountries().length;
  const isCorrectPicked = selected === question.answerCountry.cca3;

  const pick = (country: any) => {
    if (selected) return;
    setSelected(country.cca3);
    setAsked((n) => n + 1);
    const correct = country.cca3 === question.answerCountry.cca3;
    if (correct) setScore((s) => s + 1);
    Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});

    // The feedback block + Next button only render after this state update,
    // so wait one frame for that layout to happen, then scroll it fully
    // into view — this is what stops the button from ending up hidden
    // behind the tab bar on long questions/country names.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const next = () => {
    setQuestion(buildQuestion());
    setSelected(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Header seenCount={total} totalCount={total} />

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          // Generous bottom space — tab bar height plus real breathing room,
          // so even a two-line question + feedback block always has space
          // to scroll fully clear of the tab bar.
          { paddingBottom: tabBarHeight + 28},
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeringWrapper}>
          <View style={[styles.body, isTablet && styles.bodyTablet]}>
            <View style={[styles.scoreRow, isRTL && styles.rowReverse]}>
              <View style={[styles.scorePill, { backgroundColor: theme.colors.pillBackground }]}>
                <Text style={[styles.scoreText, { color: theme.colors.textSecondary }]}>
                  {t("score")} · {score}/{asked}
                </Text>
              </View>
            </View>

            <Animated.Text
              key={`question-${question.answerCountry.cca3}-${asked}`}
              entering={FadeIn.duration(250)}
              style={[
                styles.question,
                { color: theme.colors.text },
                isTablet && styles.questionTablet,
                isRTL && styles.rtlText,
              ]}
            >
              {t("whatIsCapitalOf", { country: question.answerCountry.name.common })}
            </Animated.Text>

            <Animated.View
              key={`flag-${question.answerCountry.cca3}-${asked}`}
              entering={ZoomIn.duration(320).easing(Easing.out(Easing.back(1.1)))}
              style={[
                styles.flagCard,
                isTablet && styles.flagCardTablet,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <CountryFlag cca2={question.answerCountry.cca2} size={isTablet ? 130 : 90} />
            </Animated.View>

            <View style={[styles.optionsGrid, isRTL && styles.rowReverseWrap]}>
              {question.options.map((option: any, i: number) => {
                const showState = Boolean(selected);
                const isThisTheCorrectAnswer = option.cca3 === question.answerCountry.cca3;
                const didUserPickThis = selected === option.cca3;

                let bg = theme.colors.card;
                let borderColor = theme.colors.border;
                let textColor = theme.colors.text;
                if (showState) {
                  if (isThisTheCorrectAnswer) {
                    bg = "#00ff00";
                    borderColor = "#4CAF50";
                    textColor = "#1A1A1A";
                  } else if (didUserPickThis) {
                    bg = "#f3412e";
                    borderColor = "#E8412C";
                    textColor = "#FFFFFF";
                  }
                }

                return (
                  <Pressable
                    key={`${option.cca3}-${asked}`}
                    onPress={() => pick(option)}
                    disabled={showState}
                    style={({ pressed }) => [
                      styles.optionCard,
                      isTablet && styles.optionCardTablet,
                      isRTL && styles.rowReverse,
                      {
                        backgroundColor: bg,
                        borderColor,
                        opacity: pressed && !showState ? 0.75 : 1,
                        transform: [{ scale: pressed && !showState ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIndexBubble,
                        { backgroundColor: theme.colors.pillBackground },
                      ]}
                    >
                      <Text style={[styles.optionIndex, { color: theme.colors.textMuted }]}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={[styles.optionLabel, { color: textColor }]} numberOfLines={2}>
                      {(option.capital || []).join(", ") || "—"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selected && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.feedbackBlock}>
                <Text
                  style={[
                    styles.feedbackText,
                    { color: isCorrectPicked ? theme.colors.success : theme.colors.danger },
                  ]}
                >
                  {isCorrectPicked ? t("correct") : t("incorrect")}
                </Text>
                <Pressable
                  onPress={next}
                  style={({ pressed }) => [
                    styles.nextButton,
                    { backgroundColor: theme.colors.accent, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={{ color: theme.colors.accentText, fontWeight: "700", fontSize: 15 }}>
                    {t("next")}
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  centeringWrapper: { flex: 1, alignItems: "center" },
  body: { flex: 1, width: "100%", paddingHorizontal: 20, paddingTop: 12 },
  bodyTablet: { maxWidth: 560, paddingHorizontal: 0 },
  rowReverse: { flexDirection: "row-reverse" },
  rowReverseWrap: { flexDirection: "row-reverse" },
  rtlText: { textAlign: "right", writingDirection: "rtl" },

  scoreRow: { alignItems: "center", marginBottom: 18 },
  scorePill: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  scoreText: { fontSize: 12, fontWeight: "700" },

  question: {
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.3,
    lineHeight: 26,
  },
  questionTablet: { fontSize: 24, lineHeight: 32 },

  flagCard: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  flagCardTablet: { padding: 28 },

  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
  },
  optionCardTablet: { paddingVertical: 18, paddingHorizontal: 16 },
  optionIndexBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIndex: { fontSize: 12, fontWeight: "800" },
  optionLabel: { fontSize: 15, fontWeight: "700", flexShrink: 1, flex: 1 },

  feedbackBlock: { alignItems: "center", marginTop: 28 },
  feedbackText: { fontWeight: "800", fontSize: 17, marginBottom: 14 },
  nextButton: {
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});


// import React, { useMemo, useState } from "react";
// import { View, Text, Pressable, StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as Haptics from "expo-haptics";
// import { useAppTheme } from "@/context/ThemeContext";
// import { useLanguage } from "@/context/LanguageContext";
// import Header from "@/components/Header";
// import CountryFlag from "@/components/CountryFlag";
// import { countries, Country, TOTAL_COUNTRIES_KNOWN } from "@/data/countries";

// function shuffle<T>(arr: T[]): T[] {
//   return [...arr].sort(() => Math.random() - 0.5);
// }

// function buildQuestion() {
//   const answerCountry = countries[Math.floor(Math.random() * countries.length)];
//   const wrongPool = countries.filter((c) => c.cca3 !== answerCountry.cca3);
//   const wrongs = shuffle(wrongPool).slice(0, 3);
//   const options = shuffle([answerCountry, ...wrongs]);
//   return { answerCountry, options };
// }

// export default function QuizScreen() {
//   const { theme } = useAppTheme();
//   const { t } = useLanguage();
//   const [question, setQuestion] = useState(buildQuestion);
//   const [selected, setSelected] = useState<string | null>(null);
//   const [score, setScore] = useState(0);
//   const [asked, setAsked] = useState(0);

//   const isCorrectPicked = selected === question.answerCountry.cca3;

//   const pick = (country: Country) => {
//     if (selected) return;
//     setSelected(country.cca3);
//     setAsked((n) => n + 1);
//     const correct = country.cca3 === question.answerCountry.cca3;
//     if (correct) setScore((s) => s + 1);
//     Haptics.notificationAsync(
//       correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
//     ).catch(() => {});
//   };

//   const next = () => {
//     setQuestion(buildQuestion());
//     setSelected(null);
//   };

//   return (
//     <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={["top"]}>
//       <Header seenCount={countries.length} totalCount={TOTAL_COUNTRIES_KNOWN} />

//       <View style={styles.body}>
//         <Text style={[styles.scoreText, { color: theme.colors.textMuted }]}>
//           {t("score")}: {score} / {asked}
//         </Text>

//         <Text style={[styles.question, { color: theme.colors.text }]}>
//           {t("whatIsCapitalOf", { country: question.answerCountry.name.common })}
//         </Text>

//         <View style={[styles.flagCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
//           <CountryFlag cca2={question.answerCountry.cca2} size={90} />
//         </View>

//         <View style={styles.optionsGrid}>
//           {question.options.map((option, i) => {
//             const isSelected = selected === option.cca3;
//             const isAnswer = option.cca3 === question.answerCountry.cca3;
//             const showState = Boolean(selected);
//             let bg = theme.colors.card;
//             let borderColor = theme.colors.border;
//             if (showState && isAnswer) {
//               bg = "#00ff00";
//               borderColor = "#4CAF50";
//             } else if (showState && isSelected && !isAnswer) {
//               bg = "#f3412e";
//               borderColor = "#E8412C";
//             }
//             return (
//               <Pressable
//                 key={option.cca3}
//                 onPress={() => pick(option)}
//                 style={[styles.optionCard, { backgroundColor: bg, borderColor }]}
//               >
//                 <Text style={[styles.optionIndex, { color: theme.colors.textMuted }]}>{i + 1}</Text>
//                 <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
//                   {option.capital.join(", ")}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>

//         {selected && (
//           <View style={styles.feedbackBlock}>
//             <Text
//               style={{
//                 color: isCorrectPicked ? "#4CAF50" : "#E8412C",
//                 fontWeight: "800",
//                 fontSize: 16,
//                 marginBottom: 10,
//               }}
//             >
//               {isCorrectPicked ? t("correct") : t("incorrect")}
//             </Text>
//             <Pressable
//               onPress={next}
//               style={[styles.nextButton, { backgroundColor: theme.colors.accent }]}
//             >
//               <Text style={{ color: theme.colors.accentText, fontWeight: "700" }}>{t("next")}</Text>
//             </Pressable>
//           </View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1 },
//   body: { paddingHorizontal: 16, paddingTop: 8 },
//   scoreText: { fontSize: 12, marginBottom: 8, textAlign: "center" },
//   question: {
//     fontSize: 18,
//     fontWeight: "800",
//     textAlign: "center",
//     marginBottom: 16,
//     textTransform: "uppercase",
//   },
//   flagCard: {
//     alignSelf: "center",
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//   },
//   optionsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },
//   optionCard: {
//     flexBasis: "47%",
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingVertical: 14,
//     paddingHorizontal: 12,
//     gap: 8,
//   },
//   optionIndex: { fontSize: 12, fontWeight: "700" },
//   optionLabel: { fontSize: 14, fontWeight: "700", flexShrink: 1 },
//   feedbackBlock: { alignItems: "center", marginTop: 24 },
//   nextButton: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
// });
