import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HumidityChart } from "@/components/dashboard/humidity-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useProcessData } from "@/context/process-data-context";
import { getDryingAppearance } from "@/utils/drying-status";
import { formatElapsedUpdate, formatNumber, toNumber } from "@/utils/format";

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeProcess,
    error,
    isRefreshing,
    latestMeasurement,
    latestPrediction,
    measurements,
    refreshedAt,
    refreshData,
  } = useProcessData();
  const appearance = getDryingAppearance(latestPrediction?.estado_secado);
  const history = [...measurements].reverse().slice(-9);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refreshData(true)} colors={["#2F7D32"]} />}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-agro-green"><Ionicons name="leaf-outline" size={27} color="#FFFFFF" /></View>
            <View className="ml-3">
              <Text className="font-poppins-bold text-xl text-agro-green-dark">AgroCoffee AI</Text>
              <Text className="font-inter text-xs text-agro-muted">{activeProcess ? `Proceso #${activeProcess.id_proceso} activo` : "Sin proceso activo"}</Text>
            </View>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" onPress={() => router.push("/(tabs)/settings")} accessibilityRole="button" accessibilityLabel="Abrir ajustes"><Ionicons name="settings-outline" size={23} color="#2F7D32" /></Pressable>
        </View>

        {error ? <View className="mb-5 flex-row rounded-card bg-red-50 p-4"><Ionicons name="cloud-offline-outline" size={22} color="#D13A32" /><Text className="ml-3 flex-1 font-inter text-sm text-red-700">{error}</Text></View> : null}

        {!activeProcess ? (
          <View className="rounded-card bg-white p-7 shadow-sm">
            <View className="h-16 w-16 items-center justify-center self-center rounded-full bg-agro-green-light"><Ionicons name="leaf-outline" size={34} color="#2F7D32" /></View>
            <Text className="mt-4 text-center font-poppins-semibold text-xl text-agro-text">Comienza un proceso</Text>
            <Text className="mt-2 text-center font-inter text-sm leading-5 text-agro-muted">Crea un lote e inicia su secado para visualizar las mediciones del ESP32 y las predicciones de IA.</Text>
            <Pressable className="mt-5 items-center rounded-button bg-agro-green px-5 py-4" onPress={() => router.push("/batches/create")}><Text className="font-inter-semibold text-white">Crear lote de café</Text></Pressable>
          </View>
        ) : (
          <>
            <Text className="mb-3 font-poppins-semibold text-lg text-agro-text">Estado del secado</Text>
            <View className="rounded-card p-5 shadow-lg" style={{ backgroundColor: appearance.color }}>
              <View className="flex-row items-center"><View className="h-20 w-20 items-center justify-center rounded-full bg-white/15"><Ionicons name={appearance.icon} size={47} color="#FFFFFF" /></View><View className="ml-5 flex-1"><Text className="font-poppins-bold text-2xl text-white">{appearance.label}</Text><Text className="mt-1 font-inter text-sm leading-5 text-white/80">{appearance.description}</Text></View></View>
              <View className="my-5 h-px bg-white/20" />
              <View className="flex-row items-center justify-between"><View className="flex-row items-center"><Ionicons name="time-outline" size={24} color="#FFFFFF" /><Text className="ml-2 font-inter text-sm text-white/80">Tiempo restante estimado</Text></View><Text className="font-poppins-bold text-xl text-agro-yellow">{latestPrediction?.tiempo_restante_horas ? `${formatNumber(latestPrediction.tiempo_restante_horas)} h` : "--"}</Text></View>
            </View>

            <View className="mb-3 mt-7 flex-row items-end justify-between"><View><Text className="font-poppins-semibold text-lg text-agro-text">Variables actuales</Text><Text className="mt-1 font-inter text-xs text-agro-muted">Última lectura recibida</Text></View><View className="flex-row items-center"><View className={`mr-2 h-2 w-2 rounded-full ${latestMeasurement ? "bg-agro-green" : "bg-agro-muted"}`} /><Text className="font-inter-medium text-xs text-agro-green">{latestMeasurement ? "En línea" : "Esperando datos"}</Text></View></View>
            <View className="flex-row flex-wrap justify-between">
              <MetricCard title="Temperatura" value={`${formatNumber(latestMeasurement?.temperatura)} °C`} icon="thermometer-outline" iconColor="#D9534F" iconBackground="#FDECEB" />
              <MetricCard title="Humedad ambiental" value={`${formatNumber(latestMeasurement?.humedad_ambiental)} %`} icon="water-outline" iconColor="#2878C7" iconBackground="#EAF4FF" />
              <MetricCard title="Humedad del café" value={`${formatNumber(latestMeasurement?.humedad_cafe)} %`} icon="cafe-outline" iconColor="#6B3518" iconBackground="#F5ECE7" />
              <MetricCard title="Luminosidad" value={`${formatNumber(latestMeasurement?.luminosidad)} %`} icon="sunny-outline" iconColor="#E6A500" iconBackground="#FFF7D9" />
              <MetricCard title="Tiempo transcurrido" value={`${formatNumber(latestMeasurement?.tiempo_transcurrido_horas)} h`} icon="time-outline" iconColor="#7957D5" iconBackground="#F0EBFF" description="Desde el inicio del proceso" wide />
            </View>
            {history.length > 0 ? <View className="mt-3"><HumidityChart values={history.map((item) => toNumber(item.humedad_cafe))} labels={history.map((item) => `${Math.round(toNumber(item.tiempo_transcurrido_horas))}h`)} currentValue={`${formatNumber(latestMeasurement?.humedad_cafe)} %`} /></View> : null}
            <Text className="mt-5 text-center font-inter text-xs text-agro-muted">{formatElapsedUpdate(refreshedAt)} · actualización automática cada 10 s</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
