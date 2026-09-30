import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSubscription } from "@/context/subscription-context";
import type { SubscriptionPlan } from "@/types/api";

const activeRequestStates = new Set([
  "SOLICITADA",
  "EN_REVISION",
  "APROBADA",
  "INSTALACION_PROGRAMADA",
  "ACTIVA",
]);

function money(value: string): string {
  return `$${Number(value).toFixed(2)}`;
}

function PlanCard({
  plan,
  highlighted,
  requesting,
  onSelect,
}: {
  plan: SubscriptionPlan;
  highlighted: boolean;
  requesting: boolean;
  onSelect: () => void;
}) {
  return (
    <View
      className="mb-5 overflow-hidden rounded-card bg-white shadow-sm"
      style={{ borderWidth: highlighted ? 2 : 1, borderColor: highlighted ? "#2F7D32" : "#E5E8E5" }}
    >
      {highlighted ? (
        <View className="items-center bg-agro-green py-2">
          <Text className="font-inter-semibold text-xs uppercase tracking-wider text-white">
            Recomendado
          </Text>
        </View>
      ) : null}
      <View className="p-6">
        <View className="flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="font-poppins-bold text-xl text-agro-green-dark">
              {plan.nombre}
            </Text>
            <Text className="mt-2 font-inter text-sm leading-5 text-agro-muted">
              {plan.descripcion}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-poppins-bold text-2xl text-agro-coffee">
              {money(plan.precio_mensual)}
            </Text>
            <Text className="font-inter text-xs text-agro-muted">al mes</Text>
          </View>
        </View>

        <View className="my-5 h-px bg-black/5" />
        {plan.caracteristicas.map((feature) => (
          <View key={feature} className="mb-3 flex-row items-start">
            <Ionicons name="checkmark-circle" size={20} color="#2F7D32" />
            <Text className="ml-3 flex-1 font-inter text-sm leading-5 text-agro-text">
              {feature}
            </Text>
          </View>
        ))}

        <View className="mt-2 rounded-2xl bg-agro-cream p-4">
          <Text className="font-inter-semibold text-xs text-agro-coffee">
            Instalación inicial: {money(plan.costo_instalacion)} por dispositivo
          </Text>
          <Text className="mt-1 font-inter text-xs leading-4 text-agro-muted">
            Incluye configuración del equipo, vinculación y puesta en marcha.
          </Text>
        </View>

        <Pressable
          className="mt-5 flex-row items-center justify-center rounded-button bg-agro-green px-5 py-4 disabled:opacity-60"
          onPress={onSelect}
          disabled={requesting}
        >
          {requesting ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="card-outline" size={21} color="#FFFFFF" />}
          <Text className="ml-2 font-inter-semibold text-base text-white">
            {requesting ? "Enviando solicitud..." : "Solicitar este plan"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const { plans, subscription, isLoading, error, requestPlan } = useSubscription();
  const [requestingId, setRequestingId] = useState<number | null>(null);

  const selectPlan = async (plan: SubscriptionPlan) => {
    if (subscription && activeRequestStates.has(subscription.estado)) {
      router.replace("/subscriptions/status");
      return;
    }

    Alert.alert(
      `Solicitar plan ${plan.nombre}`,
      `Mensualidad de ${money(plan.precio_mensual)} más ${money(plan.costo_instalacion)} por cada dispositivo instalado. En este prototipo no se realizará ningún cobro.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar solicitud",
          onPress: () => {
            void (async () => {
              try {
                setRequestingId(plan.id_plan);
                await requestPlan(plan.id_plan);
                router.replace("/subscriptions/status");
              } catch (requestError) {
                Alert.alert(
                  "No fue posible solicitar el plan",
                  requestError instanceof Error ? requestError.message : "Intenta nuevamente."
                );
              } finally {
                setRequestingId(null);
              }
            })();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center">
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={23} color="#2F7D32" />
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="font-poppins-bold text-2xl text-agro-green-dark">Planes AgroCoffee</Text>
            <Text className="font-inter text-xs text-agro-muted">Elige la capacidad que necesita tu operación</Text>
          </View>
        </View>

        <View className="my-6 rounded-card bg-agro-green p-5">
          <Text className="font-poppins-semibold text-lg text-white">Secado inteligente como servicio</Text>
          <Text className="mt-2 font-inter text-sm leading-5 text-white/80">
            La suscripción habilita el monitoreo IoT, las predicciones de IA, alertas e historial desde la aplicación.
          </Text>
        </View>

        {subscription && activeRequestStates.has(subscription.estado) ? (
          <Pressable className="mb-5 flex-row items-center rounded-card bg-agro-green-light p-4" onPress={() => router.replace("/subscriptions/status")}>
            <Ionicons name="document-text-outline" size={25} color="#2F7D32" />
            <View className="ml-3 flex-1">
              <Text className="font-inter-semibold text-sm text-agro-green-dark">Ya tienes un trámite en curso</Text>
              <Text className="mt-1 font-inter text-xs text-agro-muted">Consulta el avance de tu contrato.</Text>
            </View>
            <Ionicons name="chevron-forward" size={21} color="#2F7D32" />
          </Pressable>
        ) : null}

        {isLoading ? <ActivityIndicator className="mt-10" color="#2F7D32" size="large" /> : null}
        {error ? <Text className="mb-5 font-inter text-sm text-red-700">{error}</Text> : null}
        {plans.map((plan) => (
          <PlanCard
            key={plan.id_plan}
            plan={plan}
            highlighted={plan.codigo === "PROFESIONAL"}
            requesting={requestingId === plan.id_plan}
            onSelect={() => void selectPlan(plan)}
          />
        ))}

        <Text className="text-center font-inter text-xs leading-4 text-agro-muted">
          Valores estimados para la propuesta académica. Impuestos, transporte y reemplazo de hardware se cotizan según ubicación.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
