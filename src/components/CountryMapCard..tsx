import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

export default function CountryMapCard({ theme, country }: { theme: any; country: any }) {
  const [mapScope, setMapScope] = useState<"world" | "continent" | "region">("region");

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.cardBackground || "#1E293B", borderColor: theme.colors.border }]}>
      {/* Scope Selector Pills */}
      <View style={styles.pillContainer}>
        {(["world", "continent", "region"] as const).map((scope) => {
          const isActive = mapScope === scope;
          return (
            <Pressable
              key={scope}
              onPress={() => setMapScope(scope)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? theme.colors.accent : "transparent",
                },
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

      {/* Map View Container */}
      <View style={styles.mapContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 400 250">
          {/* Background grid/map area */}
          <Rect width="400" height="250" fill="#0F172A" rx="8" />
          
          {/* Example placeholder path: Render your region/continent SVG paths here */}
          {/* Highlighted Country Path (e.g., Guinea-Bissau in yellow) */}
          <Path
            d="M150,120 L155,125 L152,130 Z" 
            fill={theme.colors.accent || "#FBBF24"} 
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 220,
    justifyContent: "space-between",
  },
  pillContainer: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 2,
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
});