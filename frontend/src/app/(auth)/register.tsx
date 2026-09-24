import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
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

import { useAuth } from "@/context/auth-context";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Campos incompletos", "Completa todos los campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        nombre: name.trim(),
        correo: email.trim().toLowerCase(),
        password,
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "No fue posible crear la cuenta",
        error instanceof Error ? error.message : "Inténtalo nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#EAF4E7", "#F7F5ED", "#FFFFFF"]}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 36,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              className="mb-6 h-11 w-11 items-center justify-center rounded-full bg-white"
              onPress={() => router.back()}
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={23} color="#2F7D32" />
            </Pressable>

            <Text className="font-poppins-bold text-3xl text-agro-green-dark">
              Crear cuenta
            </Text>
            <Text className="mt-2 font-inter text-sm text-agro-muted">
              Registra al productor que utilizará AgroCoffee AI.
            </Text>

            <View className="mt-7 rounded-card bg-white p-6 shadow-lg">
              <Text className="font-poppins-semibold text-sm text-agro-text">
                Nombre completo
              </Text>
              <TextInput
                className="mt-2 rounded-button border border-black/10 bg-agro-cream px-4 py-4 font-inter text-base text-agro-text"
                placeholder="Daniel Pérez"
                placeholderTextColor="#8A938C"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <Text className="mt-5 font-poppins-semibold text-sm text-agro-text">
                Correo electrónico
              </Text>
              <TextInput
                className="mt-2 rounded-button border border-black/10 bg-agro-cream px-4 py-4 font-inter text-base text-agro-text"
                placeholder="productor@agrocoffee.com"
                placeholderTextColor="#8A938C"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text className="mt-5 font-poppins-semibold text-sm text-agro-text">
                Contraseña
              </Text>
              <TextInput
                className="mt-2 rounded-button border border-black/10 bg-agro-cream px-4 py-4 font-inter text-base text-agro-text"
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#8A938C"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text className="mt-2 font-inter text-xs leading-4 text-agro-muted">
                Debe incluir mayúscula, minúscula y número.
              </Text>

              <Pressable
                className="mt-7 items-center rounded-button bg-agro-green px-6 py-4 disabled:opacity-60"
                onPress={() => void handleRegister()}
                disabled={isSubmitting}
                accessibilityRole="button"
              >
                <Text className="font-inter-semibold text-base text-white">
                  {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
