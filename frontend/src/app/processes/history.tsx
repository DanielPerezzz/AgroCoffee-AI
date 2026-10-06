import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { ThemedStatusBar } from "@/components/ui/themed-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Alert } from "@/components/ui/app-alert";
import { useProcessData } from "@/context/process-data-context";
import type { DryingProcess, ProcessStatus } from "@/types/api";

const STATUS_STYLE: Record<
  ProcessStatus,
  { label: string; color: string; background: string; icon: React.ComponentProps<typeof Ionicons>["name"] }
> = {
  EN_PROCESO: {
    label: "En proceso",
    color: "#2F7D32",
    background: "#EAF4E7",
    icon: "play-circle-outline",
  },
  PAUSADO: {
    label: "Pausado",
    color: "#B7791F",
    background: "#FFF7D6",
    icon: "pause-circle-outline",
  },
  FINALIZADO: {
    label: "Finalizado",
    color: "#2878C7",
    background: "#EAF4FF",
    icon: "checkmark-circle-outline",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#C53B32",
    background: "#FDECEB",
    icon: "close-circle-outline",
  },
};

function formatDate(value: string | null): string {
  if (!value) return "--";
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProcessHistoryScreen() {
  const router = useRouter();
  const {
    processHistory,
    isRefreshing,
    refreshData,
    updateProcessStatus,
  } = useProcessData();
  const [busyProcessId, setBusyProcessId] = useState<number | null>(null);

  const changeStatus = async (
    process: DryingProcess,
    status: ProcessStatus
  ) => {
    try {
      setBusyProcessId(process.id_proceso);
      await updateProcessStatus(process.id_proceso, status);
    } catch (error) {
      Alert.alert(
        "No fue posible actualizar el proceso",
        error instanceof Error ? error.message : "Intenta nuevamente."
      );
    } finally {
      setBusyProcessId(null);
    }
  };

  const confirmFinish = (process: DryingProcess) => {
    Alert.alert(
      "Finalizar proceso",
      "El proceso dejará de recibir mediciones IoT y permanecerá disponible en el historial.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: () => void changeStatus(process, "FINALIZADO"),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-agro-cream">
      <ThemedStatusBar />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 50,
        }}
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
          >
            <Ionicons name="arrow-back" size={23} color="#2F7D32" />
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="font-poppins-bold text-2xl text-agro-green-dark">
              Procesos de secado
            </Text>
            <Text className="font-inter text-xs text-agro-muted">
              Control e historial de tus lotes
            </Text>
          </View>
        </View>

        {processHistory.length === 0 ? (
          <View className="items-center rounded-card bg-agro-surface p-8 shadow-sm">
            <Ionicons name="time-outline" size={42} color="#879088" />
            <Text className="mt-3 font-poppins-semibold text-lg text-agro-text">
              Sin procesos registrados
            </Text>
            <Text className="mt-2 text-center font-inter text-sm text-agro-muted">
              Cuando inicies un secado aparecerá aquí su estado e historial.
            </Text>
          </View>
        ) : (
          processHistory.map((process) => {
            const appearance = STATUS_STYLE[process.estado];
            const isBusy = busyProcessId === process.id_proceso;
            const canControl = ["EN_PROCESO", "PAUSADO"].includes(
              process.estado
            );

            return (
              <View
                key={process.id_proceso}
                className="mb-4 rounded-card bg-agro-surface p-5 shadow-sm"
              >
                <View className="flex-row items-start justify-between">
                  <View>
                    <Text className="font-poppins-bold text-lg text-agro-text">
                      Proceso #{process.id_proceso}
                    </Text>
                    <Text className="mt-1 font-inter text-xs text-agro-muted">
                      Lote #{process.id_lote} · Dispositivo #{process.id_dispositivo ?? "--"}
                    </Text>
                  </View>
                  <View
                    className="flex-row items-center rounded-full px-3 py-2"
                    style={{ backgroundColor: appearance.background }}
                  >
                    <Ionicons
                      name={appearance.icon}
                      size={17}
                      color={appearance.color}
                    />
                    <Text
                      className="ml-1 font-inter-semibold text-xs"
                      style={{ color: appearance.color }}
                    >
                      {appearance.label}
                    </Text>
                  </View>
                </View>

                <View className="my-4 h-px bg-agro-soft" />
                <Text className="font-inter text-xs text-agro-muted">
                  Inicio
                </Text>
                <Text className="mt-1 font-inter-medium text-sm text-agro-text">
                  {formatDate(process.fecha_inicio)}
                </Text>
                {process.fecha_fin ? (
                  <>
                    <Text className="mt-3 font-inter text-xs text-agro-muted">
                      Finalización
                    </Text>
                    <Text className="mt-1 font-inter-medium text-sm text-agro-text">
                      {formatDate(process.fecha_fin)}
                    </Text>
                  </>
                ) : null}
                {process.observaciones ? (
                  <Text className="mt-3 font-inter text-xs leading-5 text-agro-muted">
                    {process.observaciones}
                  </Text>
                ) : null}

                {canControl ? (
                  <View className="mt-5 flex-row">
                    <Pressable
                      className="mr-2 flex-1 flex-row items-center justify-center rounded-button border border-agro-green bg-agro-surface px-3 py-3 disabled:opacity-50"
                      disabled={isBusy}
                      onPress={() =>
                        void changeStatus(
                          process,
                          process.estado === "PAUSADO"
                            ? "EN_PROCESO"
                            : "PAUSADO"
                        )
                      }
                    >
                      {isBusy ? (
                        <ActivityIndicator color="#2F7D32" />
                      ) : (
                        <Ionicons
                          name={
                            process.estado === "PAUSADO"
                              ? "play-outline"
                              : "pause-outline"
                          }
                          size={20}
                          color="#2F7D32"
                        />
                      )}
                      <Text className="ml-2 font-inter-semibold text-xs text-agro-green-dark">
                        {process.estado === "PAUSADO" ? "Reanudar" : "Pausar"}
                      </Text>
                    </Pressable>
                    <Pressable
                      className="ml-2 flex-1 flex-row items-center justify-center rounded-button bg-agro-green px-3 py-3 disabled:opacity-50"
                      disabled={isBusy}
                      onPress={() => confirmFinish(process)}
                    >
                      <Ionicons
                        name="checkmark-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text className="ml-2 font-inter-semibold text-xs text-white">
                        Finalizar
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        <Pressable
          className="mt-2 flex-row items-center justify-center rounded-button bg-agro-green px-5 py-4"
          onPress={() => router.push("/processes/start")}
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text className="ml-2 font-inter-semibold text-sm text-white">
            Iniciar otro proceso
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
