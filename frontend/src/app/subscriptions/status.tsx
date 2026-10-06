import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedProgressBar } from "@/components/ui/animated-progress-bar";
import { CoffeeLoader } from "@/components/ui/coffee-loader";
import { useSubscription } from "@/context/subscription-context";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import type { SubscriptionStatus } from "@/types/api";

const steps = [
  { title: "Solicitud enviada", description: "Recibimos el plan seleccionado." },
  { title: "Validación", description: "Revisamos datos y cobertura." },
  { title: "Contrato aprobado", description: "Se genera el acuerdo del servicio." },
  { title: "Instalación programada", description: "Coordinamos la visita técnica." },
  { title: "Servicio activo", description: "IoT, IA y monitoreo quedan habilitados." },
];

const currentStep: Record<SubscriptionStatus, number> = {
  SOLICITADA: 0,
  EN_REVISION: 1,
  APROBADA: 2,
  INSTALACION_PROGRAMADA: 3,
  ACTIVA: 4,
  VENCIDA: 4,
  CANCELADA: 0,
  RECHAZADA: 1,
};

const statusLabel: Record<SubscriptionStatus, string> = {
  SOLICITADA: "Solicitud recibida",
  EN_REVISION: "En revisión",
  APROBADA: "Contrato aprobado",
  INSTALACION_PROGRAMADA: "Instalación programada",
  ACTIVA: "Servicio activo",
  VENCIDA: "Suscripción vencida",
  CANCELADA: "Solicitud cancelada",
  RECHAZADA: "Solicitud no aprobada",
};

function date(value: string | null): string {
  if (!value) return "Pendiente";
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium" }).format(new Date(value));
}

export default function SubscriptionStatusScreen() {
  const router = useRouter();
  const { subscription, isLoading, error, refreshSubscription } = useSubscription();
  const showInitialLoader = useMinimumLoadingTime(isLoading);

  const goBackOrHome = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  if (showInitialLoader) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-agro-cream">
        <CoffeeLoader label="Consultando tu suscripción..." />
      </SafeAreaView>
    );
  }

  if (!isLoading && !subscription) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED", justifyContent: "center", padding: 24 }}>
        <View className="items-center rounded-card bg-white p-7 shadow-sm">
          <Ionicons name="card-outline" size={54} color="#2F7D32" />
          <Text className="mt-5 text-center font-poppins-semibold text-xl text-agro-text">Aún no tienes un plan</Text>
          <Text className="mt-2 text-center font-inter text-sm leading-5 text-agro-muted">Selecciona una suscripción para iniciar el proceso de contratación.</Text>
          <Pressable className="mt-6 rounded-button bg-agro-green px-6 py-4" onPress={() => router.replace("/subscriptions/plans")}>
            <Text className="font-inter-semibold text-white">Ver planes</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const step = subscription ? currentStep[subscription.estado] : 0;
  const terminalProblem = subscription && ["VENCIDA", "CANCELADA", "RECHAZADA"].includes(subscription.estado);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center">
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" onPress={goBackOrHome}>
            <Ionicons name="arrow-back" size={23} color="#2F7D32" />
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="font-poppins-bold text-2xl text-agro-green-dark">Mi suscripción</Text>
            <Text className="font-inter text-xs text-agro-muted">Seguimiento del contrato y servicio</Text>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white" onPress={() => void refreshSubscription()}>
            <Ionicons name="refresh" size={21} color="#2F7D32" />
          </Pressable>
        </View>

        {error ? <Text className="mt-5 font-inter text-sm text-red-700">{error}</Text> : null}
        {subscription ? (
          <>
            <View className="mt-6 rounded-card bg-agro-green p-6 shadow-sm">
              <Text className="font-inter text-xs uppercase tracking-wider text-white/70">Plan contratado</Text>
              <View className="mt-2 flex-row items-end justify-between">
                <Text className="mr-3 flex-1 font-poppins-bold text-2xl text-white">{subscription.plan.nombre}</Text>
                <Text className="font-poppins-bold text-xl text-agro-yellow">${Number(subscription.plan.precio_mensual).toFixed(2)}/mes</Text>
              </View>
              <View className="mt-5">
                <AnimatedProgressBar
                  value={subscription.progreso_porcentaje}
                  color="#F5B700"
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                  height={12}
                />
              </View>
              <View className="mt-2 flex-row justify-between">
                <Text className="font-inter-semibold text-xs text-white">{statusLabel[subscription.estado]}</Text>
                <Text className="font-inter-semibold text-xs text-white">{subscription.progreso_porcentaje}%</Text>
              </View>
            </View>

            <View className="mt-6 rounded-card bg-white p-5 shadow-sm">
              <Text className="font-poppins-semibold text-lg text-agro-text">Proceso de contratación</Text>
              <View className="mt-5">
                {steps.map((item, index) => {
                  const completed = index <= step && !terminalProblem;
                  const active = index === step;
                  return (
                    <View key={item.title} className="flex-row">
                      <View className="items-center">
                        <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: completed ? "#2F7D32" : active ? "#F5B700" : "#E7EAE7" }}>
                          <Ionicons name={completed ? "checkmark" : active ? "time-outline" : "ellipse-outline"} size={20} color={completed || active ? "#FFFFFF" : "#8A938C"} />
                        </View>
                        {index < steps.length - 1 ? <View className="h-11 w-0.5" style={{ backgroundColor: index < step && !terminalProblem ? "#2F7D32" : "#E7EAE7" }} /> : null}
                      </View>
                      <View className="ml-4 flex-1 pb-5">
                        <Text className="font-inter-semibold text-sm text-agro-text">{item.title}</Text>
                        <Text className="mt-1 font-inter text-xs leading-4 text-agro-muted">{item.description}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="mt-5 rounded-card bg-white p-5 shadow-sm">
              <Text className="font-poppins-semibold text-base text-agro-text">Detalle del servicio</Text>
              <View className="mt-4 flex-row justify-between"><Text className="font-inter text-sm text-agro-muted">Contrato</Text><Text className="font-inter-semibold text-sm text-agro-text">{subscription.codigo_contrato ?? "Pendiente"}</Text></View>
              <View className="mt-3 flex-row justify-between"><Text className="font-inter text-sm text-agro-muted">Solicitud</Text><Text className="font-inter-semibold text-sm text-agro-text">{date(subscription.fecha_solicitud)}</Text></View>
              <View className="mt-3 flex-row justify-between"><Text className="font-inter text-sm text-agro-muted">Inicio</Text><Text className="font-inter-semibold text-sm text-agro-text">{date(subscription.fecha_inicio)}</Text></View>
              <View className="mt-3 flex-row justify-between"><Text className="font-inter text-sm text-agro-muted">Vencimiento</Text><Text className="font-inter-semibold text-sm text-agro-text">{date(subscription.fecha_fin)}</Text></View>
            </View>

            {terminalProblem ? (
              <Pressable className="mt-5 items-center rounded-button bg-agro-green px-5 py-4" onPress={() => router.replace("/subscriptions/plans")}>
                <Text className="font-inter-semibold text-white">Solicitar un nuevo plan</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
