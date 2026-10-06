import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ThemedStatusBar } from "@/components/ui/themed-status-bar";
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
import { useAppTheme } from "@/context/theme-context";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { isDark } = useAppTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Campos incompletos", "Completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Las contraseñas no coinciden",
        "Verifica la contraseña y su confirmación.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        nombre: name.trim(),
        correo: email.trim().toLowerCase(),
        password,
      });
      router.replace("/subscriptions/plans");
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
      colors={
        isDark
          ? (["#142019", "#0E1511", "#18211B"] as const)
          : (["#EAF4E7", "#F7F5ED", "#FFFFFF"] as const)
      }
      style={{ flex: 1 }}
    >
      <ThemedStatusBar />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 36,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              className="mb-6 h-11 w-11 items-center justify-center rounded-full bg-agro-surface"
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

            <View className="mt-7 rounded-card bg-agro-surface p-6 shadow-lg">
              <Text className="font-poppins-semibold text-sm text-agro-text">
                Nombre completo
              </Text>
              <TextInput
                className="mt-2 rounded-button border border-agro-line bg-agro-cream px-4 py-4 font-inter text-base text-agro-text"
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
                className="mt-2 rounded-button border border-agro-line bg-agro-cream px-4 py-4 font-inter text-base text-agro-text"
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
              <View className="mt-2 flex-row items-center rounded-button border border-agro-line bg-agro-cream px-4">
                <Ionicons name="lock-closed-outline" size={22} color="#68736B" />
                <TextInput
                  className="ml-3 flex-1 py-4 font-inter text-base text-agro-text"
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#8A938C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={23}
                    color="#68736B"
                  />
                </Pressable>
              </View>

              <Text className="mt-5 font-poppins-semibold text-sm text-agro-text">
                Confirmar contraseña
              </Text>
              <View className="mt-2 flex-row items-center rounded-button border border-agro-line bg-agro-cream px-4">
                <Ionicons name="shield-checkmark-outline" size={22} color="#68736B" />
                <TextInput
                  className="ml-3 flex-1 py-4 font-inter text-base text-agro-text"
                  placeholder="Escribe nuevamente la contraseña"
                  placeholderTextColor="#8A938C"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                />
                <Pressable
                  onPress={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={23}
                    color="#68736B"
                  />
                </Pressable>
              </View>

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
