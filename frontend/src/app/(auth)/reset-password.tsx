import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import { publicRequest, withJsonHeaders } from "@/services/api";

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; code?: string }>();
  const [email, setEmail] = useState(() => param(params.email));
  const [code, setCode] = useState(() => param(params.code));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPassword = async () => {
    if (!email.trim() || code.length !== 6 || !password || !confirmPassword) {
      Alert.alert("Datos incompletos", "Completa el correo, código y las contraseñas.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Las contraseñas no coinciden", "Verifica ambos campos.");
      return;
    }

    try {
      setIsSubmitting(true);
      await publicRequest<{ message: string }>(
        "/auth/password-reset/confirm",
        withJsonHeaders({
          method: "POST",
          body: JSON.stringify({
            correo: email.trim().toLowerCase(),
            codigo: code,
            new_password: password,
          }),
        }),
      );
      Alert.alert(
        "Contraseña actualizada",
        "Ya puedes iniciar sesión con tu nueva contraseña.",
        [
          {
            text: "Iniciar sesión",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "No fue posible cambiar la contraseña",
        error instanceof Error ? error.message : "Inténtalo nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordField = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    visible: boolean,
    toggle: () => void,
  ) => (
    <>
      <Text className="mt-5 font-poppins-semibold text-sm text-agro-text">
        {label}
      </Text>
      <View className="mt-2 flex-row items-center rounded-button border border-black/10 bg-agro-cream px-4">
        <Ionicons name="lock-closed-outline" size={22} color="#68736B" />
        <TextInput
          className="ml-3 flex-1 py-4 font-inter text-base text-agro-text"
          placeholder="Mayúscula, minúscula y número"
          placeholderTextColor="#8A938C"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
        />
        <Pressable onPress={toggle} hitSlop={12}>
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={23}
            color="#68736B"
          />
        </Pressable>
      </View>
    </>
  );

  return (
    <LinearGradient colors={["#EAF4E7", "#F7F5ED", "#FFFFFF"]} style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 36 }}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              className="mb-6 h-11 w-11 items-center justify-center rounded-full bg-white"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={23} color="#2F7D32" />
            </Pressable>
            <Text className="font-poppins-bold text-3xl text-agro-green-dark">
              Nueva contraseña
            </Text>
            <Text className="mt-2 font-inter text-sm leading-5 text-agro-muted">
              Introduce el código temporal y establece una clave segura.
            </Text>

            <View className="mt-7 rounded-card bg-white p-6 shadow-lg">
              <Text className="font-poppins-semibold text-sm text-agro-text">
                Correo electrónico
              </Text>
              <TextInput
                className="mt-2 rounded-button border border-black/10 bg-agro-cream px-4 py-4 font-inter text-base text-agro-text"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text className="mt-5 font-poppins-semibold text-sm text-agro-text">
                Código de seis dígitos
              </Text>
              <TextInput
                className="mt-2 rounded-button border border-black/10 bg-agro-cream px-4 py-4 text-center font-poppins-bold text-2xl tracking-widest text-agro-coffee"
                placeholder="000000"
                placeholderTextColor="#8A938C"
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, ""))}
                keyboardType="number-pad"
                maxLength={6}
              />

              {passwordField(
                "Nueva contraseña",
                password,
                setPassword,
                showPassword,
                () => setShowPassword((current) => !current),
              )}
              {passwordField(
                "Confirmar nueva contraseña",
                confirmPassword,
                setConfirmPassword,
                showConfirmPassword,
                () => setShowConfirmPassword((current) => !current),
              )}

              <Pressable
                className="mt-7 flex-row items-center justify-center rounded-button bg-agro-green px-6 py-4 disabled:opacity-60"
                onPress={() => void resetPassword()}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : null}
                <Text className="ml-2 font-inter-semibold text-base text-white">
                  {isSubmitting ? "Actualizando..." : "Cambiar contraseña"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
