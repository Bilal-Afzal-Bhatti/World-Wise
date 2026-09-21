import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
export default function RootLayout() {
  useEffect(() => {
    const unlockOrientations = async () => {
      // Forcefully unlock all native device rotations upon boot
      await ScreenOrientation.unlockAsync();
    };
    unlockOrientations();

    // Cleanup listener on unmount
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
               <Stack.Screen name="about" />
            </Stack>
          </SafeAreaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
