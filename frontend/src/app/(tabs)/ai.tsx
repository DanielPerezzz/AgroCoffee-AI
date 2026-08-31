import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type VariableItemProps = {
  icon: IoniconName;
  iconColor: string;
  label: string;
  value: string;
};

function VariableItem({
  icon,
  iconColor,
  label,
  value,
}: VariableItemProps) {
  return (
    <View className="mb-4 flex-row items-center" style={{ width: "48%" }}>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="font-inter text-xs text-agro-muted"
          numberOfLines={1}
        >
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
  const confidence = 87;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F7F5ED",
      }}
    >
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <Text className="font-poppins-bold text-3xl text-agro-green-dark">
          Análisis de IA
        </Text>

        <Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">
          Predicción inteligente basada en las condiciones actuales del secado.
        </Text>

        {/* Estado predicho */}
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
            style={{ backgroundColor: "#FFF3D2" }}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "#F2A000" }}
            >
              <Ionicons
                name="cloud-outline"
                size={37}
                color="#FFFFFF"
              />

              <View className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full bg-agro-red">
                <Ionicons name="alert" size={18} color="#FFFFFF" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <Text
                className="font-poppins-bold text-2xl uppercase"
                style={{ color: "#E88900" }}
              >
                Secado lento
              </Text>

              <Text className="mt-1 font-inter text-sm leading-5 text-agro-text">
                Se detectaron condiciones de humedad elevada.
              </Text>
            </View>
          </View>

          {/* Confianza */}
          <View className="mt-6">
            <View className="flex-row items-center justify-between">
              <Text className="font-poppins-semibold text-sm text-agro-text">
                Confianza del modelo
              </Text>

              <Text className="font-poppins-bold text-lg text-agro-green-dark">
                {confidence} %
              </Text>
            </View>

            <View className="mt-3 h-3 overflow-hidden rounded-full bg-black/5">
              <View
                className="h-full rounded-full bg-agro-green"
                style={{ width: `${confidence}%` }}
              />
            </View>

            <Text className="mt-2 font-inter text-xs text-agro-muted">
              Nivel de certeza de la predicción actual.
            </Text>
          </View>
        </View>

        {/* Tiempo restante */}
        <View className="mt-5 flex-row items-center rounded-card bg-white p-5 shadow-sm">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-agro-green-light">
            <Ionicons
              name="time-outline"
              size={31}
              color="#2F7D32"
            />
          </View>

          <View className="ml-4">
            <Text className="font-poppins-semibold text-sm text-agro-text">
              Tiempo restante estimado
            </Text>

            <Text className="mt-1 font-poppins-bold text-3xl text-agro-green">
              30 horas
            </Text>
          </View>
        </View>

        {/* Variables analizadas */}
        <View
          className="mt-5 rounded-card p-5"
          style={{ backgroundColor: "#EAF2FE" }}
        >
          <View className="mb-5 flex-row items-center">
            <Ionicons
              name="analytics-outline"
              size={23}
              color="#2878C7"
            />

            <Text className="ml-2 font-poppins-semibold text-base text-agro-text">
              Variables analizadas
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <VariableItem
              icon="thermometer-outline"
              iconColor="#D9534F"
              label="Temperatura"
              value="29 °C"
            />

            <VariableItem
              icon="cafe-outline"
              iconColor="#6B3518"
              label="Humedad del café"
              value="19 %"
            />

            <VariableItem
              icon="water-outline"
              iconColor="#2878C7"
              label="Humedad ambiental"
              value="78 %"
            />

            <VariableItem
              icon="sunny-outline"
              iconColor="#E6A500"
              label="Luminosidad"
              value="72 %"
            />

            <VariableItem
              icon="time-outline"
              iconColor="#7957D5"
              label="Tiempo transcurrido"
              value="36 h"
            />
          </View>
        </View>

        {/* Recomendación */}
        <View
          className="mt-5 rounded-card p-5"
          style={{ backgroundColor: "#EEF6E9" }}
        >
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-agro-green">
              <Ionicons
                name="bulb-outline"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <Text className="ml-3 font-poppins-semibold text-lg text-agro-green-dark">
              Recomendación de IA
            </Text>
          </View>

          <Text className="mt-4 font-inter text-sm leading-6 text-agro-text">
            Las condiciones de humedad ambiental pueden ralentizar el proceso.
            Se recomienda revisar la ventilación del área de secado y mantener
            el café distribuido uniformemente.
          </Text>
        </View>

        {/* Información del modelo */}
        <View className="mt-5 flex-row items-center justify-center">
          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#68736B"
          />

          <Text className="ml-2 font-inter text-xs text-agro-muted">
            Predicción simulada · Modelo en fase de entrenamiento
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}