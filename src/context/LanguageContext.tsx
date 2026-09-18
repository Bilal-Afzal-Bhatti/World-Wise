import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LanguageCode,
  LanguageOption,
  TranslationKey,
  languages,
  translations,
} from "@/constants/translations";

const STORAGE_KEY = "worldwise.languageCode";

interface LanguageContextValue {
  languageCode: LanguageCode;
  setLanguageCode: (code: LanguageCode) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [languageCode, setLanguageCodeState] = useState<LanguageCode>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && languages.some((l) => l.code === saved)) {
          setLanguageCodeState(saved as LanguageCode);
        }
      } catch (e) {
        console.warn("Failed to load saved language", e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setLanguageCode = (code: LanguageCode) => {
    setLanguageCodeState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch((e) =>
      console.warn("Failed to persist language", e)
    );
    // Note: a true native RTL layout flip (I18nManager.forceRTL) requires an
    // app restart to fully apply. We flip text alignment reactively via
    // `isRTL` below so Urdu still reads correctly without restarting.
  };

  const t = useMemo(() => {
    return (key: TranslationKey, vars?: Record<string, string | number>) => {
      let str = translations[languageCode][key] ?? translations.en[key] ?? String(key);
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v));
        });
      }
      return str;
    };
  }, [languageCode]);

  const isRTL = languages.find((l) => l.code === languageCode)?.isRTL ?? false;

  const value = useMemo(
    () => ({ languageCode, setLanguageCode, t, isRTL, availableLanguages: languages }),
    [languageCode, isRTL, t]
  );

  if (!hydrated) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
