import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 1800);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <LinearGradient
  colors={["#173E24", "#2F7D32", "#65A64C"]}
  style={{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }}
>
      <StatusBar style="light" />

      <View
        className="absolute rounded-full bg-white/5"
        style={{
          width: 320,
          height: 320,
          top: -100,
          right: -120,
        }}
      />

      <View
        className="absolute rounded-full bg-agro-yellow/10"
        style={{
          width: 260,
          height: 260,
          bottom: -80,
          left: -100,
        }}
      />

      <View className="h-32 w-32 items-center justify-center rounded-full border border-white/30 bg-white/15">
        <Ionicons name="leaf-outline" size={70} color="#FFFFFF" />
      </View>

      <View className="mt-8 flex-row items-center">
        <Text className="font-poppins-bold text-4xl text-white">
          Agro
        </Text>

        <Text className="font-poppins-bold text-4xl text-agro-yellow">
          Coffee
        </Text>

        <Text className="font-poppins-bold text-4xl text-white">
          {" "}AI
        </Text>
      </View>

      <Text className="mt-4 px-10 text-center font-inter text-base leading-6 text-white/80">
        Inteligencia artificial e IoT para un secado de café más preciso
      </Text>

      <View className="absolute bottom-14 items-center">
        <View className="h-1.5 w-28 overflow-hidden rounded-full bg-white/20">
          <View className="h-full w-2/3 rounded-full bg-agro-yellow" />
        </View>

        <Text className="mt-4 font-inter text-xs text-white/60">
          Preparando el monitoreo
        </Text>
      </View>
    </LinearGradient>
  );
}