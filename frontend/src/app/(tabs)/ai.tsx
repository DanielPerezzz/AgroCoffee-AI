import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { StatusBar } from "expo-status-bar";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProcessData } from "@/context/process-data-context";
import { getDryingAppearance } from "@/utils/drying-status";
import { formatNumber, toNumber } from "@/utils/format";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function Variable({
  icon,
  color,
  label,
  value,
}: {
  icon: IoniconName;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View className="mb-4 flex-row items-center" style={{ width: "48%" }}>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-inter text-xs text-agro-muted" numberOfLines={1}>
          {label}
        </Text>
        <Text className="mt-0.5 font-inter-semibold text-sm text-agro-text">
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function AIScreen() {
  const {
    latestMeasurement: measurement,
    latestPrediction: prediction,
    isRefreshing,
    refreshData,
  } = useProcessData();
  const appearance = getDryingAppearance(prediction?.estado_secado);
  const confidence = Math.min(
    100,
    Math.max(0, toNumber(prediction?.nivel_confianza))
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 120,
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
        <Text className="font-poppins-bold text-3xl text-agro-green-dark">
          Análisis de IA
        </Text>
        <Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">
          Predicción Random Forest basada en la última medición IoT.
        </Text>

        {!prediction || !measurement ? (
          <View className="mt-6 items-center rounded-card bg-white p-8">
            <Ionicons
              name="hardware-chip-outline"
              size={46}
              color="#68736B"
            />
            <Text className="mt-4 text-center font-poppins-semibold text-lg text-agro-text">
              Aún no hay predicción
            </Text>
            <Text className="mt-2 text-center font-inter text-sm text-agro-muted">
              La IA analizará automáticamente la próxima medición recibida.
            </Text>
          </View>
        ) : (
          <>
            <View className="mt-6 rounded-card bg-white p-5 shadow-sm">
              <View className="mb-5 flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-black">
                  <Ionicons
                    name="hardware-chip-outline"
                    size={27}
                    color="#FFFFFF"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-inter-medium text-xs uppercase tracking-wider text-agro-muted">
                    Estado predicho por IA
                  </Text>
                  <Text className="mt-1 font-poppins-semibold text-lg text-agro-text">
                    Análisis inteligente del proceso
                  </Text>
                </View>
              </View>

              <View
                className="flex-row items-center rounded-card p-4"
                style={{ backgroundColor: appearance.softColor }}
              >
                <View
                  className="h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: appearance.color }}
                >
                  <Ionicons
                    name={appearance.icon}
                    size={37}
                    color="#FFFFFF"
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text
                    className="font-poppins-bold text-2xl uppercase"
                    style={{ color: appearance.color }}
                  >
                    {appearance.label}
                  </Text>
                  <Text className="mt-1 font-inter text-sm leading-5 text-agro-text">
                    {appearance.description}
                  </Text>
                </View>
              </View>

              <View className="mt-6">
                <View className="flex-row justify-between">
                  <Text className="font-poppins-semibold text-sm text-agro-text">
                    Confianza del modelo
                  </Text>
                  <Text className="font-poppins-bold text-lg text-agro-green-dark">
                    {formatNumber(confidence)} %
                  </Text>
                </View>
                <View className="mt-3 h-3 overflow-hidden rounded-full bg-black/5">
                  <View
                    className="h-full rounded-full bg-agro-green"
                    style={{ width: `${confidence}%` }}
                  />
                </View>
              </View>
            </View>

            <View className="mt-5 flex-row items-center rounded-card bg-white p-5 shadow-sm">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-agro-green-light">
                <Ionicons name="time-outline" size={31} color="#2F7D32" />
              </View>
              <View className="ml-4">
                <Text className="font-poppins-semibold text-sm text-agro-text">
                  Tiempo restante estimado
                </Text>
                <Text className="mt-1 font-poppins-bold text-3xl text-agro-green">
                  {prediction.tiempo_restante_horas
                    ? `${formatNumber(prediction.tiempo_restante_horas)} horas`
                    : "No disponible"}
                </Text>
              </View>
            </View>

            <View className="mt-5 rounded-card bg-blue-50 p-5">
              <Text className="mb-5 font-poppins-semibold text-base text-agro-text">
                Variables analizadas
              </Text>
              <View className="flex-row flex-wrap justify-between">
                <Variable icon="thermometer-outline" color="#D9534F" label="Temperatura" value={`${formatNumber(measurement.temperatura)} °C`} />
                <Variable icon="cafe-outline" color="#6B3518" label="Humedad del café" value={`${formatNumber(measurement.humedad_cafe)} %`} />
                <Variable icon="water-outline" color="#2878C7" label="Humedad ambiental" value={`${formatNumber(measurement.humedad_ambiental)} %`} />
                <Variable icon="sunny-outline" color="#E6A500" label="Luminosidad" value={`${formatNumber(measurement.luminosidad)} %`} />
                <Variable icon="time-outline" color="#7957D5" label="Tiempo transcurrido" value={`${formatNumber(measurement.tiempo_transcurrido_horas)} h`} />
              </View>
            </View>

            <View className="mt-5 rounded-card bg-agro-green-light p-5">
              <View className="flex-row items-center">
                <Ionicons name="bulb-outline" size={25} color="#2F7D32" />
                <Text className="ml-3 font-poppins-semibold text-lg text-agro-green-dark">
                  Recomendación de IA
                </Text>
              </View>
              <Text className="mt-4 font-inter text-sm leading-6 text-agro-text">
                {prediction.recomendacion ??
                  "Mantenga el monitoreo del proceso."}
              </Text>
            </View>
            <Text className="mt-5 text-center font-inter text-xs text-agro-muted">
              Modelo: {prediction.modelo_version ?? "sin versión"}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
