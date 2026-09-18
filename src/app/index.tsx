import { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Pre-required asset from assets/app_images
const splashBgImage = require("../../assets/app_images/splashScreen.jpg");

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={splashBgImage}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.overlay}>
          <SafeAreaProvider style={styles.safeArea}>
            <View style={styles.contentContainer}>
              {/* Branding Section */}
              <View style={styles.brandContainer}>
                <Text style={styles.title}>WorldWise</Text>
                <Text style={styles.subtitle}>
                  Explore. Learn. Quiz yourself on the world.
                </Text>
              </View>

              {/* Bottom Loader */}
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            </View>
          </SafeAreaProvider>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 12, 0.45)",
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#f3f4f1",
    textAlign: "center",
    maxWidth: "85%",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loaderContainer: {
    marginBottom: 10,
  },
});