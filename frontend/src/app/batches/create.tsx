import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProcessData } from "@/context/process-data-context";
import { normalizeBatchCode } from "@/utils/format";

function Field({ label, value, onChangeText, placeholder, icon, keyboardType = "default" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; icon: React.ComponentProps<typeof Ionicons>["name"]; keyboardType?: "default" | "decimal-pad" }) {
  return <View className="mb-5"><Text className="font-poppins-semibold text-sm text-agro-text">{label}</Text><View className="mt-2 flex-row items-center rounded-button border border-black/10 bg-agro-cream px-4"><Ionicons name={icon} size={22} color="#68736B" /><TextInput className="ml-3 flex-1 py-4 font-inter text-base text-agro-text" value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8A938C" keyboardType={keyboardType} /></View></View>;
}

export default function CreateBatchScreen() {
  const router = useRouter();
  const { createBatch } = useProcessData();
  const [code, setCode] = useState(""); const [weight, setWeight] = useState(""); const [humidity, setHumidity] = useState(""); const [saving, setSaving] = useState(false);
  const save = async () => {
    const normalized = normalizeBatchCode(code); const kg = Number(weight.replace(",", ".")); const initial = Number(humidity.replace(",", "."));
    if (normalized.length < 3 || !Number.isFinite(kg) || kg <= 0 || !Number.isFinite(initial) || initial < 0 || initial > 100) { Alert.alert("Datos incompletos", "Ingresa un código de al menos 3 caracteres, un peso mayor que cero y una humedad entre 0 y 100."); return; }
    try { setSaving(true); const batch = await createBatch({ codigo_lote: normalized, cantidad_kg: kg, humedad_inicial: initial }); Alert.alert("Lote creado", `${batch.codigo_lote} se guardó correctamente.`, [{ text: "Iniciar secado", onPress: () => router.replace({ pathname: "/processes/start", params: { batchId: batch.id_lote } }) }]); } catch (error) { Alert.alert("No fue posible guardar", error instanceof Error ? error.message : "Intenta nuevamente."); } finally { setSaving(false); }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F5ED" }}><StatusBar style="dark" /><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View className="flex-row items-center"><Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color="#2F7D32" /></Pressable><View className="ml-4"><Text className="font-poppins-bold text-2xl text-agro-green-dark">Nuevo lote</Text><Text className="font-inter text-xs text-agro-muted">Datos que serán guardados en PostgreSQL</Text></View></View>
      <View className="mt-7 rounded-card bg-white p-5 shadow-sm"><Field label="Código del lote *" value={code} onChangeText={setCode} placeholder="Ejemplo: CAFE_2026_01" icon="barcode-outline" /><Field label="Peso en kilogramos *" value={weight} onChangeText={setWeight} placeholder="Ejemplo: 50" icon="scale-outline" keyboardType="decimal-pad" /><Field label="Humedad inicial (%) *" value={humidity} onChangeText={setHumidity} placeholder="Ejemplo: 45" icon="water-outline" keyboardType="decimal-pad" /><Text className="font-inter text-xs leading-5 text-agro-muted">El código se normaliza a mayúsculas y puede contener letras, números, guiones y guion bajo.</Text><Pressable className="mt-6 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 disabled:opacity-60" onPress={() => void save()} disabled={saving}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="save-outline" size={22} color="#FFFFFF" />}<Text className="ml-2 font-inter-semibold text-base text-white">{saving ? "Guardando..." : "Guardar lote"}</Text></Pressable></View>
    </ScrollView></KeyboardAvoidingView></SafeAreaView>
  );
}
