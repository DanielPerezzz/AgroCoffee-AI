import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Alert as NativeAlert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProcessData } from "@/context/process-data-context";
import type { DryingAlert } from "@/types/api";
import { formatDateTime } from "@/utils/format";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type Filter = "all" | "warning" | "information";
const filters: Array<{ key: Filter; label: string }> = [{ key: "all", label: "Todas" }, { key: "warning", label: "Advertencias" }, { key: "information", label: "Información" }];
const alertStyles: Record<DryingAlert["nivel"], { icon: IoniconName; color: string; background: string; label: string }> = {
  ADVERTENCIA: { icon: "warning", color: "#E99A00", background: "#FFF4D6", label: "Advertencia" },
  CRITICA: { icon: "alert-circle", color: "#D13A32", background: "#FDE7E5", label: "Crítica" },
  INFORMACION: { icon: "checkmark-circle", color: "#3D8B37", background: "#EAF5E8", label: "Información" },
};

function AlertCard({ alert, onAttend }: { alert: DryingAlert; onAttend: () => Promise<void> }) {
  const appearance = alertStyles[alert.nivel];
  const date = formatDateTime(alert.fecha_hora);
  const showDetails = () => NativeAlert.alert(alert.tipo_alerta.replaceAll("_", " "), alert.mensaje, alert.atendida ? [{ text: "Cerrar" }] : [{ text: "Cancelar", style: "cancel" }, { text: "Marcar atendida", onPress: () => void onAttend() }]);
  return (
    <Pressable className="mb-4 rounded-card border border-black/5 bg-white p-5 shadow-sm active:opacity-80" onPress={showDetails} accessibilityRole="button">
      <View className="flex-row"><View className="h-13 w-13 items-center justify-center rounded-2xl" style={{ width: 52, height: 52, backgroundColor: appearance.background }}><Ionicons name={appearance.icon} size={30} color={appearance.color} /></View><View className="ml-4 flex-1"><View className="flex-row items-center justify-between"><View className="rounded-full px-2.5 py-1" style={{ backgroundColor: appearance.background }}><Text className="font-inter-semibold text-xs" style={{ color: appearance.color }}>{appearance.label}</Text></View><Ionicons name={alert.atendida ? "checkmark-done" : "chevron-forward"} size={21} color={alert.atendida ? "#2F7D32" : "#68736B"} /></View><Text className="mt-3 font-poppins-semibold text-base text-agro-text">{alert.tipo_alerta.replaceAll("_", " ")}</Text><Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">{alert.mensaje}</Text><Text className="mt-4 font-inter text-xs text-agro-muted">{date.time} · {date.date}{alert.atendida ? " · Atendida" : ""}</Text></View></View>
    </Pressable>
  );
}

export default function AlertsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const { alerts, isRefreshing, refreshData, markAlertAttended } = useProcessData();
  const filtered = useMemo(() => selectedFilter === "all" ? alerts : selectedFilter === "information" ? alerts.filter((item) => item.nivel === "INFORMACION") : alerts.filter((item) => item.nivel !== "INFORMACION"), [alerts, selectedFilter]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}><StatusBar style="dark" /><ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refreshData(true)} colors={["#2F7D32"]} />}>
      <View className="flex-row items-end justify-between"><View className="flex-1"><Text className="font-poppins-bold text-3xl text-agro-green-dark">Alertas</Text><Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">Eventos generados por el análisis inteligente.</Text></View><View className="ml-4 h-11 min-w-11 items-center justify-center rounded-full bg-agro-green px-3"><Text className="font-poppins-bold text-base text-white">{alerts.filter((item) => !item.atendida).length}</Text></View></View>
      <View className="my-6 flex-row rounded-full bg-white p-1.5 shadow-sm">{filters.map((filter) => { const selected = selectedFilter === filter.key; return <Pressable key={filter.key} style={{ flex: 1, alignItems: "center", borderRadius: 999, paddingVertical: 11, backgroundColor: selected ? "#101512" : "transparent" }} onPress={() => setSelectedFilter(filter.key)}><Text numberOfLines={1} style={{ color: selected ? "#FFFFFF" : "#68736B", fontFamily: selected ? "Inter_600SemiBold" : "Inter_500Medium", fontSize: 12 }}>{filter.label}</Text></Pressable>; })}</View>
      {filtered.length ? filtered.map((item) => <AlertCard key={item.id_alerta} alert={item} onAttend={() => markAlertAttended(item.id_alerta)} />) : <View className="items-center rounded-card bg-white p-8"><Ionicons name="notifications-off-outline" size={42} color="#68736B" /><Text className="mt-4 font-poppins-semibold text-lg text-agro-text">No hay alertas</Text><Text className="mt-2 text-center font-inter text-sm text-agro-muted">No existen eventos para el filtro seleccionado.</Text></View>}
      <Text className="mt-2 text-center font-inter text-xs text-agro-muted">Pulsa una alerta pendiente para marcarla como atendida</Text>
    </ScrollView></SafeAreaView>
  );
}
