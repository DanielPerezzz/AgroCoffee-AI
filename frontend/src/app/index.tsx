import Ionicons from "@react-native-vector-icons/ionicons";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-agro-cream px-6">
      <View className="w-full rounded-card bg-white p-8 shadow-lg">
        <View className="mb-5 h-20 w-20 items-center justify-center self-center rounded-full bg-agro-green">
          <Ionicons name="leaf-outline" size={42} color="#FFFFFF" />
        </View>

        <Text className="text-center font-poppins-bold text-3xl text-agro-green-dark">
          AgroCoffee AI
        </Text>

        <Text className="mt-3 text-center font-inter text-base leading-6 text-agro-muted">
          Monitoreo inteligente del proceso de secado de café
        </Text>

        <View className="mt-8 flex-row items-center justify-center gap-3 rounded-button bg-agro-green px-6 py-4">
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />

          <Text className="font-inter-semibold text-lg text-white">
            Recursos configurados
          </Text>
        </View>

        <Text className="mt-5 text-center font-poppins-semibold text-sm text-agro-coffee">
          Poppins para títulos · Inter para contenido
        </Text>
      </View>
    </View>
  );
}