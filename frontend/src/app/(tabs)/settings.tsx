import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { ThemedStatusBar } from "@/components/ui/themed-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Alert } from "@/components/ui/app-alert";
import { useAuth } from "@/context/auth-context";
import { useProcessData } from "@/context/process-data-context";
import { useSubscription } from "@/context/subscription-context";
import { useAppTheme, type ThemeMode } from "@/context/theme-context";
import { API_BASE_URL } from "@/services/api";

function Row({
  icon,
  title,
  description,
  onPress,
  danger = false,
  disabled = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  const content = (
    <View className="flex-row items-center py-4">
      <View
        className={`h-11 w-11 items-center justify-center rounded-2xl ${danger ? "bg-red-50" : disabled ? "bg-agro-soft" : "bg-agro-green-light"}`}
      >
        <Ionicons
          name={icon}
          size={23}
          color={danger ? "#D13A32" : disabled ? "#8A938C" : "#2F7D32"}
        />
      </View>
      <View className="ml-3 flex-1">
        <Text
          className={`font-inter-semibold text-sm ${
            danger
              ? "text-agro-red"
              : disabled
                ? "text-agro-muted"
                : "text-agro-text"
          }`}
        >
          {title}
        </Text>
        <Text className="mt-1 font-inter text-xs leading-4 text-agro-muted">
          {description}
        </Text>
      </View>
      {disabled ? (
        <Ionicons name="lock-closed-outline" size={20} color="#8A938C" />
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={21} color="#8A938C" />
      ) : null}
    </View>
  );
  return onPress && !disabled ? (
    <Pressable onPress={onPress} className="active:opacity-60">
      {content}
    </Pressable>
  ) : (
    content
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeProcess, batches, devices } = useProcessData();
  const { hasServiceAccess, subscription } = useSubscription();
  const { mode, setMode } = useAppTheme();
  const confirmLogout = () =>
    Alert.alert("Cerrar sesión", "¿Deseas cerrar la sesión actual?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => void logout(),
      },
    ]);
  return (
    <SafeAreaView className="flex-1 bg-agro-cream">
      <ThemedStatusBar />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-poppins-bold text-3xl text-agro-green-dark">
          Ajustes
        </Text>
        <Text className="mt-1 font-inter text-sm text-agro-muted">
          Cuenta y recursos conectados.
        </Text>
        <View className="mt-6 flex-row items-center rounded-card bg-agro-green p-5">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Ionicons name="person-outline" size={33} color="#FFFFFF" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="font-poppins-semibold text-lg text-white">
              {user?.nombre ?? "Usuario"}
            </Text>
            <Text className="mt-1 font-inter text-xs text-white/80">
              {user?.correo}
            </Text>
            <Text className="mt-1 font-inter-semibold text-xs text-agro-yellow">
              {user?.rol}
            </Text>
          </View>
        </View>
        <Text className="mb-1 mt-7 font-poppins-semibold text-base text-agro-text">
          Apariencia
        </Text>
        <View className="rounded-card bg-agro-surface p-4 shadow-sm">
          <Text className="font-inter text-xs leading-4 text-agro-muted">
            Elige cómo quieres visualizar AgroCoffee AI. La selección se
            conservará en este dispositivo.
          </Text>
          <View className="mt-4 flex-row rounded-2xl bg-agro-soft p-1.5">
            {(
              [
                { value: "light", label: "Claro", icon: "sunny-outline" },
                { value: "dark", label: "Oscuro", icon: "moon-outline" },
              ] as Array<{
                value: ThemeMode;
                label: string;
                icon: React.ComponentProps<typeof Ionicons>["name"];
              }>
            ).map((option) => {
              const selected = mode === option.value;
              return (
                <Pressable
                  key={option.value}
                  className={`flex-1 flex-row items-center justify-center rounded-xl px-3 py-3 ${
                    selected ? "bg-agro-green" : "bg-transparent"
                  }`}
                  onPress={() => void setMode(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={selected ? "#FFFFFF" : mode === "dark" ? "#A9B5AB" : "#68736B"}
                  />
                  <Text
                    className={`ml-2 font-inter-semibold text-sm ${
                      selected ? "text-white" : "text-agro-muted"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        {user?.rol === "ADMINISTRADOR" ? (
          <>
            <Text className="mb-1 mt-7 font-poppins-semibold text-base text-agro-text">
              Administración
            </Text>
            <View className="rounded-card bg-agro-surface px-4 shadow-sm">
              <Row
                icon="people-outline"
                title="Solicitudes de suscripción"
                description="Revisa contratos y avanza cada solicitud"
                onPress={() => router.push("/admin/subscriptions")}
              />
            </View>
          </>
        ) : null}
        <Text className="mb-1 mt-7 font-poppins-semibold text-base text-agro-text">
          Proyecto
        </Text>
        <View className="rounded-card bg-agro-surface px-4 shadow-sm">
          <Row
            icon="card-outline"
            title={
              subscription
                ? `Plan ${subscription.plan.nombre}`
                : "Sin suscripción"
            }
            description={
              subscription
                ? `Estado: ${subscription.estado.replaceAll("_", " ")}`
                : "Consulta los planes disponibles"
            }
            onPress={() =>
              router.push(
                subscription ? "/subscriptions/status" : "/subscriptions/plans",
              )
            }
          />
          <View className="h-px bg-agro-soft" />
          <Row
            icon="leaf-outline"
            title={`${batches.length} lotes registrados`}
            description={
              activeProcess
                ? `Proceso activo #${activeProcess.id_proceso}`
                : "No hay proceso de secado activo"
            }
            onPress={() => router.push("/batches")}
          />
          <View className="h-px bg-agro-soft" />
          <Row
            icon="hardware-chip-outline"
            title={hasServiceAccess ? `${devices.length} dispositivos` : "Dispositivos bloqueados"}
            description={
              !hasServiceAccess
                ? "Disponible cuando la suscripción esté activa"
                : devices[0]
                ? `${devices[0].nombre} · ${devices[0].estado}`
                : "Ningún ESP32 asociado"
            }
            onPress={() => router.push("/devices/link")}
            disabled={!hasServiceAccess}
          />
          <View className="h-px bg-agro-soft" />
          <Row
            icon="server-outline"
            title="API conectada"
            description={API_BASE_URL}
          />
        </View>
        <Pressable
          className={`mt-6 flex-row items-center justify-center rounded-button border px-5 py-4 ${hasServiceAccess ? "border-agro-green bg-agro-surface" : "border-agro-line bg-agro-soft"}`}
          onPress={() => router.push("/batches/create")}
          disabled={!hasServiceAccess}
        >
          <Ionicons name={hasServiceAccess ? "add-circle-outline" : "lock-closed-outline"} size={23} color={hasServiceAccess ? "#2F7D32" : "#8A938C"} />
          <Text className={`ml-2 font-inter-semibold text-sm ${hasServiceAccess ? "text-agro-green-dark" : "text-agro-muted"}`}>
            {hasServiceAccess ? "Crear nuevo lote" : "Creación de lotes bloqueada"}
          </Text>
        </Pressable>
        <Pressable
          className={`mt-3 flex-row items-center justify-center rounded-button px-5 py-4 ${hasServiceAccess ? "bg-agro-green" : "bg-agro-soft"}`}
          onPress={() => router.push("/processes/start")}
          disabled={!hasServiceAccess}
        >
          <Ionicons name={hasServiceAccess ? "play-outline" : "lock-closed-outline"} size={23} color={hasServiceAccess ? "#FFFFFF" : "#68736B"} />
          <Text className={`ml-2 font-inter-semibold text-sm ${hasServiceAccess ? "text-white" : "text-agro-muted"}`}>
            {hasServiceAccess ? "Iniciar proceso de secado" : "Proceso de secado bloqueado"}
          </Text>
        </Pressable>
        <View className="mt-6 rounded-card bg-agro-surface px-4 shadow-sm">
          <Row
            icon="log-out-outline"
            title="Cerrar sesión"
            description="Elimina los tokens almacenados en este dispositivo"
            onPress={confirmLogout}
            danger
          />
        </View>
        <Text className="mt-6 text-center font-inter text-xs text-agro-muted">
          AgroCoffee AI · prototipo académico
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
