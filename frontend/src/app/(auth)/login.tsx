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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      Alert.alert(
        "Campos incompletos",
        "Ingresa tu correo electrónico y contraseña."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await login(normalizedEmail, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "No fue posible iniciar sesión",
        error instanceof Error
          ? error.message
          : "Verifica tus credenciales y la conexión con el backend."
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
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 40,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Encabezado */}
            <View className="mb-8 items-center">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-agro-green">
                <Ionicons
                  name="leaf-outline"
                  size={44}
                  color="#FFFFFF"
                />
              </View>

              <Text className="mt-5 text-center font-poppins-bold text-3xl text-agro-green-dark">
                Bienvenido
              </Text>

              <Text className="mt-2 px-4 text-center font-inter text-base leading-6 text-agro-muted">
                Ingresa para supervisar tus procesos de secado
              </Text>
            </View>

            {/* Formulario */}
            <View className="rounded-card bg-white p-6 shadow-lg">
              <Text className="font-poppins-semibold text-sm text-agro-text">
                Correo electrónico
              </Text>

              <View className="mt-2 flex-row items-center rounded-button border border-black/10 bg-agro-cream px-4">
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color="#68736B"
                />

                <TextInput
                  className="ml-3 flex-1 py-4 font-inter text-base text-agro-text"
                  placeholder="productor@agrocoffee.com"
                  placeholderTextColor="#8A938C"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>

              <Text className="mt-5 font-poppins-semibold text-sm text-agro-text">
                Contraseña
              </Text>

              <View className="mt-2 flex-row items-center rounded-button border border-black/10 bg-agro-cream px-4">
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#68736B"
                />

                <TextInput
                  className="ml-3 flex-1 py-4 font-inter text-base text-agro-text"
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#8A938C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleLogin()}
                />

                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={23}
                    color="#68736B"
                  />
                </Pressable>
              </View>

              <Pressable
                className="mt-4 self-end"
                accessibilityRole="button"
                onPress={() => {
                  Alert.alert(
                    "Próximamente",
                    "La recuperación de contraseña se implementará con el backend."
                  );
                }}
              >
                <Text className="font-inter-medium text-sm text-agro-green">
                  ¿Olvidaste tu contraseña?
                </Text>
              </Pressable>

              <Pressable
                className="mt-7 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 active:bg-agro-green-dark"
                onPress={() => void handleLogin()}
                disabled={isSubmitting}
                accessibilityRole="button"
              >
                <Text className="font-inter-semibold text-base text-white">
                  {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={21}
                  color="#FFFFFF"
                  style={{ marginLeft: 10 }}
                />
              </Pressable>

              <Pressable
                className="mt-5 items-center"
                onPress={() => router.push("/(auth)/register")}
                disabled={isSubmitting}
                accessibilityRole="button"
              >
                <Text className="font-inter-medium text-sm text-agro-muted">
                  ¿No tienes cuenta?{" "}
                  <Text className="text-agro-green">Regístrate</Text>
                </Text>
              </Pressable>
            </View>

            {/* Pie */}
            <Text className="mt-8 text-center font-inter text-xs leading-5 text-agro-muted">
              AgroCoffee AI · Monitoreo inteligente del secado
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
