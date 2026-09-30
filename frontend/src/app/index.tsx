import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ImageBackground, Text, View } from "react-native";

import { useAuth } from "@/context/auth-context";

const splashBackground = require("../../assets/brand/splash-background.jpg");
const brandLogo = require("../../assets/brand/agrocoffee-logo.png");

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return undefined;
    }

    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? "/(tabs)" : "/(auth)/login");
    }, 1800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  return (
    <ImageBackground
      source={splashBackground}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={[
          "rgba(11, 48, 28, 0.34)",
          "rgba(18, 78, 42, 0.08)",
          "rgba(11, 48, 28, 0.82)",
        ]}
        locations={[0, 0.48, 1]}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <StatusBar style="light" />

        <View
          className="w-full max-w-sm items-center rounded-card border border-white/50 px-7 py-8"
          style={{ backgroundColor: "rgba(247, 245, 237, 0.90)" }}
        >
          <Image
            source={brandLogo}
            contentFit="contain"
            style={{ width: 82, height: 104 }}
            accessibilityLabel="Logo oficial de AgroCoffee AI"
          />

          <View className="mt-5 flex-row items-center">
            <Text className="font-poppins-bold text-4xl text-agro-green-dark">
              Agro
            </Text>
            <Text className="font-poppins-bold text-4xl text-agro-coffee">
              Coffee
            </Text>
            <Text className="font-poppins-bold text-4xl text-agro-green-dark">
              {" "}AI
            </Text>
          </View>

          <Text className="mt-3 text-center font-inter text-sm leading-6 text-agro-muted">
            Inteligencia artificial e IoT para un secado de café más preciso
          </Text>
        </View>

        <View className="absolute bottom-14 items-center">
          <View className="h-1.5 w-28 overflow-hidden rounded-full bg-white/30">
            <View className="h-full w-2/3 rounded-full bg-agro-yellow" />
          </View>
          <Text className="mt-4 font-inter-medium text-xs text-white/90">
            Preparando el monitoreo
          </Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}
