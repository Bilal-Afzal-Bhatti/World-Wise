export type ThemeName = "atlas" | "swiss" | "nocturne" | "vintage";

export interface AppTheme {
  name: ThemeName;
  label: string;
  /** small swatch color shown next to the theme name in the picker */
  swatch: string;
  colors: {
    danger: string;
    success: string;
    successBackground: string;
    dangerBackground: string;
    background: string;
    surface: string;
    card: string;
    border: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentText: string;
    pillBackground: string;
    pillActiveBackground: string;
    pillActiveText: string;
    inputBackground: string;
    inputBorder: string;
    mapLand: string;
    mapHighlight: string;
  };
}

export const themes: Record<ThemeName, AppTheme> = {
  atlas: {
    name: "atlas",
    label: "Atlas",
    swatch: "#C0563B",
    colors: {
      background: "#F6F1E7",
      surface: "#FBF8F1",
      card: "#FBF8F1",
      border: "#E4DAC4",
      text: "#2B2418",
      textSecondary: "#5C5340",
      textMuted: "#8A8066",
      accent: "#C0563B",
      accentText: "#FFFFFF",
      pillBackground: "#EFE8D8",
      pillActiveBackground: "#C0563B",
      pillActiveText: "#FFFFFF",
      inputBackground: "#FFFFFF",
      inputBorder: "#E4DAC4",
      mapLand: "#DDD3B8",
      mapHighlight: "#C0563B",
    },
  },
  swiss: {
    name: "swiss",
    label: "Swiss",
    swatch: "#E8412C",
    colors: {
      background: "#FFFFFF",
      surface: "#FFFFFF",
      card: "#FFFFFF",
      border: "#D9D9D9",
      text: "#111111",
      textSecondary: "#4A4A4A",
      textMuted: "#8A8A8A",
      accent: "#E8412C",
      accentText: "#FFFFFF",
      pillBackground: "#F0F0F0",
      pillActiveBackground: "#E8412C",
      pillActiveText: "#FFFFFF",
      inputBackground: "#FFFFFF",
      inputBorder: "#D9D9D9",
      mapLand: "#D4D4D4",
      mapHighlight: "#E8412C",
    },
  },
  nocturne: {
    name: "nocturne",
    label: "Nocturne",
    swatch: "#F4C430",
    colors: {
      background: "#10131F",
      surface: "#171B2B",
      card: "#171B2B",
      border: "#2A2F45",
      text: "#F4F1E9",
      textSecondary: "#B7B9C6",
      textMuted: "#7C7F94",
      accent: "#F4C430",
      accentText: "#1A1A1A",
      pillBackground: "#1E2236",
      pillActiveBackground: "#F4C430",
      pillActiveText: "#1A1A1A",
      inputBackground: "#171B2B",
      inputBorder: "#2A2F45",
      mapLand: "#242A42",
      mapHighlight: "#F4C430",
    },
  },
  vintage: {
    name: "vintage",
    label: "Vintage",
    swatch: "#7B4B2A",
    colors: {
      background: "#EDE0C8",
      surface: "#F3E9D4",
      card: "#F3E9D4",
      border: "#D9C7A3",
      text: "#3B2A18",
      textSecondary: "#6B5638",
      textMuted: "#93815F",
      accent: "#7B4B2A",
      accentText: "#FFFFFF",
      pillBackground: "#E3D3AE",
      pillActiveBackground: "#7B4B2A",
      pillActiveText: "#FFFFFF",
      inputBackground: "#F8F1DF",
      inputBorder: "#D9C7A3",
      mapLand: "#D7C69E",
      mapHighlight: "#7B4B2A",
    },
  },
};

export const themeOrder: ThemeName[] = ["atlas", "swiss", "nocturne", "vintage"];
