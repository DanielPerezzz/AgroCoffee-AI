import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type Batch = {
  id: number;
  name: string;
  variety: string;
  weight: string;
  humidity: string;
};

type SelectableCardProps = {
  selected: boolean;
  icon: IoniconName;
  title: string;
  description: string;
  badge?: string;
  onPress: () => void;
};

const batches: Batch[] = [
  {
    id: 1,
    name: "Lote Café 2026-01",
    variety: "Bourbon",
    weight: "50 kg",
    humidity: "45 %",
  },
  {
    id: 2,
    name: "Lote Café 2026-02",
    variety: "Pacamara",
    weight: "35 kg",
    humidity: "48 %",
  },
];

const dryingMethods = [
  {
    key: "solar",
    label: "Secado solar",
    description: "Patio o superficie expuesta",
    icon: "sunny-outline" as IoniconName,
  },
  {
    key: "raised-bed",
    label: "Cama elevada",
    description: "Secado con mayor ventilación",
    icon: "grid-outline" as IoniconName,
  },
  {
    key: "mechanical",
    label: "Secado mecánico",
    description: "Ventilación o calor controlado",
    icon: "settings-outline" as IoniconName,
  },
];

const readingIntervals = [
  { value: 1, label: "1 min" },
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
];

function SelectableCard({
  selected,
  icon,
  title,
  description,
  badge,
  onPress,
}: SelectableCardProps) {
  return (
    <Pressable
      className="mb-3 flex-row items-center rounded-card p-4 active:opacity-70"
      style={{
        borderWidth: 1.5,
        borderColor: selected ? "#2F7D32" : "#E0E4E0",
        backgroundColor: selected ? "#EAF4E7" : "#FFFFFF",
      }}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: selected ? "#2F7D32" : "#F1F3F1",
        }}
      >
        <Ionicons
          name={icon}
          size={27}
          color={selected ? "#FFFFFF" : "#68736B"}
        />
      </View>

      <View className="ml-4 flex-1">
        <Text
          className="font-poppins-semibold text-sm"
          style={{
            color: selected ? "#1F5A24" : "#18201A",
          }}
        >
          {title}
        </Text>

        <Text className="mt-1 font-inter text-xs text-agro-muted">
          {description}
        </Text>

        {badge ? (
          <View className="mt-2 self-start rounded-full bg-white px-2.5 py-1">
            <Text className="font-inter-semibold text-xs text-agro-green-dark">
              {badge}
            </Text>
          </View>
        ) : null}
      </View>

      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={selected ? "#2F7D32" : "#B1B8B2"}
      />
    </Pressable>
  );
}

export default function StartProcessScreen() {
  const router = useRouter();

  const [selectedBatchId, setSelectedBatchId] =
    useState<number | null>(null);

  const [selectedDevice, setSelectedDevice] =
    useState<string | null>(null);

  const [selectedMethod, setSelectedMethod] =
    useState<string | null>(null);

  const [readingInterval, setReadingInterval] = useState(5);
  const [isStarting, setIsStarting] = useState(false);

  const selectedBatch = batches.find(
    (batch) => batch.id === selectedBatchId
  );

  const startProcess = () => {
    setIsStarting(true);

    /*
     * Simulación temporal.
     * Posteriormente se realizará un POST a FastAPI.
     */
    setTimeout(() => {
      setIsStarting(false);

      Alert.alert(
        "Proceso iniciado",
        "El monitoreo del secado comenzó correctamente.",
        [
          {
            text: "Ver dashboard",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    }, 1400);
  };

  const handleStartProcess = () => {
    if (
      !selectedBatchId ||
      !selectedDevice ||
      !selectedMethod
    ) {
      Alert.alert(
        "Configuración incompleta",
        "Selecciona un lote, dispositivo y método de secado."
      );
      return;
    }

    Alert.alert(
      "Iniciar proceso",
      `Se iniciará el monitoreo de ${selectedBatch?.name}.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Iniciar",
          onPress: startProcess,
        },
      ]
    );
  };

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
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View className="flex-row items-center">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm active:opacity-60"
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#2F7D32"
            />
          </Pressable>

          <View className="ml-4 flex-1">
            <Text className="font-poppins-bold text-2xl text-agro-green-dark">
              Iniciar secado
            </Text>

            <Text className="font-inter text-xs text-agro-muted">
              Paso 2 de 2 · Configuración del monitoreo
            </Text>
          </View>
        </View>

        {/* Progreso */}
        <View className="my-6 h-2 overflow-hidden rounded-full bg-black/5">
          <View className="h-full w-full rounded-full bg-agro-green" />
        </View>

        {/* Lote */}
        <Text className="mb-3 font-poppins-semibold text-base text-agro-text">
          1. Selecciona el lote
        </Text>

        {batches.map((batch) => (
          <SelectableCard
            key={batch.id}
            selected={selectedBatchId === batch.id}
            icon="leaf-outline"
            title={batch.name}
            description={`${batch.variety} · ${batch.weight}`}
            badge={`Humedad inicial: ${batch.humidity}`}
            onPress={() => setSelectedBatchId(batch.id)}
          />
        ))}

        {/* Dispositivo */}
        <Text className="mb-3 mt-5 font-poppins-semibold text-base text-agro-text">
          2. Selecciona el dispositivo
        </Text>

        <SelectableCard
          selected={selectedDevice === "ESP32-001"}
          icon="hardware-chip-outline"
          title="ESP32-001"
          description="Dispositivo principal · Área de secado 1"
          badge="En línea"
          onPress={() => setSelectedDevice("ESP32-001")}
        />

        {/* Método */}
        <Text className="mb-3 mt-5 font-poppins-semibold text-base text-agro-text">
          3. Método de secado
        </Text>

        {dryingMethods.map((method) => (
          <SelectableCard
            key={method.key}
            selected={selectedMethod === method.key}
            icon={method.icon}
            title={method.label}
            description={method.description}
            onPress={() => setSelectedMethod(method.key)}
          />
        ))}

        {/* Intervalo */}
        <Text className="mb-3 mt-5 font-poppins-semibold text-base text-agro-text">
          4. Frecuencia de lectura
        </Text>

        <View className="flex-row rounded-full bg-white p-1.5 shadow-sm">
          {readingIntervals.map((interval) => {
            const selected = readingInterval === interval.value;

            return (
              <Pressable
                key={interval.value}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  paddingVertical: 11,
                  backgroundColor: selected
                    ? "#101512"
                    : "transparent",
                }}
                onPress={() => setReadingInterval(interval.value)}
              >
                <Text
                  style={{
                    fontFamily: selected
                      ? "Inter_600SemiBold"
                      : "Inter_500Medium",
                    fontSize: 13,
                    color: selected ? "#FFFFFF" : "#68736B",
                  }}
                >
                  {interval.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Resumen */}
        <View className="mt-6 rounded-card bg-agro-green-light p-5">
          <View className="flex-row items-center">
            <Ionicons
              name="document-text-outline"
              size={24}
              color="#2F7D32"
            />

            <Text className="ml-2 font-poppins-semibold text-base text-agro-green-dark">
              Resumen
            </Text>
          </View>

          <View className="mt-4">
            <Text className="font-inter text-sm text-agro-green-dark">
              Lote:{" "}
              <Text className="font-inter-semibold">
                {selectedBatch?.name ?? "Sin seleccionar"}
              </Text>
            </Text>

            <Text className="mt-2 font-inter text-sm text-agro-green-dark">
              Dispositivo:{" "}
              <Text className="font-inter-semibold">
                {selectedDevice ?? "Sin seleccionar"}
              </Text>
            </Text>

            <Text className="mt-2 font-inter text-sm text-agro-green-dark">
              Método:{" "}
              <Text className="font-inter-semibold">
                {dryingMethods.find(
                  (method) => method.key === selectedMethod
                )?.label ?? "Sin seleccionar"}
              </Text>
            </Text>

            <Text className="mt-2 font-inter text-sm text-agro-green-dark">
              Lecturas cada:{" "}
              <Text className="font-inter-semibold">
                {readingInterval} minutos
              </Text>
            </Text>
          </View>
        </View>

        {/* Botón */}
        <Pressable
          className="mt-6 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 active:bg-agro-green-dark disabled:opacity-60"
          onPress={handleStartProcess}
          disabled={isStarting}
          accessibilityRole="button"
        >
          {isStarting ? (
            <>
              <ActivityIndicator color="#FFFFFF" />

              <Text className="ml-3 font-inter-semibold text-base text-white">
                Iniciando monitoreo...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="play" size={23} color="#FFFFFF" />

              <Text className="ml-2 font-inter-semibold text-base text-white">
                Iniciar proceso de secado
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}