import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Alert as NativeAlert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type Filter = "all" | "warning" | "information";
type AlertType = "warning" | "critical" | "information";

type DryingAlert = {
  id: number;
  type: AlertType;
  time: string;
  date: string;
  title: string;
  description: string;
  recommendation?: string;
};

const alerts: DryingAlert[] = [
  {
    id: 1,
    type: "warning",
    time: "17:42",
    date: "31 agosto 2026",
    title: "Humedad ambiental elevada",
    description: "La humedad ambiental alcanzó el 78 %.",
    recommendation: "Revisar la ventilación del área de secado.",
  },
  {
    id: 2,
    type: "critical",
    time: "14:12",
    date: "31 agosto 2026",
    title: "Condiciones desfavorables",
    description:
      "Se detectaron condiciones que pueden ralentizar el secado.",
    recommendation:
      "Distribuir nuevamente el café y revisar las condiciones ambientales.",
  },
  {
    id: 3,
    type: "information",
    time: "10:30",
    date: "31 agosto 2026",
    title: "Condiciones normales",
    description:
      "El proceso continúa bajo condiciones adecuadas.",
    recommendation:
      "No se requiere ninguna acción en este momento.",
  },
];

const filters: Array<{
  key: Filter;
  label: string;
}> = [
  { key: "all", label: "Todas" },
  { key: "warning", label: "Advertencias" },
  { key: "information", label: "Información" },
];

const alertStyles: Record<
  AlertType,
  {
    icon: IoniconName;
    color: string;
    background: string;
    label: string;
  }
> = {
  warning: {
    icon: "warning",
    color: "#E99A00",
    background: "#FFF4D6",
    label: "Advertencia",
  },
  critical: {
    icon: "alert-circle",
    color: "#D13A32",
    background: "#FDE7E5",
    label: "Crítica",
  },
  information: {
    icon: "checkmark-circle",
    color: "#3D8B37",
    background: "#EAF5E8",
    label: "Información",
  },
};

type AlertCardProps = {
  alert: DryingAlert;
};

function AlertCard({ alert }: AlertCardProps) {
  const appearance = alertStyles[alert.type];

  const showDetails = () => {
    NativeAlert.alert(
      alert.title,
      `${alert.description}\n\nRecomendación:\n${
        alert.recommendation ?? "No disponible."
      }`
    );
  };

  return (
    <Pressable
      className="mb-4 rounded-card border border-black/5 bg-white p-5 shadow-sm active:opacity-80"
      onPress={showDetails}
      accessibilityRole="button"
      accessibilityLabel={`Abrir alerta: ${alert.title}`}
    >
      <View className="flex-row">
        <View
          className="h-13 w-13 items-center justify-center rounded-2xl"
          style={{
            width: 52,
            height: 52,
            backgroundColor: appearance.background,
          }}
        >
          <Ionicons
            name={appearance.icon}
            size={30}
            color={appearance.color}
          />
        </View>

        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between">
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: appearance.background }}
            >
              <Text
                className="font-inter-semibold text-xs"
                style={{ color: appearance.color }}
              >
                {appearance.label}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#68736B"
            />
          </View>

          <Text className="mt-3 font-poppins-semibold text-base text-agro-text">
            {alert.title}
          </Text>

          <Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">
            {alert.description}
          </Text>

          <View className="mt-4 flex-row items-center">
            <Ionicons
              name="time-outline"
              size={15}
              color="#68736B"
            />

            <Text className="ml-1.5 font-inter text-xs text-agro-muted">
              {alert.time}
            </Text>

            <View className="mx-2 h-1 w-1 rounded-full bg-agro-muted" />

            <Text className="font-inter text-xs text-agro-muted">
              {alert.date}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function AlertsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");

  const filteredAlerts = useMemo(() => {
    if (selectedFilter === "all") {
      return alerts;
    }

    if (selectedFilter === "warning") {
      return alerts.filter(
        (alert) =>
          alert.type === "warning" || alert.type === "critical"
      );
    }

    return alerts.filter(
      (alert) => alert.type === "information"
    );
  }, [selectedFilter]);

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
        <View className="flex-row items-end justify-between">
          <View className="flex-1">
            <Text className="font-poppins-bold text-3xl text-agro-green-dark">
              Alertas
            </Text>

            <Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">
              Eventos y recomendaciones del proceso de secado.
            </Text>
          </View>

          <View className="ml-4 h-11 min-w-11 items-center justify-center rounded-full bg-agro-green px-3">
            <Text className="font-poppins-bold text-base text-white">
              {alerts.length}
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <View className="my-6 flex-row rounded-full bg-white p-1.5 shadow-sm">
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter.key;

            return (
              <Pressable
                key={filter.key}
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
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: isSelected ? "#FFFFFF" : "#68736B",
                    fontFamily: isSelected
                      ? "Inter_600SemiBold"
                      : "Inter_500Medium",
                    fontSize: 12,
                  }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Lista */}
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        ) : (
          <View className="items-center rounded-card bg-white p-8">
            <Ionicons
              name="notifications-off-outline"
              size={42}
              color="#68736B"
            />

            <Text className="mt-4 font-poppins-semibold text-lg text-agro-text">
              No hay alertas
            </Text>

            <Text className="mt-2 text-center font-inter text-sm text-agro-muted">
              No existen eventos para el filtro seleccionado.
            </Text>
          </View>
        )}

        <View className="mt-2 flex-row items-center justify-center">
          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#68736B"
          />

          <Text className="ml-2 font-inter text-xs text-agro-muted">
            Pulsa una alerta para consultar su recomendación
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}