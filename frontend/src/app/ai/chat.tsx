import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ContextualChat } from "@/components/ai/contextual-chat";
import { useProcessData } from "@/context/process-data-context";

export default function AIChatScreen() {
  const router = useRouter();
  const { activeProcess } = useProcessData();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1F5F28" }}>
      <StatusBar style="light" />
      <View className="flex-row items-center bg-agro-green-dark px-4 py-4">
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-full bg-white/15 active:opacity-60"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Regresar"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="font-poppins-semibold text-lg text-white">
            Asistente AgroCoffee
          </Text>
          <Text className="font-inter text-xs text-white/75">
            {activeProcess
              ? `Proceso #${activeProcess.id_proceso} · Datos IoT en contexto`
              : "Consulta contextual del secado"}
          </Text>
        </View>

        <View className="h-3 w-3 rounded-full bg-green-300" />
      </View>

      <ContextualChat processId={activeProcess?.id_proceso} />
    </SafeAreaView>
  );
}
