import Ionicons from "@react-native-vector-icons/ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedStatusBar } from "@/components/ui/themed-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Alert } from "@/components/ui/app-alert";
import { useProcessData } from "@/context/process-data-context";
import { useSubscription } from "@/context/subscription-context";
import { useAppTheme } from "@/context/theme-context";
import { ServiceAccessNotice } from "@/components/subscriptions/service-access-notice";
import type { CoffeeBatch, Device } from "@/types/api";
import { formatNumber } from "@/utils/format";

function Choice({ selected, title, description, icon, onPress }: { selected: boolean; title: string; description: string; icon: React.ComponentProps<typeof Ionicons>["name"]; onPress: () => void }) {
  const { isDark } = useAppTheme();
  const accent = isDark ? "#61B967" : "#2F7D32";

  return (
    <Pressable
      className="mb-3 flex-row items-center rounded-card p-4"
      style={{
        borderWidth: 1.5,
        borderColor: selected ? accent : isDark ? "#37463B" : "#E0E4E0",
        backgroundColor: selected
          ? isDark ? "#1D3722" : "#EAF4E7"
          : isDark ? "#18211B" : "#FFFFFF",
      }}
      onPress={onPress}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: selected
            ? isDark ? "#3B8841" : "#2F7D32"
            : isDark ? "#263129" : "#F1F3F1",
        }}
      >
        <Ionicons
          name={icon}
          size={27}
          color={selected ? "#FFFFFF" : isDark ? "#A9B5AB" : "#68736B"}
        />
      </View>
      <View className="ml-4 flex-1">
        <Text className="font-poppins-semibold text-sm text-agro-text">{title}</Text>
        <Text className="mt-1 font-inter text-xs text-agro-muted">{description}</Text>
      </View>
      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={selected ? accent : isDark ? "#718076" : "#B1B8B2"}
      />
    </Pressable>
  );
}

export default function StartProcessScreen() {
  const router = useRouter(); const params = useLocalSearchParams<{ batchId?: string }>();
  const { isDark } = useAppTheme();
  const { batches, devices, activeProcess, createProcess } = useProcessData();
  const { hasServiceAccess, subscription } = useSubscription();
  const [batchId, setBatchId] = useState<number | null>(null); const [deviceId, setDeviceId] = useState<number | null>(null); const [method, setMethod] = useState("solar"); const [starting, setStarting] = useState(false);
  useEffect(() => { const requested = Number(params.batchId); if (Number.isFinite(requested)) setBatchId(requested); }, [params.batchId]);
  const start = async () => { if (!hasServiceAccess) { Alert.alert("Suscripción requerida", "Necesitas un plan activo para iniciar un proceso de secado.", [{ text: "Cancelar", style: "cancel" }, { text: "Ver suscripción", onPress: () => router.push(subscription ? "/subscriptions/status" : "/subscriptions/plans") }]); return; } if (!batchId || !deviceId) { Alert.alert("Configuración incompleta", "Selecciona un lote y un dispositivo."); return; } if (activeProcess) { Alert.alert("Proceso activo", `Ya existe el proceso #${activeProcess.id_proceso}.`); return; } try { setStarting(true); await createProcess({ id_lote: batchId, id_dispositivo: deviceId, observaciones: `Método: ${method}.` }); Alert.alert("Proceso iniciado", "El proceso está listo para recibir mediciones desde Wokwi.", [{ text: "Ver dashboard", onPress: () => router.replace("/(tabs)") }]); } catch (error) { Alert.alert("No fue posible iniciar", error instanceof Error ? error.message : "Intenta nuevamente."); } finally { setStarting(false); } };
  return (
    <SafeAreaView className="flex-1 bg-agro-cream"><ThemedStatusBar /><ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center"><Pressable className="h-11 w-11 items-center justify-center rounded-full bg-agro-surface shadow-sm" onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color="#2F7D32" /></Pressable><View className="ml-4"><Text className="font-poppins-bold text-2xl text-agro-green-dark">Iniciar secado</Text><Text className="font-inter text-xs text-agro-muted">Configura el nuevo proceso</Text></View></View>
      {!hasServiceAccess ? <ServiceAccessNotice className="mt-6" description="El inicio de procesos se habilitará cuando el administrador active tu servicio." /> : <>
      {activeProcess ? <View className="mt-6 rounded-card p-4" style={{ backgroundColor: isDark ? "#3A2D12" : "#FEFCE8" }}><Text className="font-inter-semibold" style={{ color: isDark ? "#FFD27A" : "#854D0E" }}>Ya existe el proceso activo #{activeProcess.id_proceso}.</Text></View> : null}
      <Text className="mb-3 mt-6 font-poppins-semibold text-base text-agro-text">1. Selecciona el lote</Text>{batches.length ? batches.map((batch: CoffeeBatch) => <Choice key={batch.id_lote} selected={batchId === batch.id_lote} title={batch.codigo_lote} description={`${formatNumber(batch.cantidad_kg)} kg · Humedad inicial ${formatNumber(batch.humedad_inicial)} %`} icon="leaf-outline" onPress={() => setBatchId(batch.id_lote)} />) : <Text className="font-inter text-sm text-agro-muted">Primero debes crear un lote.</Text>}
      <Text className="mb-3 mt-5 font-poppins-semibold text-base text-agro-text">2. Selecciona el dispositivo</Text>{devices.length ? devices.map((device: Device) => <Choice key={device.id_dispositivo} selected={deviceId === device.id_dispositivo} title={device.nombre} description={`${device.codigo} · ${device.estado}`} icon="hardware-chip-outline" onPress={() => setDeviceId(device.id_dispositivo)} />) : <Text className="font-inter text-sm text-agro-muted">No hay dispositivos registrados para esta cuenta.</Text>}
      <Text className="mb-3 mt-5 font-poppins-semibold text-base text-agro-text">3. Método de secado</Text><Choice selected={method === "solar"} title="Secado solar" description="Patio o superficie expuesta" icon="sunny-outline" onPress={() => setMethod("solar")} /><Choice selected={method === "cama-elevada"} title="Cama elevada" description="Mayor ventilación natural" icon="grid-outline" onPress={() => setMethod("cama-elevada")} /><Choice selected={method === "mecanico"} title="Secado mecánico" description="Ventilación o calor controlado" icon="settings-outline" onPress={() => setMethod("mecanico")} />
      <Pressable className="mt-6 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 disabled:opacity-60" onPress={() => void start()} disabled={starting || Boolean(activeProcess)}>{starting ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="play" size={23} color="#FFFFFF" />}<Text className="ml-2 font-inter-semibold text-base text-white">{starting ? "Iniciando..." : "Iniciar proceso de secado"}</Text></Pressable>
      </>}
    </ScrollView></SafeAreaView>
  );
}
