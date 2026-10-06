import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { ThemedStatusBar } from "@/components/ui/themed-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Alert } from "@/components/ui/app-alert";
import { useProcessData } from "@/context/process-data-context";
import { useSubscription } from "@/context/subscription-context";
import { ServiceAccessNotice } from "@/components/subscriptions/service-access-notice";

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: "hardware-chip-outline" | "key-outline" | "location-outline";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
};

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  autoCapitalize = "sentences",
  maxLength,
}: InputFieldProps) {
  return (
    <View className="mb-5">
      <Text className="font-poppins-semibold text-sm text-agro-text">
        {label}
      </Text>

      <View className="mt-2 flex-row items-center rounded-button border border-agro-line bg-agro-cream px-4">
        <Ionicons name={icon} size={22} color="#68736B" />

        <TextInput
          className="ml-3 flex-1 py-4 font-inter text-base text-agro-text"
          placeholder={placeholder}
          placeholderTextColor="#8A938C"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          maxLength={maxLength}
        />
      </View>
    </View>
  );
}

export default function LinkDeviceScreen() {
  const router = useRouter();
  const { createDevice } = useProcessData();
  const { hasServiceAccess, subscription } = useSubscription();

  const [deviceName, setDeviceName] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [location, setLocation] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  const handleCodeChange = (value: string) => {
    setDeviceCode(value.toUpperCase().replace(/\s/g, ""));
  };

  const handleLinkDevice = async () => {
    if (!hasServiceAccess) {
      Alert.alert(
        "Suscripción requerida",
        "Necesitas un plan activo antes de vincular un dispositivo.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Ver suscripción",
            onPress: () => router.push(subscription ? "/subscriptions/status" : "/subscriptions/plans"),
          },
        ]
      );
      return;
    }
    if (
      !deviceName.trim() ||
      !deviceCode.trim() ||
      !location.trim()
    ) {
      Alert.alert(
        "Campos incompletos",
        "Completa el nombre, código y ubicación del dispositivo."
      );
      return;
    }

    if (deviceCode.trim().length < 6) {
      Alert.alert(
        "Código inválido",
        "El código del dispositivo debe contener al menos 6 caracteres."
      );
      return;
    }

    try {
      setIsLinking(true);
      const registration = await createDevice({
        nombre: deviceName.trim(),
        codigo: deviceCode.trim(),
        tipo: "ESP32",
        ubicacion: location.trim(),
      });
      setGeneratedApiKey(registration.api_key);
      Alert.alert(
        "Dispositivo vinculado",
        `${deviceName.trim()} fue registrado. Guarda la API key que aparece en pantalla; solo se mostrará una vez.`
      );
    } catch (error) {
      Alert.alert(
        "No fue posible vincular el dispositivo",
        error instanceof Error ? error.message : "Intenta nuevamente."
      );
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-agro-cream">
      <ThemedStatusBar />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
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
              className="h-11 w-11 items-center justify-center rounded-full bg-agro-surface shadow-sm active:opacity-60"
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
                Vincular dispositivo
              </Text>

              <Text className="font-inter text-xs text-agro-muted">
                Registra un ESP32 en AgroCoffee AI
              </Text>
            </View>
          </View>

          {/* Ilustración */}
          <View className="my-8 items-center">
            <View className="h-28 w-28 items-center justify-center rounded-full bg-agro-green-light">
              <View className="h-20 w-20 items-center justify-center rounded-3xl bg-agro-green">
                <Ionicons
                  name="hardware-chip-outline"
                  size={47}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <Text className="mt-5 text-center font-poppins-semibold text-lg text-agro-text">
              Información del ESP32
            </Text>

            <Text className="mt-2 max-w-80 text-center font-inter text-sm leading-5 text-agro-muted">
              Introduce los datos proporcionados al configurar el dispositivo.
            </Text>
          </View>

          {/* Formulario o resultado del registro */}
          {!hasServiceAccess ? (
            <ServiceAccessNotice description="La vinculación del ESP32 se habilitará cuando el administrador active tu servicio." />
          ) : generatedApiKey ? (
            <View className="rounded-card bg-agro-surface p-6 shadow-sm">
              <View className="h-14 w-14 items-center justify-center self-center rounded-full bg-agro-green-light">
                <Ionicons name="checkmark-circle" size={34} color="#2F7D32" />
              </View>
              <Text className="mt-4 text-center font-poppins-semibold text-lg text-agro-green-dark">
                ESP32 vinculado correctamente
              </Text>
              <Text className="mt-2 text-center font-inter text-sm leading-5 text-agro-muted">
                Mantén presionada la clave para seleccionarla y copiarla. La necesitarás en config.h de Wokwi.
              </Text>
              <View className="mt-5 rounded-2xl bg-agro-cream p-4">
                <Text className="font-inter-semibold text-xs text-agro-muted">API KEY DEL DISPOSITIVO</Text>
                <Text selectable className="mt-2 font-inter text-sm leading-5 text-agro-text">
                  {generatedApiKey}
                </Text>
              </View>
              <Pressable
                className="mt-6 items-center rounded-button bg-agro-green px-6 py-4"
                onPress={() => router.back()}
              >
                <Text className="font-inter-semibold text-base text-white">Finalizar</Text>
              </Pressable>
            </View>
          ) : (
          <View className="rounded-card bg-agro-surface p-6 shadow-sm">
            <InputField
              label="Nombre del dispositivo"
              placeholder="Ejemplo: Secador principal"
              value={deviceName}
              onChangeText={setDeviceName}
              icon="hardware-chip-outline"
              autoCapitalize="words"
              maxLength={50}
            />

            <InputField
              label="Código o clave del dispositivo"
              placeholder="Ejemplo: ESP32-001"
              value={deviceCode}
              onChangeText={handleCodeChange}
              icon="key-outline"
              autoCapitalize="characters"
              maxLength={30}
            />

            <InputField
              label="Ubicación"
              placeholder="Ejemplo: Área de secado 1"
              value={location}
              onChangeText={setLocation}
              icon="location-outline"
              autoCapitalize="words"
              maxLength={80}
            />

            <View className="flex-row rounded-2xl bg-agro-green-light p-4">
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#2F7D32"
              />

              <Text className="ml-3 flex-1 font-inter text-xs leading-5 text-agro-green-dark">
                La clave identifica al dispositivo y permitirá validar las
                mediciones que envíe a la API.
              </Text>
            </View>

            <Pressable
              className="mt-6 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 active:bg-agro-green-dark disabled:opacity-60"
              onPress={() => void handleLinkDevice()}
              disabled={isLinking || !hasServiceAccess}
              accessibilityRole="button"
            >
              {isLinking ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />

                  <Text className="ml-3 font-inter-semibold text-base text-white">
                    Vinculando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="link-outline"
                    size={23}
                    color="#FFFFFF"
                  />

                  <Text className="ml-2 font-inter-semibold text-base text-white">
                    Vincular ESP32
                  </Text>
                </>
              )}
            </Pressable>
          </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
