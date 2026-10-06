import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedStatusBar } from "@/components/ui/themed-status-bar";
import { useProcessData } from "@/context/process-data-context";
import { useSubscription } from "@/context/subscription-context";
import { useAppTheme } from "@/context/theme-context";
import type { CoffeeBatch, DryingProcess, ProcessStatus } from "@/types/api";
import { formatNumber, toNumber } from "@/utils/format";

const STATUS_META: Record<
  ProcessStatus,
  { label: string; color: string; light: string; dark: string }
> = {
  EN_PROCESO: {
    label: "En proceso",
    color: "#2F8F46",
    light: "#E8F5EA",
    dark: "#1D3823",
  },
  PAUSADO: {
    label: "Pausado",
    color: "#D58A00",
    light: "#FFF4D6",
    dark: "#3A2D12",
  },
  FINALIZADO: {
    label: "Finalizado",
    color: "#2878C7",
    light: "#EAF4FF",
    dark: "#172E43",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#D9534F",
    light: "#FDECEB",
    dark: "#3B201E",
  },
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function BatchCard({
  batch,
  process,
}: {
  batch: CoffeeBatch;
  process: DryingProcess | null;
}) {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { activeProcess } = useProcessData();
  const { hasServiceAccess } = useSubscription();
  const activeForThisBatch = activeProcess?.id_lote === batch.id_lote;
  const anotherProcessIsActive = Boolean(activeProcess && !activeForThisBatch);
  const status = process ? STATUS_META[process.estado] : null;

  const openProcess = () => {
    if (activeForThisBatch) {
      router.replace("/(tabs)");
      return;
    }
    router.push({
      pathname: "/processes/start",
      params: { batchId: batch.id_lote },
    });
  };

  return (
    <View className="mb-4 rounded-card border border-agro-line bg-agro-surface p-5 shadow-sm">
      <View className="flex-row items-start">
        <View className="h-13 w-13 items-center justify-center rounded-2xl bg-agro-green-light" style={{ width: 52, height: 52 }}>
          <Ionicons name="leaf-outline" size={28} color="#2F7D32" />
        </View>
        <View className="ml-4 flex-1">
          <View className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text className="font-poppins-bold text-lg text-agro-text">
                {batch.codigo_lote}
              </Text>
              <Text className="mt-1 font-inter text-xs text-agro-muted">
                Registrado el {formatDate(batch.fecha_creacion)}
              </Text>
            </View>
            {status ? (
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: isDark ? status.dark : status.light }}
              >
                <Text
                  className="font-inter-semibold text-xs"
                  style={{ color: status.color }}
                >
                  {status.label}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View className="my-4 h-px bg-agro-soft" />
      <View className="flex-row">
        <View className="flex-1 rounded-2xl bg-agro-soft p-4">
          <Text className="font-inter text-xs text-agro-muted">Peso inicial</Text>
          <Text className="mt-1 font-poppins-semibold text-lg text-agro-text">
            {formatNumber(batch.cantidad_kg)} kg
          </Text>
        </View>
        <View className="ml-3 flex-1 rounded-2xl bg-agro-soft p-4">
          <Text className="font-inter text-xs text-agro-muted">Humedad inicial</Text>
          <Text className="mt-1 font-poppins-semibold text-lg text-agro-text">
            {formatNumber(batch.humedad_inicial)} %
          </Text>
        </View>
      </View>

      {!process ? (
        <Text className="mt-4 font-inter text-xs text-agro-muted">
          Este lote todavía no tiene procesos de secado registrados.
        </Text>
      ) : (
        <Text className="mt-4 font-inter text-xs text-agro-muted">
          Último proceso: #{process.id_proceso}
        </Text>
      )}

      <Pressable
        className={`mt-4 flex-row items-center justify-center rounded-button px-4 py-3.5 ${
          hasServiceAccess && !anotherProcessIsActive
            ? "bg-agro-green"
            : "bg-agro-soft"
        }`}
        disabled={!hasServiceAccess || anotherProcessIsActive}
        onPress={openProcess}
        accessibilityRole="button"
      >
        <Ionicons
          name={activeForThisBatch ? "stats-chart-outline" : anotherProcessIsActive ? "lock-closed-outline" : "play-outline"}
          size={20}
          color={hasServiceAccess && !anotherProcessIsActive ? "#FFFFFF" : "#8A938C"}
        />
        <Text
          className={`ml-2 font-inter-semibold text-sm ${
            hasServiceAccess && !anotherProcessIsActive
              ? "text-white"
              : "text-agro-muted"
          }`}
        >
          {activeForThisBatch
            ? "Ver proceso activo"
            : anotherProcessIsActive
              ? "Ya existe otro proceso activo"
              : hasServiceAccess
                ? "Iniciar secado con este lote"
                : "Disponible con una suscripción activa"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function BatchesScreen() {
  const router = useRouter();
  const {
    batches,
    processHistory,
    isRefreshing,
    refreshData,
  } = useProcessData();
  const { hasServiceAccess } = useSubscription();
  const totalWeight = batches.reduce(
    (total, batch) => total + toNumber(batch.cantidad_kg),
    0,
  );

  const latestProcessFor = (batchId: number) =>
    processHistory.find((process) => process.id_lote === batchId) ?? null;

  return (
    <SafeAreaView className="flex-1 bg-agro-cream">
      <ThemedStatusBar />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refreshData(true)}
            colors={["#2F7D32"]}
          />
        }
      >
        <View className="mb-6 flex-row items-center">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-agro-surface shadow-sm"
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={23} color="#2F7D32" />
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="font-poppins-bold text-2xl text-agro-green-dark">
              Lotes registrados
            </Text>
            <Text className="font-inter text-xs text-agro-muted">
              Inventario asociado a tu cuenta
            </Text>
          </View>
        </View>

        <View className="mb-6 flex-row rounded-card bg-agro-green p-5">
          <View className="flex-1">
            <Text className="font-inter text-xs text-white/75">Total de lotes</Text>
            <Text className="mt-1 font-poppins-bold text-2xl text-white">
              {batches.length}
            </Text>
          </View>
          <View className="mx-5 w-px bg-white/20" />
          <View className="flex-1">
            <Text className="font-inter text-xs text-white/75">Peso registrado</Text>
            <Text className="mt-1 font-poppins-bold text-2xl text-white">
              {formatNumber(totalWeight)} kg
            </Text>
          </View>
        </View>

        {batches.length ? (
          batches.map((batch) => (
            <BatchCard
              key={batch.id_lote}
              batch={batch}
              process={latestProcessFor(batch.id_lote)}
            />
          ))
        ) : (
          <View className="items-center rounded-card bg-agro-surface p-8 shadow-sm">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-agro-green-light">
              <Ionicons name="leaf-outline" size={34} color="#2F7D32" />
            </View>
            <Text className="mt-4 text-center font-poppins-semibold text-lg text-agro-text">
              Aún no hay lotes
            </Text>
            <Text className="mt-2 text-center font-inter text-sm leading-5 text-agro-muted">
              Registra el café que deseas monitorear durante el proceso de secado.
            </Text>
          </View>
        )}

        <Pressable
          className={`mt-2 flex-row items-center justify-center rounded-button px-5 py-4 ${
            hasServiceAccess ? "bg-agro-green" : "bg-agro-soft"
          }`}
          onPress={() => router.push("/batches/create")}
          disabled={!hasServiceAccess}
          accessibilityRole="button"
        >
          <Ionicons
            name={hasServiceAccess ? "add-circle-outline" : "lock-closed-outline"}
            size={22}
            color={hasServiceAccess ? "#FFFFFF" : "#8A938C"}
          />
          <Text
            className={`ml-2 font-inter-semibold text-sm ${
              hasServiceAccess ? "text-white" : "text-agro-muted"
            }`}
          >
            {hasServiceAccess ? "Registrar nuevo lote" : "Registro de lotes bloqueado"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
