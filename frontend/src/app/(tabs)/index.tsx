import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HumidityChart } from "@/components/dashboard/humidity-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useProcessData } from "@/context/process-data-context";
import { useSubscription } from "@/context/subscription-context";
import { getDryingAppearance } from "@/utils/drying-status";
import { formatElapsedUpdate, formatNumber, toNumber } from "@/utils/format";

const brandLogo = require("../../../assets/brand/agrocoffee-logo.png");

export default function HomeScreen() {
  const router = useRouter();
  const {
    activeProcess,
    processHistory,
    processes,
    error,
    isRefreshing,
    latestMeasurement,
    latestPrediction,
    measurements,
    refreshedAt,
    refreshData,
    selectProcess,
  } = useProcessData();
  const appearance = getDryingAppearance(latestPrediction?.estado_secado);
  const { hasServiceAccess, subscription } = useSubscription();
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
            <View className="h-12 w-12 items-center justify-center rounded-2xl border border-agro-green/10 bg-white"><Image source={brandLogo} contentFit="contain" style={{ width: 25, height: 32 }} accessibilityLabel="Logo de AgroCoffee AI" /></View>
            <View className="ml-3">
              <Text className="font-poppins-bold text-xl text-agro-green-dark">AgroCoffee AI</Text>
              <Text className="font-inter text-xs text-agro-muted">{activeProcess ? `Proceso #${activeProcess.id_proceso} activo` : "Sin proceso activo"}</Text>
            </View>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" onPress={() => router.push("/(tabs)/settings")} accessibilityRole="button" accessibilityLabel="Abrir ajustes"><Ionicons name="settings-outline" size={23} color="#2F7D32" /></Pressable>
        </View>

        {error ? <View className="mb-5 flex-row rounded-card bg-red-50 p-4"><Ionicons name="cloud-offline-outline" size={22} color="#D13A32" /><Text className="ml-3 flex-1 font-inter text-sm text-red-700">{error}</Text></View> : null}

        {processes.length > 1 ? (
          <View className="mb-5">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="swap-horizontal-outline" size={20} color="#2F7D32" />
              <Text className="ml-2 font-poppins-semibold text-sm text-agro-text">
                Proceso mostrado
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 12 }}
            >
              {processes.map((process) => {
                const selected = process.id_proceso === activeProcess?.id_proceso;
                return (
                  <Pressable
                    key={process.id_proceso}
                    className={`mr-3 min-w-32 rounded-2xl border px-4 py-3 active:opacity-70 ${
                      selected
                        ? "border-agro-green bg-agro-green"
                        : "border-black/10 bg-white"
                    }`}
                    onPress={() => selectProcess(process.id_proceso)}
                    accessibilityRole="button"
                  >
                    <Text
                      className={`font-poppins-semibold text-sm ${
                        selected ? "text-white" : "text-agro-text"
                      }`}
                    >
                      Proceso #{process.id_proceso}
                    </Text>
                    <Text
                      className={`mt-1 font-inter text-xs ${
                        selected ? "text-white/75" : "text-agro-muted"
                      }`}
                    >
                      {process.estado.replaceAll("_", " ")}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {!hasServiceAccess ? <Pressable className="mb-5 flex-row items-center rounded-card bg-agro-green-light p-4" onPress={() => router.push(subscription ? "/subscriptions/status" : "/subscriptions/plans")}><View className="h-11 w-11 items-center justify-center rounded-2xl bg-agro-green"><Ionicons name="card-outline" size={24} color="#FFFFFF" /></View><View className="ml-3 flex-1"><Text className="font-inter-semibold text-sm text-agro-green-dark">Activa el servicio AgroCoffee</Text><Text className="mt-1 font-inter text-xs leading-4 text-agro-muted">{subscription ? "Consulta el avance de tu contrato." : "Elige un plan para utilizar IoT e IA."}</Text></View><Ionicons name="chevron-forward" size={21} color="#2F7D32" /></Pressable> : null}

        {!activeProcess ? (
          <View className="rounded-card bg-white p-7 shadow-sm">
            <View className="h-16 w-16 items-center justify-center self-center rounded-full bg-agro-green-light"><Ionicons name="leaf-outline" size={34} color="#2F7D32" /></View>
            <Text className="mt-4 text-center font-poppins-semibold text-xl text-agro-text">Comienza un proceso</Text>
            <Text className="mt-2 text-center font-inter text-sm leading-5 text-agro-muted">Crea un lote e inicia su secado para visualizar las mediciones del ESP32 y las predicciones de IA.</Text>
            <Pressable className="mt-5 items-center rounded-button bg-agro-green px-5 py-4" onPress={() => router.push("/batches/create")}><Text className="font-inter-semibold text-white">Crear lote de café</Text></Pressable>
            {processHistory.length > 0 ? <Pressable className="mt-3 flex-row items-center justify-center rounded-button border border-agro-green bg-white px-5 py-4" onPress={() => router.push("/processes/history")}><Ionicons name="time-outline" size={21} color="#2F7D32" /><Text className="ml-2 font-inter-semibold text-agro-green-dark">Ver historial de procesos</Text></Pressable> : null}
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
            <Pressable className="mt-5 flex-row items-center justify-center rounded-button border border-agro-green bg-white px-5 py-4" onPress={() => router.push("/processes/history")}><Ionicons name="options-outline" size={21} color="#2F7D32" /><Text className="ml-2 font-inter-semibold text-agro-green-dark">Administrar proceso</Text></Pressable>
            <Text className="mt-5 text-center font-inter text-xs text-agro-muted">{formatElapsedUpdate(refreshedAt)} · actualización automática cada 10 s</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
