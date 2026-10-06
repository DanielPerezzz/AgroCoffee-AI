import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useSubscription } from "@/context/subscription-context";

type ServiceAccessNoticeProps = {
  description?: string;
  className?: string;
};

export function ServiceAccessNotice({
  description = "Estas funciones estarán disponibles cuando el servicio se encuentre activo.",
  className = "",
}: ServiceAccessNoticeProps) {
  const router = useRouter();
  const { subscription } = useSubscription();

  return (
    <Pressable
      className={`flex-row items-center rounded-card border border-agro-green/15 bg-agro-green-light p-4 active:opacity-70 ${className}`}
      onPress={() =>
        router.push(
          subscription ? "/subscriptions/status" : "/subscriptions/plans",
        )
      }
      accessibilityRole="button"
      accessibilityLabel="Consultar estado de la suscripción"
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-agro-green">
        <Ionicons name="lock-closed-outline" size={23} color="#FFFFFF" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-inter-semibold text-sm text-agro-green-dark">
          {subscription ? "Servicio pendiente de activación" : "Suscripción requerida"}
        </Text>
        <Text className="mt-1 font-inter text-xs leading-4 text-agro-muted">
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={21} color="#2F7D32" />
    </Pressable>
  );
}
