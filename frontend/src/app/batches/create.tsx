import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: IoniconName;
  keyboardType?: "default" | "decimal-pad";
  maxLength?: number;
};

const coffeeVarieties = [
  "Bourbon",
  "Pacamara",
  "Catuai",
  "Otra",
];

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = "default",
  maxLength,
}: FormFieldProps) {
  return (
    <View className="mb-5">
      <Text className="font-poppins-semibold text-sm text-agro-text">
        {label}
      </Text>

      <View className="mt-2 flex-row items-center rounded-button border border-black/10 bg-agro-cream px-4">
        <Ionicons name={icon} size={22} color="#68736B" />

        <TextInput
          className="ml-3 flex-1 py-4 font-inter text-base text-agro-text"
          placeholder={placeholder}
          placeholderTextColor="#8A938C"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCorrect={false}
          maxLength={maxLength}
        />
      </View>
    </View>
  );
}

export default function CreateBatchScreen() {
  const router = useRouter();

  const [batchName, setBatchName] = useState("");
  const [variety, setVariety] = useState("Bourbon");
  const [origin, setOrigin] = useState("");
  const [weight, setWeight] = useState("");
  const [initialHumidity, setInitialHumidity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBatch = () => {
    if (
      !batchName.trim() ||
      !variety ||
      !origin.trim() ||
      !weight.trim() ||
      !initialHumidity.trim()
    ) {
      Alert.alert(
        "Campos incompletos",
        "Completa todos los campos obligatorios del lote."
      );
      return;
    }

    const numericWeight = Number(weight);
    const numericHumidity = Number(initialHumidity);

    if (
      Number.isNaN(numericWeight) ||
      numericWeight <= 0
    ) {
      Alert.alert(
        "Peso inválido",
        "Introduce un peso mayor que cero."
      );
      return;
    }

    if (
      Number.isNaN(numericHumidity) ||
      numericHumidity <= 0 ||
      numericHumidity > 100
    ) {
      Alert.alert(
        "Humedad inválida",
        "La humedad inicial debe estar entre 1 % y 100 %."
      );
      return;
    }

    setIsSaving(true);

    /*
     * Simulación temporal.
     * Posteriormente se realizará un POST a FastAPI.
     */
    setTimeout(() => {
      setIsSaving(false);

      Alert.alert(
        "Lote registrado",
        `${batchName.trim()} fue creado correctamente.`,
        [
          {
            text: "Continuar",
            onPress: () => router.back(),
          },
        ]
      );
    }, 1200);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F7F5ED",
      }}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 12,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Encabezado */}
          <View className="flex-row items-center">
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm active:opacity-60"
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Regresar"
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#2F7D32"
              />
            </Pressable>

            <View className="ml-4 flex-1">
              <Text className="font-poppins-bold text-2xl text-agro-green-dark">
                Crear lote
              </Text>

              <Text className="font-inter text-xs text-agro-muted">
                Paso 1 de 2 · Información del café
              </Text>
            </View>
          </View>

          {/* Progreso */}
          <View className="my-6 h-2 overflow-hidden rounded-full bg-black/5">
            <View className="h-full w-1/2 rounded-full bg-agro-green" />
          </View>

          {/* Introducción */}
          <View className="mb-6 flex-row rounded-card bg-agro-green-light p-4">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-agro-green">
              <Ionicons
                name="leaf-outline"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <Text className="ml-3 flex-1 font-inter text-sm leading-5 text-agro-green-dark">
              Registra las características iniciales del café que será
              monitoreado durante el secado.
            </Text>
          </View>

          {/* Formulario */}
          <View className="rounded-card bg-white p-6 shadow-sm">
            <FormField
              label="Nombre del lote *"
              placeholder="Ejemplo: Lote Café 2026-02"
              value={batchName}
              onChangeText={setBatchName}
              icon="cube-outline"
              maxLength={60}
            />

            {/* Variedad */}
            <View className="mb-5">
              <Text className="font-poppins-semibold text-sm text-agro-text">
                Variedad de café *
              </Text>

              <View className="mt-3 flex-row flex-wrap justify-between">
                {coffeeVarieties.map((option) => {
                  const isSelected = variety === option;

                  return (
                    <Pressable
                      key={option}
                      style={{
                        width: "48%",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: isSelected
                          ? "#2F7D32"
                          : "#E0E4E0",
                        backgroundColor: isSelected
                          ? "#EAF4E7"
                          : "#F7F5ED",
                        paddingVertical: 13,
                      }}
                      onPress={() => setVariety(option)}
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? "#1F5A24"
                            : "#68736B",
                          fontFamily: isSelected
                            ? "Inter_600SemiBold"
                            : "Inter_500Medium",
                          fontSize: 13,
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <FormField
              label="Procedencia o finca *"
              placeholder="Ejemplo: Finca El Porvenir"
              value={origin}
              onChangeText={setOrigin}
              icon="location-outline"
              maxLength={80}
            />

            <FormField
              label="Peso del lote en kilogramos *"
              placeholder="Ejemplo: 50"
              value={weight}
              onChangeText={setWeight}
              icon="scale-outline"
              keyboardType="decimal-pad"
              maxLength={8}
            />

            <FormField
              label="Humedad inicial estimada *"
              placeholder="Ejemplo: 45"
              value={initialHumidity}
              onChangeText={setInitialHumidity}
              icon="water-outline"
              keyboardType="decimal-pad"
              maxLength={5}
            />

            {/* Notas */}
            <View>
              <Text className="font-poppins-semibold text-sm text-agro-text">
                Observaciones
              </Text>

              <View className="mt-2 flex-row items-start rounded-button border border-black/10 bg-agro-cream px-4">
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#68736B"
                  style={{ marginTop: 16 }}
                />

                <TextInput
                  className="ml-3 min-h-28 flex-1 py-4 font-inter text-base text-agro-text"
                  placeholder="Información adicional del lote..."
                  placeholderTextColor="#8A938C"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  textAlignVertical="top"
                  maxLength={300}
                />
              </View>

              <Text className="mt-2 text-right font-inter text-xs text-agro-muted">
                {notes.length}/300
              </Text>
            </View>

            <Pressable
              className="mt-6 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 active:bg-agro-green-dark disabled:opacity-60"
              onPress={handleSaveBatch}
              disabled={isSaving}
              accessibilityRole="button"
            >
              {isSaving ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />

                  <Text className="ml-3 font-inter-semibold text-base text-white">
                    Guardando lote...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text className="ml-2 font-inter-semibold text-base text-white">
                    Guardar lote
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}