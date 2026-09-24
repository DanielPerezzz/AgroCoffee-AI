import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { AuthTokens } from "@/types/api";

const SESSION_KEY = "agrocoffee.auth.tokens";

function getWebStorage() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  return localStorage;
}

export async function saveSession(tokens: AuthTokens): Promise<void> {
  const value = JSON.stringify(tokens);

  if (Platform.OS === "web") {
    getWebStorage()?.setItem(SESSION_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function loadSession(): Promise<AuthTokens | null> {
  const value =
    Platform.OS === "web"
      ? getWebStorage()?.getItem(SESSION_KEY) ?? null
      : await SecureStore.getItemAsync(SESSION_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthTokens;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}
