import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth-context";
import { useProcessData } from "@/context/process-data-context";
import { API_BASE_URL } from "@/services/api";

function Row({ icon, title, description, onPress, danger = false }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; description: string; onPress?: () => void; danger?: boolean }) {
  const content = <View className="flex-row items-center py-4"><View className={`h-11 w-11 items-center justify-center rounded-2xl ${danger ? "bg-red-50" : "bg-agro-green-light"}`}><Ionicons name={icon} size={23} color={danger ? "#D13A32" : "#2F7D32"} /></View><View className="ml-3 flex-1"><Text className="font-inter-semibold text-sm" style={{ color: danger ? "#D13A32" : "#18201A" }}>{title}</Text><Text className="mt-1 font-inter text-xs leading-4 text-agro-muted">{description}</Text></View>{onPress ? <Ionicons name="chevron-forward" size={21} color="#8A938C" /> : null}</View>;
  return onPress ? <Pressable onPress={onPress} className="active:opacity-60">{content}</Pressable> : content;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeProcess, batches, devices } = useProcessData();
  const confirmLogout = () => Alert.alert("Cerrar sesión", "¿Deseas cerrar la sesión actual?", [{ text: "Cancelar", style: "cancel" }, { text: "Cerrar sesión", style: "destructive", onPress: () => void logout() }]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}><StatusBar style="dark" /><ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <Text className="font-poppins-bold text-3xl text-agro-green-dark">Ajustes</Text><Text className="mt-1 font-inter text-sm text-agro-muted">Cuenta y recursos conectados.</Text>
      <View className="mt-6 flex-row items-center rounded-card bg-agro-green p-5"><View className="h-16 w-16 items-center justify-center rounded-full bg-white/15"><Ionicons name="person-outline" size={33} color="#FFFFFF" /></View><View className="ml-4 flex-1"><Text className="font-poppins-semibold text-lg text-white">{user?.nombre ?? "Usuario"}</Text><Text className="mt-1 font-inter text-xs text-white/80">{user?.correo}</Text><Text className="mt-1 font-inter-semibold text-xs text-agro-yellow">{user?.rol}</Text></View></View>
      <Text className="mb-1 mt-7 font-poppins-semibold text-base text-agro-text">Proyecto</Text>
      <View className="rounded-card bg-white px-4 shadow-sm"><Row icon="leaf-outline" title={`${batches.length} lotes registrados`} description={activeProcess ? `Proceso activo #${activeProcess.id_proceso}` : "No hay proceso de secado activo"} /><View className="h-px bg-black/5" /><Row icon="hardware-chip-outline" title={`${devices.length} dispositivos`} description={devices[0] ? `${devices[0].nombre} · ${devices[0].estado}` : "Ningún ESP32 asociado"} /><View className="h-px bg-black/5" /><Row icon="server-outline" title="API conectada" description={API_BASE_URL} /></View>
      <Pressable className="mt-6 flex-row items-center justify-center rounded-button border border-agro-green bg-white px-5 py-4" onPress={() => router.push("/batches/create")}><Ionicons name="add-circle-outline" size={23} color="#2F7D32" /><Text className="ml-2 font-inter-semibold text-sm text-agro-green-dark">Crear nuevo lote</Text></Pressable>
      <Pressable className="mt-3 flex-row items-center justify-center rounded-button bg-agro-green px-5 py-4" onPress={() => router.push("/processes/start")}><Ionicons name="play-outline" size={23} color="#FFFFFF" /><Text className="ml-2 font-inter-semibold text-sm text-white">Iniciar proceso de secado</Text></Pressable>
      <View className="mt-6 rounded-card bg-white px-4 shadow-sm"><Row icon="log-out-outline" title="Cerrar sesión" description="Elimina los tokens almacenados en este dispositivo" onPress={confirmLogout} danger /></View>
      <Text className="mt-6 text-center font-inter text-xs text-agro-muted">AgroCoffee AI · prototipo académico</Text>
    </ScrollView></SafeAreaView>
  );
}
