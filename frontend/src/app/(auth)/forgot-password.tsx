import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
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
import { publicRequest, withJsonHeaders } from "@/services/api";
import { useAppTheme } from "@/context/theme-context";

type PasswordResetStartResponse = {
  message: string;
  expires_in: number;
  demo_code: string | null;
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const [email, setEmail] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert("Correo requerido", "Ingresa el correo de tu cuenta.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await publicRequest<PasswordResetStartResponse>(
        "/auth/password-reset/request",
        withJsonHeaders({
          method: "POST",
          body: JSON.stringify({ correo: normalizedEmail }),
        }),
      );
      setEmail(normalizedEmail);
      setDemoCode(response.demo_code);
      setRequested(true);
    } catch (error) {
      Alert.alert(
        "No fue posible solicitar el código",
        error instanceof Error ? error.message : "Inténtalo nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueReset = () => {
    router.push({
      pathname: "/(auth)/reset-password",
      params: { email, code: demoCode ?? "" },
    });
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
            >
              <Ionicons name="arrow-back" size={23} color="#2F7D32" />
            </Pressable>

            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-agro-green">
              <Ionicons name="key-outline" size={34} color="#FFFFFF" />
            </View>
            <Text className="mt-5 font-poppins-bold text-3xl text-agro-green-dark">
              Recuperar contraseña
            </Text>
            <Text className="mt-2 font-inter text-sm leading-5 text-agro-muted">
              Solicita un código temporal para establecer una contraseña nueva.
            </Text>

            <View className="mt-7 rounded-card bg-agro-surface p-6 shadow-lg">
              {!requested ? (
                <>
                  <Text className="font-poppins-semibold text-sm text-agro-text">
                    Correo electrónico
                  </Text>
                  <View className="mt-2 flex-row items-center rounded-button border border-agro-line bg-agro-cream px-4">
                    <Ionicons name="mail-outline" size={22} color="#68736B" />
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
                    />
                  </View>
                  <Pressable
                    className="mt-6 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 disabled:opacity-60"
                    onPress={() => void requestCode()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : null}
                    <Text className="ml-2 font-inter-semibold text-base text-white">
                      {isSubmitting ? "Generando código..." : "Solicitar código"}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <View className="items-center">
                  <Ionicons name="checkmark-circle" size={52} color="#2F7D32" />
                  <Text className="mt-4 text-center font-poppins-semibold text-lg text-agro-text">
                    Solicitud recibida
                  </Text>
                  <Text className="mt-2 text-center font-inter text-sm leading-5 text-agro-muted">
                    Si el correo está registrado, el código será válido durante 10 minutos.
                  </Text>
                  {demoCode ? (
                    <View className="mt-5 w-full rounded-2xl bg-agro-green-light p-5">
                      <Text className="text-center font-inter-semibold text-xs uppercase tracking-wider text-agro-green-dark">
                        Código de demostración
                      </Text>
                      <Text selectable className="mt-2 text-center font-poppins-bold text-3xl tracking-widest text-agro-coffee">
                        {demoCode}
                      </Text>
                    </View>
                  ) : null}
                  <Pressable
                    className="mt-6 w-full items-center rounded-button bg-agro-green px-6 py-4"
                    onPress={continueReset}
                  >
                    <Text className="font-inter-semibold text-base text-white">
                      Continuar
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
