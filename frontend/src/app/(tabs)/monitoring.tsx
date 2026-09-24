import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SensorLineChart } from "@/components/monitoring/sensor-line-chart";
import { useProcessData } from "@/context/process-data-context";
import { formatNumber, toNumber } from "@/utils/format";

type Period = "24h" | "48h" | "all";
const periodOptions: Array<{ key: Period; label: string }> = [{ key: "24h", label: "24 h" }, { key: "48h", label: "48 h" }, { key: "all", label: "Todo" }];

export default function MonitoringScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("48h");
  const { measurements, latestMeasurement, isRefreshing, refreshData } = useProcessData();
  const data = useMemo(() => {
    const chronological = [...measurements].reverse();
    if (selectedPeriod === "all" || chronological.length === 0) return chronological;
    const lastHour = toNumber(chronological.at(-1)?.tiempo_transcurrido_horas);
    const windowHours = selectedPeriod === "24h" ? 24 : 48;
    return chronological.filter((item) => toNumber(item.tiempo_transcurrido_horas) >= lastHour - windowHours);
  }, [measurements, selectedPeriod]);
  const sampled = data.length <= 8 ? data : data.filter((_, index) => index % Math.ceil(data.length / 8) === 0 || index === data.length - 1);
  const labels = sampled.map((item) => `${Math.round(toNumber(item.tiempo_transcurrido_horas))}h`);
  const values = (field: "humedad_cafe" | "temperatura" | "humedad_ambiental" | "luminosidad") => sampled.map((item) => toNumber(item[field]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refreshData(true)} colors={["#2F7D32"]} />}>
        <Text className="font-poppins-bold text-3xl text-agro-green-dark">Monitoreo</Text>
        <Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">Datos históricos enviados por los sensores IoT.</Text>
        <View className="my-6 flex-row rounded-full bg-white p-1.5 shadow-sm">{periodOptions.map((option) => { const selected = selectedPeriod === option.key; return <Pressable key={option.key} style={{ flex: 1, alignItems: "center", borderRadius: 999, paddingVertical: 11, backgroundColor: selected ? "#101512" : "transparent" }} onPress={() => setSelectedPeriod(option.key)}><Text style={{ fontFamily: selected ? "Inter_600SemiBold" : "Inter_500Medium", fontSize: 14, color: selected ? "#FFFFFF" : "#68736B" }}>{option.label}</Text></Pressable>; })}</View>
        {sampled.length === 0 ? <View className="items-center rounded-card bg-white p-8"><Text className="text-center font-poppins-semibold text-lg text-agro-text">Esperando mediciones</Text><Text className="mt-2 text-center font-inter text-sm text-agro-muted">Inicia Wokwi para que el ESP32 envíe datos al proceso activo.</Text></View> : <><SensorLineChart title="Humedad del café (%)" currentValue={`${formatNumber(latestMeasurement?.humedad_cafe)} %`} color="#6B3518" fillColor="#F3E4DB" data={values("humedad_cafe")} labels={labels} minimum={0} maximum={50} /><SensorLineChart title="Temperatura (°C)" currentValue={`${formatNumber(latestMeasurement?.temperatura)} °C`} color="#E56717" fillColor="#FCE7D8" data={values("temperatura")} labels={labels} minimum={0} maximum={50} /><SensorLineChart title="Humedad ambiental (%)" currentValue={`${formatNumber(latestMeasurement?.humedad_ambiental)} %`} color="#2878C7" fillColor="#E2F0FF" data={values("humedad_ambiental")} labels={labels} minimum={0} maximum={100} /><SensorLineChart title="Luminosidad (%)" currentValue={`${formatNumber(latestMeasurement?.luminosidad)} %`} color="#E6A500" fillColor="#FFF3C4" data={values("luminosidad")} labels={labels} minimum={0} maximum={100} /><Text className="text-center font-inter text-xs text-agro-muted">Fuente: ESP32 simulado en Wokwi · PostgreSQL</Text></>}
      </ScrollView>
    </SafeAreaView>
  );
}
