import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps, ReactNode } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type SettingsRowProps = {
  icon: IoniconName;
  iconColor?: string;
  iconBackground?: string;
  title: string;
  description?: string;
  onPress?: () => void;
  rightContent?: ReactNode;
  danger?: boolean;
};

function SettingsRow({
  icon,
  iconColor = "#2F7D32",
  iconBackground = "#EAF4E7",
  title,
  description,
  onPress,
  rightContent,
  danger = false,
}: SettingsRowProps) {
  const content = (
    <View className="flex-row items-center py-4">
      <View
        className="h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: iconBackground }}
      >
        <Ionicons name={icon} size={23} color={iconColor} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="font-inter-semibold text-sm"
          style={{ color: danger ? "#D13A32" : "#18201A" }}
        >
          {title}
        </Text>

        {description ? (
          <Text className="mt-1 font-inter text-xs leading-4 text-agro-muted">
            {description}
          </Text>
        ) : null}
      </View>

      {rightContent ?? (
        <Ionicons
          name="chevron-forward"
          size={21}
          color="#8A938C"
        />
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="active:opacity-60"
    >
      {content}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [criticalAlertsEnabled, setCriticalAlertsEnabled] =
    useState(true);

  const showPendingFeature = (feature: string) => {
    Alert.alert(
      feature,
      "Esta función se conectará posteriormente con FastAPI."
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar la sesión actual?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: () => {
            /*
             * Posteriormente también eliminaremos aquí
             * los tokens almacenados en SecureStore.
             */
            router.replace("/(auth)/login");
          },
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
          paddingTop: 14,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <Text className="font-poppins-bold text-3xl text-agro-green-dark">
          Ajustes
        </Text>

        <Text className="mt-1 font-inter text-sm leading-5 text-agro-muted">
          Administra tu cuenta, dispositivo y preferencias.
        </Text>

        {/* Perfil */}
        <View className="mt-6 flex-row items-center rounded-card bg-agro-green p-5 shadow-lg">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Text className="font-poppins-bold text-xl text-white">
              DP
            </Text>
          </View>

          <View className="ml-4 flex-1">
            <Text className="font-poppins-semibold text-lg text-white">
              Daniel Pérez
            </Text>

            <Text className="mt-1 font-inter text-sm text-white/75">
              Productor
            </Text>

            <Text className="mt-1 font-inter text-xs text-white/60">
              productor@agrocoffee.com
            </Text>
          </View>

          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white/15 active:opacity-60"
            onPress={() => showPendingFeature("Editar perfil")}
          >
            <Ionicons name="pencil-outline" size={21} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Cuenta */}
        <Text className="mb-2 mt-7 font-poppins-semibold text-base text-agro-text">
          Cuenta
        </Text>

        <View className="rounded-card bg-white px-5 shadow-sm">
          <SettingsRow
            icon="person-outline"
            title="Información personal"
            description="Nombre, correo electrónico y rol"
            onPress={() => showPendingFeature("Información personal")}
          />

          <View className="h-px bg-black/5" />

          <SettingsRow
            icon="lock-closed-outline"
            iconColor="#7957D5"
            iconBackground="#F0EBFF"
            title="Seguridad"
            description="Contraseña y sesiones activas"
            onPress={() => showPendingFeature("Seguridad")}
          />
        </View>

        {/* Dispositivo */}
        <Text className="mb-2 mt-7 font-poppins-semibold text-base text-agro-text">
          Dispositivo IoT
        </Text>

        <View className="rounded-card bg-white px-5 shadow-sm">
          <SettingsRow
            icon="hardware-chip-outline"
            title="ESP32-001"
            description="Dispositivo principal del área de secado"
            onPress={() => showPendingFeature("Administrar dispositivo")}
            rightContent={
              <View className="flex-row items-center rounded-full bg-agro-green-light px-3 py-1.5">
                <View className="mr-2 h-2 w-2 rounded-full bg-agro-green" />

                <Text className="font-inter-semibold text-xs text-agro-green-dark">
                  En línea
                </Text>
              </View>
            }
          />

          <View className="h-px bg-black/5" />

          <SettingsRow
            icon="add-circle-outline"
            iconColor="#2878C7"
            iconBackground="#EAF4FF"
            title="Vincular dispositivo"
            description="Registrar otro ESP32 mediante su clave"
            onPress={() => showPendingFeature("Vincular dispositivo")}
          />
        </View>

        {/* Proceso activo */}
        <Text className="mb-2 mt-7 font-poppins-semibold text-base text-agro-text">
          Proceso activo
        </Text>

        <View className="rounded-card bg-white p-5 shadow-sm">
          <View className="flex-row items-start">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-agro-green-light">
              <Ionicons name="leaf-outline" size={27} color="#2F7D32" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="font-poppins-semibold text-base text-agro-text">
                Lote Café 2026-01
              </Text>

              <Text className="mt-1 font-inter text-xs text-agro-muted">
                Inicio: 30 agosto 2026
              </Text>

              <View className="mt-3 self-start rounded-full bg-agro-green-light px-3 py-1.5">
                <Text className="font-inter-semibold text-xs text-agro-green-dark">
                  Secado favorable
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferencias */}
        <Text className="mb-2 mt-7 font-poppins-semibold text-base text-agro-text">
          Preferencias
        </Text>

        <View className="rounded-card bg-white px-5 shadow-sm">
          <SettingsRow
            icon="notifications-outline"
            iconColor="#E99A00"
            iconBackground="#FFF4D6"
            title="Notificaciones"
            description="Recibir actualizaciones del proceso"
            rightContent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: "#D7DDD8",
                  true: "#8BCB8E",
                }}
                thumbColor={
                  notificationsEnabled ? "#2F7D32" : "#F4F4F4"
                }
              />
            }
          />

          <View className="h-px bg-black/5" />

          <SettingsRow
            icon="warning-outline"
            iconColor="#D13A32"
            iconBackground="#FDE7E5"
            title="Alertas críticas"
            description="Avisar inmediatamente ante riesgos"
            rightContent={
              <Switch
                value={criticalAlertsEnabled}
                onValueChange={setCriticalAlertsEnabled}
                trackColor={{
                  false: "#D7DDD8",
                  true: "#8BCB8E",
                }}
                thumbColor={
                  criticalAlertsEnabled ? "#2F7D32" : "#F4F4F4"
                }
              />
            }
          />
        </View>

        {/* Información */}
        <Text className="mb-2 mt-7 font-poppins-semibold text-base text-agro-text">
          Aplicación
        </Text>

        <View className="rounded-card bg-white px-5 shadow-sm">
          <SettingsRow
            icon="information-circle-outline"
            iconColor="#2878C7"
            iconBackground="#EAF4FF"
            title="Acerca de AgroCoffee AI"
            description="Versión académica 1.0.0"
            onPress={() =>
              Alert.alert(
                "AgroCoffee AI",
                "Prototipo académico para el monitoreo inteligente del secado de café mediante IoT e Inteligencia Artificial."
              )
            }
          />
        </View>

        {/* Cerrar sesión */}
        <Pressable
          className="mt-7 flex-row items-center justify-center rounded-button border border-agro-red bg-white px-5 py-4 active:opacity-60"
          onPress={handleLogout}
          accessibilityRole="button"
        >
          <Ionicons
            name="log-out-outline"
            size={23}
            color="#D32F2F"
          />

          <Text className="ml-2 font-inter-semibold text-base text-agro-red">
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}