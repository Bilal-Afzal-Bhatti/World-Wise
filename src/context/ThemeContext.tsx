import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppTheme, ThemeName, themes, themeOrder } from "@/constants/themes";

const STORAGE_KEY = "worldwise.themeName";

interface ThemeContextValue {
  themeName: ThemeName;
  theme: AppTheme;
  setThemeName: (name: ThemeName) => void;
  availableThemes: AppTheme[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>("atlas");
  const [hydrated, setHydrated] = useState(false);

  // Load the saved theme once on app start
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && saved in themes) {
          setThemeNameState(saved as ThemeName);
        }
      } catch (e) {
        console.warn("Failed to load saved theme", e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    AsyncStorage.setItem(STORAGE_KEY, name).catch((e) =>
      console.warn("Failed to persist theme", e)
    );
  };

  const value = useMemo(
    () => ({
      themeName,
      theme: themes[themeName],
      setThemeName,
      availableThemes: themeOrder.map((n) => themes[n]),
    }),
    [themeName]
  );

  // Avoid a flash of the wrong theme before AsyncStorage resolves
  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within a ThemeProvider");
  return ctx;
}
