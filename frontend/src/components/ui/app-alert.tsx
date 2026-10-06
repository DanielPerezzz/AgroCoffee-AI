import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps, PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/context/theme-context";

type AlertButtonStyle = "default" | "cancel" | "destructive";

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
};

type AlertRequest = {
  title: string;
  message?: string;
  buttons: AlertButton[];
};

type AlertVariant = {
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  lightBackground: string;
  darkBackground: string;
};

let presentAlert: ((request: AlertRequest) => void) | null = null;

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    presentAlert?.({
      title,
      message,
      buttons: buttons?.length ? buttons : [{ text: "Aceptar" }],
    });
  },
};

function resolveVariant(request: AlertRequest): AlertVariant {
  const searchable = `${request.title} ${request.message ?? ""}`.toLowerCase();
  const hasDestructiveAction = request.buttons.some(
    (button) => button.style === "destructive",
  );

  if (
    /cread|actualizad|vinculad|iniciad|enviad|guardad|completad|correctamente/.test(
      searchable,
    )
  ) {
    return {
      icon: "checkmark-circle-outline",
      color: "#2F8F46",
      lightBackground: "#E8F5EA",
      darkBackground: "#1D3823",
    };
  }

  if (
    /no fue|error|inválid|incomplet|no coinciden|requerid|falló/.test(searchable)
  ) {
    return {
      icon: "alert-circle-outline",
      color: "#D9534F",
      lightBackground: "#FDECEB",
      darkBackground: "#3B201E",
    };
  }

  if (hasDestructiveAction || /finalizar|cerrar sesión|cancelar/.test(searchable)) {
    return {
      icon: "warning-outline",
      color: "#E99A00",
      lightBackground: "#FFF4D6",
      darkBackground: "#3A2D12",
    };
  }

  return {
    icon: "information-circle-outline",
    color: "#2878C7",
    lightBackground: "#EAF4FF",
    darkBackground: "#172E43",
  };
}

export function AppAlertProvider({ children }: PropsWithChildren) {
  const { isDark } = useAppTheme();
  const [request, setRequest] = useState<AlertRequest | null>(null);

  useEffect(() => {
    presentAlert = setRequest;
    return () => {
      presentAlert = null;
    };
  }, []);

  const close = useCallback(() => setRequest(null), []);

  const pressButton = useCallback((button: AlertButton) => {
    setRequest(null);
    requestAnimationFrame(() => button.onPress?.());
  }, []);

  const variant = useMemo(
    () => (request ? resolveVariant(request) : null),
    [request],
  );

  return (
    <>
      {children}
      <Modal
        transparent
        visible={Boolean(request)}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <Pressable
            className="absolute inset-0"
            onPress={close}
            accessibilityLabel="Cerrar mensaje"
          />

          {request && variant ? (
            <View className="w-full max-w-sm rounded-[28px] border border-agro-line bg-agro-surface p-6 shadow-lg">
              <View
                className="h-16 w-16 items-center justify-center self-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? variant.darkBackground
                    : variant.lightBackground,
                }}
              >
                <Ionicons name={variant.icon} size={34} color={variant.color} />
              </View>

              <Text className="mt-5 text-center font-poppins-bold text-xl text-agro-text">
                {request.title}
              </Text>
              {request.message ? (
                <Text className="mt-3 text-center font-inter text-sm leading-6 text-agro-muted">
                  {request.message}
                </Text>
              ) : null}

              <View
                className={`${request.buttons.length > 1 ? "flex-row" : ""} mt-6`}
              >
                {request.buttons.map((button, index) => {
                  const cancel = button.style === "cancel";
                  const destructive = button.style === "destructive";

                  return (
                    <Pressable
                      key={`${button.text ?? "Aceptar"}-${index}`}
                      className={`${
                        request.buttons.length > 1
                          ? `${index > 0 ? "ml-3" : ""} flex-1`
                          : "w-full"
                      } items-center justify-center rounded-button border px-4 py-3.5 active:opacity-70 ${
                        cancel
                          ? "border-agro-line bg-agro-soft"
                          : destructive
                            ? "border-agro-red bg-agro-red"
                            : "border-agro-green bg-agro-green"
                      }`}
                      onPress={() => pressButton(button)}
                      accessibilityRole="button"
                    >
                      <Text
                        className={`text-center font-inter-semibold text-sm ${
                          cancel ? "text-agro-text" : "text-white"
                        }`}
                      >
                        {button.text ?? "Aceptar"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}
