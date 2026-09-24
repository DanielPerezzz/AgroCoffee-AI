import Ionicons from "@react-native-vector-icons/ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProcessData } from "@/context/process-data-context";
import type { CoffeeBatch, Device } from "@/types/api";
import { formatNumber } from "@/utils/format";

function Choice({ selected, title, description, icon, onPress }: { selected: boolean; title: string; description: string; icon: React.ComponentProps<typeof Ionicons>["name"]; onPress: () => void }) { return <Pressable className="mb-3 flex-row items-center rounded-card p-4" style={{ borderWidth: 1.5, borderColor: selected ? "#2F7D32" : "#E0E4E0", backgroundColor: selected ? "#EAF4E7" : "#FFFFFF" }} onPress={onPress}><View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: selected ? "#2F7D32" : "#F1F3F1" }}><Ionicons name={icon} size={27} color={selected ? "#FFFFFF" : "#68736B"} /></View><View className="ml-4 flex-1"><Text className="font-poppins-semibold text-sm text-agro-text">{title}</Text><Text className="mt-1 font-inter text-xs text-agro-muted">{description}</Text></View><Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={24} color={selected ? "#2F7D32" : "#B1B8B2"} /></Pressable>; }

export default function StartProcessScreen() {
  const router = useRouter(); const params = useLocalSearchParams<{ batchId?: string }>();
  const { batches, devices, activeProcess, createProcess } = useProcessData();
  const [batchId, setBatchId] = useState<number | null>(null); const [deviceId, setDeviceId] = useState<number | null>(null); const [method, setMethod] = useState("solar"); const [starting, setStarting] = useState(false);
  useEffect(() => { const requested = Number(params.batchId); if (Number.isFinite(requested)) setBatchId(requested); }, [params.batchId]);
  const start = async () => { if (!batchId || !deviceId) { Alert.alert("Configuración incompleta", "Selecciona un lote y un dispositivo."); return; } if (activeProcess) { Alert.alert("Proceso activo", `Ya existe el proceso #${activeProcess.id_proceso}.`); return; } try { setStarting(true); const device = devices.find((item) => item.id_dispositivo === deviceId); await createProcess({ id_lote: batchId, observaciones: `Método: ${method}. Dispositivo planificado: ${device?.codigo ?? deviceId}.` }); Alert.alert("Proceso iniciado", "El proceso está listo para recibir mediciones desde Wokwi.", [{ text: "Ver dashboard", onPress: () => router.replace("/(tabs)") }]); } catch (error) { Alert.alert("No fue posible iniciar", error instanceof Error ? error.message : "Intenta nuevamente."); } finally { setStarting(false); } };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}><StatusBar style="dark" /><ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center"><Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color="#2F7D32" /></Pressable><View className="ml-4"><Text className="font-poppins-bold text-2xl text-agro-green-dark">Iniciar secado</Text><Text className="font-inter text-xs text-agro-muted">Configura el nuevo proceso</Text></View></View>
      {activeProcess ? <View className="mt-6 rounded-card bg-yellow-50 p-4"><Text className="font-inter-semibold text-yellow-800">Ya existe el proceso activo #{activeProcess.id_proceso}.</Text></View> : null}
      <Text className="mb-3 mt-6 font-poppins-semibold text-base text-agro-text">1. Selecciona el lote</Text>{batches.length ? batches.map((batch: CoffeeBatch) => <Choice key={batch.id_lote} selected={batchId === batch.id_lote} title={batch.codigo_lote} description={`${formatNumber(batch.cantidad_kg)} kg · Humedad inicial ${formatNumber(batch.humedad_inicial)} %`} icon="leaf-outline" onPress={() => setBatchId(batch.id_lote)} />) : <Text className="font-inter text-sm text-agro-muted">Primero debes crear un lote.</Text>}
      <Text className="mb-3 mt-5 font-poppins-semibold text-base text-agro-text">2. Selecciona el dispositivo</Text>{devices.length ? devices.map((device: Device) => <Choice key={device.id_dispositivo} selected={deviceId === device.id_dispositivo} title={device.nombre} description={`${device.codigo} · ${device.estado}`} icon="hardware-chip-outline" onPress={() => setDeviceId(device.id_dispositivo)} />) : <Text className="font-inter text-sm text-agro-muted">No hay dispositivos registrados para esta cuenta.</Text>}
      <Text className="mb-3 mt-5 font-poppins-semibold text-base text-agro-text">3. Método de secado</Text><Choice selected={method === "solar"} title="Secado solar" description="Patio o superficie expuesta" icon="sunny-outline" onPress={() => setMethod("solar")} /><Choice selected={method === "cama-elevada"} title="Cama elevada" description="Mayor ventilación natural" icon="grid-outline" onPress={() => setMethod("cama-elevada")} /><Choice selected={method === "mecanico"} title="Secado mecánico" description="Ventilación o calor controlado" icon="settings-outline" onPress={() => setMethod("mecanico")} />
      <Pressable className="mt-6 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 disabled:opacity-60" onPress={() => void start()} disabled={starting || Boolean(activeProcess)}>{starting ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="play" size={23} color="#FFFFFF" />}<Text className="ml-2 font-inter-semibold text-base text-white">{starting ? "Iniciando..." : "Iniciar proceso de secado"}</Text></Pressable>
    </ScrollView></SafeAreaView>
  );
}
