import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { ThemedStatusBar } from "@/components/ui/themed-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedProgressBar } from "@/components/ui/animated-progress-bar";
import { CoffeeLoader } from "@/components/ui/coffee-loader";
import { useAuth } from "@/context/auth-context";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { withJsonHeaders } from "@/services/api";
import type { AdminSubscription, SubscriptionStatus } from "@/types/api";

type Filter = "TODAS" | "PENDIENTES" | "ACTIVAS" | "CERRADAS";

const STATUS_META: Record<
  SubscriptionStatus,
  { label: string; color: string; background: string }
> = {
  SOLICITADA: { label: "Solicitada", color: "#2878C7", background: "#EAF4FF" },
  EN_REVISION: {
    label: "En revisión",
    color: "#A76300",
    background: "#FFF4D6",
  },
  APROBADA: { label: "Aprobada", color: "#2F7D32", background: "#EAF4E7" },
  INSTALACION_PROGRAMADA: {
    label: "Instalación",
    color: "#6B3518",
    background: "#F8ECE5",
  },
  ACTIVA: { label: "Activa", color: "#1F5A24", background: "#DFF2DF" },
  VENCIDA: { label: "Vencida", color: "#68736B", background: "#EEF0EE" },
  CANCELADA: { label: "Cancelada", color: "#C53B32", background: "#FDECEB" },
  RECHAZADA: { label: "Rechazada", color: "#C53B32", background: "#FDECEB" },
};

const NEXT_ACTIONS: Partial<
  Record<SubscriptionStatus, { state: SubscriptionStatus; label: string }>
> = {
  SOLICITADA: { state: "EN_REVISION", label: "Iniciar revisión" },
  EN_REVISION: { state: "APROBADA", label: "Aprobar solicitud" },
  APROBADA: { state: "INSTALACION_PROGRAMADA", label: "Programar instalación" },
  INSTALACION_PROGRAMADA: { state: "ACTIVA", label: "Activar servicio" },
  ACTIVA: { state: "VENCIDA", label: "Marcar como vencida" },
};

const CLOSED_STATES: SubscriptionStatus[] = [
  "VENCIDA",
  "CANCELADA",
  "RECHAZADA",
];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "PENDIENTES", label: "Pendientes" },
  { value: "ACTIVAS", label: "Activas" },
  { value: "CERRADAS", label: "Cerradas" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminSubscriptionsScreen() {
  const router = useRouter();
  const { user, request } = useAuth();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [filter, setFilter] = useState<Filter>("PENDIENTES");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const showInitialLoader = useMinimumLoadingTime(isLoading);

  const loadSubscriptions = useCallback(
    async (silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        setSubscriptions(await request<AdminSubscription[]>("/suscripciones"));
      } catch (error) {
        if (!silent) {
          Alert.alert(
            "No fue posible cargar las solicitudes",
            error instanceof Error ? error.message : "Intenta nuevamente.",
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [request],
  );

  useEffect(() => {
    if (user?.rol !== "ADMINISTRADOR") {
      router.replace("/(tabs)/settings");
      return;
    }

    void loadSubscriptions(true);
    const interval = setInterval(() => void loadSubscriptions(true), 10000);
    return () => clearInterval(interval);
  }, [loadSubscriptions, router, user?.rol]);

  const visibleSubscriptions = useMemo(() => {
    if (filter === "ACTIVAS") {
      return subscriptions.filter((item) => item.estado === "ACTIVA");
    }
    if (filter === "CERRADAS") {
      return subscriptions.filter((item) =>
        CLOSED_STATES.includes(item.estado),
      );
    }
    if (filter === "PENDIENTES") {
      return subscriptions.filter(
        (item) =>
          item.estado !== "ACTIVA" && !CLOSED_STATES.includes(item.estado),
      );
    }
    return subscriptions;
  }, [filter, subscriptions]);

  const pendingCount = subscriptions.filter(
    (item) => item.estado !== "ACTIVA" && !CLOSED_STATES.includes(item.estado),
  ).length;

  const updateStatus = async (
    subscription: AdminSubscription,
    state: SubscriptionStatus,
  ) => {
    try {
      setBusyId(subscription.id_suscripcion);
      const updated = await request<AdminSubscription>(
        `/suscripciones/${subscription.id_suscripcion}/estado`,
        withJsonHeaders({
          method: "PATCH",
          body: JSON.stringify({ estado: state }),
        }),
      );
      setSubscriptions((current) =>
        current.map((item) =>
          item.id_suscripcion === updated.id_suscripcion ? updated : item,
        ),
      );
      Alert.alert(
        "Solicitud actualizada",
        `Nuevo estado: ${STATUS_META[state].label}.`,
      );
    } catch (error) {
      Alert.alert(
        "No fue posible actualizar la solicitud",
        error instanceof Error ? error.message : "Intenta nuevamente.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmStatus = (
    subscription: AdminSubscription,
    state: SubscriptionStatus,
    label: string,
  ) => {
    Alert.alert(
      label,
      `La solicitud de ${subscription.usuario.nombre} cambiará a ${STATUS_META[state].label}.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => void updateStatus(subscription, state),
        },
      ],
    );
  };

  if (showInitialLoader) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-agro-cream">
        <CoffeeLoader label="Cargando solicitudes..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-agro-cream">
      <ThemedStatusBar />
      <FlatList
        data={visibleSubscriptions}
        keyExtractor={(item) => String(item.id_suscripcion)}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadSubscriptions()}
            colors={["#2F7D32"]}
          />
        }
        ListHeaderComponent={
          <>
            <View className="mb-5 mt-3 flex-row items-center">
              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full bg-agro-surface shadow-sm"
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={23} color="#2F7D32" />
              </Pressable>
              <View className="ml-4 flex-1">
                <Text className="font-poppins-bold text-2xl text-agro-green-dark">
                  Suscripciones
                </Text>
                <Text className="font-inter text-xs text-agro-muted">
                  {pendingCount} solicitudes requieren seguimiento
                </Text>
              </View>
            </View>
            <View className="mb-5 flex-row flex-wrap">
              {FILTERS.map((item) => (
                <Pressable
                  key={item.value}
                  className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
                    filter === item.value
                      ? "border-agro-green bg-agro-green"
                      : "border-agro-line bg-agro-surface"
                  }`}
                  onPress={() => setFilter(item.value)}
                >
                  <Text
                    className={`font-inter-semibold text-xs ${
                      filter === item.value ? "text-white" : "text-agro-muted"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="items-center rounded-card bg-agro-surface p-8 shadow-sm">
            <Ionicons
              name="checkmark-done-circle-outline"
              size={44}
              color="#2F7D32"
            />
            <Text className="mt-3 font-poppins-semibold text-lg text-agro-text">
              Sin solicitudes en esta vista
            </Text>
            <Text className="mt-2 text-center font-inter text-sm text-agro-muted">
              La lista se actualiza automáticamente cada 10 segundos.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = STATUS_META[item.estado];
          const next = NEXT_ACTIONS[item.estado];
          const busy = busyId === item.id_suscripcion;
          return (
            <View className="mb-4 rounded-card bg-agro-surface p-5 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <Text className="font-poppins-semibold text-base text-agro-text">
                    {item.usuario.nombre}
                  </Text>
                  <Text className="mt-1 font-inter text-xs text-agro-muted">
                    {item.usuario.correo}
                  </Text>
                </View>
                <View
                  className="rounded-full px-3 py-2"
                  style={{ backgroundColor: meta.background }}
                >
                  <Text
                    className="font-inter-semibold text-xs"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </Text>
                </View>
              </View>

              <View className="my-4 h-px bg-agro-soft" />
              <View className="flex-row justify-between">
                <View>
                  <Text className="font-inter text-xs text-agro-muted">
                    Plan
                  </Text>
                  <Text className="mt-1 font-inter-semibold text-sm text-agro-coffee">
                    {item.plan.nombre}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-inter text-xs text-agro-muted">
                    Solicitud
                  </Text>
                  <Text className="mt-1 font-inter-medium text-xs text-agro-text">
                    {formatDate(item.fecha_solicitud)}
                  </Text>
                </View>
              </View>

              <View className="mt-4">
                <AnimatedProgressBar value={item.progreso_porcentaje} />
              </View>
              <Text className="mt-2 text-right font-inter-semibold text-xs text-agro-green-dark">
                {item.progreso_porcentaje}% del contrato
              </Text>

              {next ? (
                <Pressable
                  className="mt-4 flex-row items-center justify-center rounded-button bg-agro-green px-4 py-3 disabled:opacity-50"
                  disabled={busy}
                  onPress={() => confirmStatus(item, next.state, next.label)}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name="arrow-forward-circle-outline"
                      size={21}
                      color="#FFFFFF"
                    />
                  )}
                  <Text className="ml-2 font-inter-semibold text-sm text-white">
                    {next.label}
                  </Text>
                </Pressable>
              ) : null}

              {[
                "SOLICITADA",
                "EN_REVISION",
                "APROBADA",
                "INSTALACION_PROGRAMADA",
                "ACTIVA",
              ].includes(item.estado) ? (
                <Pressable
                  className="mt-2 items-center py-2 disabled:opacity-50"
                  disabled={busy}
                  onPress={() => {
                    const canReject = ["SOLICITADA", "EN_REVISION"].includes(
                      item.estado,
                    );
                    confirmStatus(
                      item,
                      canReject ? "RECHAZADA" : "CANCELADA",
                      canReject ? "Rechazar solicitud" : "Cancelar suscripción",
                    );
                  }}
                >
                  <Text className="font-inter-semibold text-xs text-agro-red">
                    {["SOLICITADA", "EN_REVISION"].includes(item.estado)
                      ? "Rechazar solicitud"
                      : "Cancelar suscripción"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
