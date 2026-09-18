# WorldWise — Theme + Language System

## What's in here

```
constants/
  themes.ts            4 themes: Atlas, Swiss, Nocturne, Vintage
  translations.ts       6 languages: English, German, French, Italian, Spanish, Urdu
context/
  ThemeContext.tsx      Context API + AsyncStorage persistence for the active theme
  LanguageContext.tsx   Context API + AsyncStorage persistence for the active language, t() translator, RTL flag
components/
  Header.tsx             Shared header: brand, description, search, Explore/List/Quiz pills, Surprise me, seen counter, menu icon
  ThemeLanguageMenu.tsx  The dropdown menu opened from the header's menu icon (theme picker + language picker)
  CountryFlag.tsx        Flag renderer (emoji fallback — swap for real flag-icons SVGs later)
data/
  countries.sample.json  10 sample countries in the normalized schema from your spec
  countries.ts           Data helpers: density calculation, cca3->country border resolution, search, random
app/
  _layout.tsx            Root layout — wraps the app in ThemeProvider + LanguageProvider
  index.tsx               Splash screen, now theme/language aware
  (tabs)/_layout.tsx      Tab navigator (Explore / List / Quiz)
  (tabs)/index.tsx        Explore (home) screen — country detail, quick facts, neighbours
  (tabs)/list.tsx          List screen — full table, filterable by continent
  (tabs)/quiz.tsx          Quiz screen — multiple-choice capital quiz
```

## Install steps

1. Copy these folders into your project root (merge with what you have — `app/_layout.tsx`
   and `app/index.tsx` will overwrite your current splash/root files).

2. Install the one new dependency this uses:
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```
   (`react-native-gesture-handler`, `react-native-safe-area-context`, `expo-haptics`,
   `@expo/vector-icons` you already have from earlier in this project.)

3. Confirm your `tsconfig.json` has the `@/*` path alias (ships by default with
   `create-expo-app`):
   ```jsonc
   "paths": { "@/*": ["./*"] }
   ```

4. Restart with a clean cache since this changes root layout structure:
   ```bash
   npx expo start -c
   ```

## How it follows your spec

- **Themes**: switching in the menu re-renders every themed screen instantly —
  no reload needed — because `useAppTheme()` reads from Context, and the
  selection is persisted so it survives app restarts.
- **Languages**: same pattern via `useLanguage()` / `t()`. Urdu is included and
  flagged `isRTL: true`; text alignment flips reactively. A *full* native RTL
  layout mirror (via `I18nManager.forceRTL`) needs an app restart to fully
  apply — that's an OS-level constraint, not something Context can bypass.
- **Menu icon in the header**: tapping it opens `ThemeLanguageMenu`, which has
  two rows (Theme, Language) that drill into their own option lists —
  matching the two-level dropdown in your reference screenshots.
- **Explore = Home tab**: `(tabs)/index.tsx` is both.
- **Data**: `data/countries.sample.json` follows your exact normalized model
  (cca2/cca3, capital array, calculated density, borders as cca3 for
  resolution, wikipedia slug). Swap it for the full mledoze-generated
  `countries.json` once your build script produces it — nothing else changes.
- **Flags**: currently rendered as emoji (zero extra assets, works
  immediately). To switch to the real `flag-icons` SVGs per your spec, bundle
  the SVGs under `assets/flags/4x3/{cca2}.svg` and swap the implementation
  inside `CountryFlag.tsx` for `react-native-svg`'s `SvgXml`.

## Known limitation

Urdu's RTL mirroring is partial (text alignment flips immediately; full
layout mirroring needs `I18nManager.forceRTL(true)` + a restart, which I've
left out to avoid unexpectedly restarting your app whenever someone taps
Urdu — happy to wire that in if you want the full native RTL experience).
