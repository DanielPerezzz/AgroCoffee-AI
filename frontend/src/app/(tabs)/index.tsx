import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HumidityChart } from "@/components/dashboard/humidity-chart";
import { MetricCard } from "@/components/dashboard/metric-card";

export default function HomeScreen() {
  const router = useRouter();

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
          paddingTop: 12,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-agro-green">
              <Ionicons name="leaf-outline" size={27} color="#FFFFFF" />
            </View>

            <View className="ml-3">
              <Text className="font-poppins-bold text-xl text-agro-green-dark">
                AgroCoffee AI
              </Text>

              <Text className="font-inter text-xs text-agro-muted">
                Proceso de secado activo
              </Text>
            </View>
          </View>

          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
            onPress={() => router.push("/(tabs)/settings")}
            accessibilityRole="button"
            accessibilityLabel="Abrir ajustes"
          >
            <Ionicons
              name="settings-outline"
              size={23}
              color="#2F7D32"
            />
          </Pressable>
        </View>

        {/* Estado del secado */}
        <Text className="mb-3 font-poppins-semibold text-lg text-agro-text">
          Estado del secado
        </Text>

        <View className="rounded-card bg-agro-green p-5 shadow-lg">
          <View className="flex-row items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-white/15">
              <Ionicons name="leaf-outline" size={47} color="#FFFFFF" />
            </View>

            <View className="ml-5 flex-1">
              <View className="flex-row items-center">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#DFF6D8"
                />

                <Text className="ml-2 font-poppins-bold text-2xl text-white">
                  Favorable
                </Text>
              </View>

              <Text className="mt-1 font-inter text-sm leading-5 text-white/80">
                El proceso se encuentra bajo condiciones adecuadas.
              </Text>
            </View>
          </View>

          <View className="my-5 h-px bg-white/20" />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={24} color="#FFFFFF" />

              <Text className="ml-2 font-inter text-sm text-white/80">
                Tiempo restante estimado
              </Text>
            </View>

            <Text className="font-poppins-bold text-xl text-agro-yellow">
              30 h
            </Text>
          </View>
        </View>

        {/* Variables actuales */}
        <View className="mb-3 mt-7 flex-row items-end justify-between">
          <View>
            <Text className="font-poppins-semibold text-lg text-agro-text">
              Variables actuales
            </Text>

            <Text className="mt-1 font-inter text-xs text-agro-muted">
              Última lectura recibida
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="mr-2 h-2 w-2 rounded-full bg-agro-green" />

            <Text className="font-inter-medium text-xs text-agro-green">
              En línea
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <MetricCard
            title="Temperatura"
            value="29 °C"
            icon="thermometer-outline"
            iconColor="#D9534F"
            iconBackground="#FDECEB"
            trend="+1.2 °C"
            trendDirection="up"
          />

          <MetricCard
            title="Humedad ambiental"
            value="78 %"
            icon="water-outline"
            iconColor="#2878C7"
            iconBackground="#EAF4FF"
            trend="-2.3 %"
            trendDirection="down"
          />

          <MetricCard
            title="Humedad del café"
            value="19 %"
            icon="cafe-outline"
            iconColor="#6B3518"
            iconBackground="#F5ECE7"
            trend="-0.8 %"
            trendDirection="down"
          />

          <MetricCard
            title="Luminosidad"
            value="72 %"
            icon="sunny-outline"
            iconColor="#E6A500"
            iconBackground="#FFF7D9"
            description="Comparado con hace 1 h"
          />

          <MetricCard
            title="Tiempo transcurrido"
            value="36 horas"
            icon="time-outline"
            iconColor="#7957D5"
            iconBackground="#F0EBFF"
            description="Desde el inicio del proceso"
            wide
          />
        </View>

        {/* Gráfico */}
        <View className="mt-3">
          <HumidityChart />
        </View>

        <Text className="mt-5 text-center font-inter text-xs text-agro-muted">
          Actualizado hace menos de un minuto
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}