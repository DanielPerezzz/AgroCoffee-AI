import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SensorLineChart } from "@/components/monitoring/sensor-line-chart";

type Period = "24h" | "48h" | "all";

type PeriodData = {
  labels: string[];
  coffeeHumidity: number[];
  temperature: number[];
  ambientHumidity: number[];
  luminosity: number[];
};

const periodData: Record<Period, PeriodData> = {
  "24h": {
    labels: ["0h", "6h", "12h", "18h", "24h"],
    coffeeHumidity: [23, 22, 21, 20, 19],
    temperature: [27, 28, 30, 29, 29],
    ambientHumidity: [74, 77, 80, 79, 78],
    luminosity: [65, 76, 85, 78, 72],
  },

  "48h": {
    labels: ["0h", "12h", "24h", "36h", "48h"],
    coffeeHumidity: [25, 23, 21, 20, 19],
    temperature: [27, 28, 30, 31, 29],
    ambientHumidity: [72, 80, 84, 76, 78],
    luminosity: [63, 80, 88, 81, 72],
  },

  all: {
    labels: ["0h", "18h", "36h", "54h", "72h"],
    coffeeHumidity: [28, 25, 22, 20, 19],
    temperature: [26, 29, 31, 28, 29],
    ambientHumidity: [70, 82, 76, 80, 78],
    luminosity: [58, 86, 91, 79, 72],
  },
};

const periodOptions: Array<{
  key: Period;
  label: string;
}> = [
  { key: "24h", label: "24 h" },
  { key: "48h", label: "48 h" },
  { key: "all", label: "Todo" },
];

export default function MonitoringScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("48h");

  const selectedData = periodData[selectedPeriod];

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
        <Text className="font-poppins-bold text-3xl text-agro-green-dark">
          Monitoreo
        </Text>

        <Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">
          Consulta el comportamiento histórico de las variables del secado.
        </Text>

        {/* Selector de periodo */}
        <View className="my-6 flex-row rounded-full bg-white p-1.5 shadow-sm">
          {periodOptions.map((option) => {
            const isSelected = selectedPeriod === option.key;

            return (
              <Pressable
                key={option.key}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  paddingVertical: 11,
                  backgroundColor: isSelected
                    ? "#101512"
                    : "transparent",
                }}
                onPress={() => setSelectedPeriod(option.key)}
              >
                <Text
                  style={{
                    fontFamily: isSelected
                      ? "Inter_600SemiBold"
                      : "Inter_500Medium",
                    fontSize: 14,
                    color: isSelected ? "#FFFFFF" : "#68736B",
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SensorLineChart
          title="Humedad del café (%)"
          currentValue="19 %"
          color="#6B3518"
          fillColor="#F3E4DB"
          data={selectedData.coffeeHumidity}
          labels={selectedData.labels}
          minimum={13}
          maximum={30}
        />

        <SensorLineChart
          title="Temperatura (°C)"
          currentValue="29 °C"
          color="#E56717"
          fillColor="#FCE7D8"
          data={selectedData.temperature}
          labels={selectedData.labels}
          minimum={20}
          maximum={35}
        />

        <SensorLineChart
          title="Humedad ambiental (%)"
          currentValue="78 %"
          color="#2878C7"
          fillColor="#E2F0FF"
          data={selectedData.ambientHumidity}
          labels={selectedData.labels}
          minimum={50}
          maximum={100}
        />

        <SensorLineChart
          title="Luminosidad (%)"
          currentValue="72 %"
          color="#E6A500"
          fillColor="#FFF3C4"
          data={selectedData.luminosity}
          labels={selectedData.labels}
          minimum={40}
          maximum={100}
        />

        <Text className="text-center font-inter text-xs text-agro-muted">
          Los datos mostrados son simulados para la primera fase.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}