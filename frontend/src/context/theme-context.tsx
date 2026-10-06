import * as SecureStore from "expo-secure-store";
import { colorScheme, vars } from "nativewind";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform, View } from "react-native";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
};

const STORAGE_KEY = "agrocoffee_theme_mode";

const lightVariables = {
  "--agro-green": "47 125 50",
  "--agro-green-dark": "31 90 36",
  "--agro-green-light": "234 244 231",
  "--agro-coffee": "107 53 24",
  "--agro-orange": "242 140 0",
  "--agro-yellow": "245 183 0",
  "--agro-blue": "40 120 199",
  "--agro-red": "211 47 47",
  "--agro-cream": "247 245 237",
  "--agro-surface": "255 255 255",
  "--agro-text": "24 32 26",
  "--agro-muted": "104 115 107",
  "--agro-line": "224 228 224",
  "--agro-soft": "241 243 241",
} as const;

const darkVariables = {
  "--agro-green": "72 161 78",
  "--agro-green-dark": "126 207 132",
  "--agro-green-light": "29 55 34",
  "--agro-coffee": "218 161 116",
  "--agro-orange": "255 171 62",
  "--agro-yellow": "255 199 45",
  "--agro-blue": "103 170 236",
  "--agro-red": "255 112 103",
  "--agro-cream": "14 21 17",
  "--agro-surface": "24 33 27",
  "--agro-text": "241 246 242",
  "--agro-muted": "169 181 171",
  "--agro-line": "55 70 59",
  "--agro-soft": "32 43 35",
} as const;

const ThemeContext = createContext<ThemeContextValue | null>(null);

async function readStoredMode(): Promise<ThemeMode | null> {
  try {
    const stored =
      Platform.OS === "web"
        ? globalThis.localStorage?.getItem(STORAGE_KEY)
        : await SecureStore.getItemAsync(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

async function persistMode(mode: ThemeMode): Promise<void> {
  try {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(STORAGE_KEY, mode);
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {
    // El cambio visual se conserva durante la sesión aunque falle el almacenamiento.
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    void readStoredMode().then((storedMode) => {
      const initialMode = storedMode ?? "light";
      setModeState(initialMode);
      colorScheme.set(initialMode);
    });
  }, []);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    colorScheme.set(nextMode);
    await persistMode(nextMode);
  }, []);

  const toggleMode = useCallback(
    () => setMode(mode === "dark" ? "light" : "dark"),
    [mode, setMode],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark: mode === "dark", setMode, toggleMode }),
    [mode, setMode, toggleMode],
  );

  const variables = vars(mode === "dark" ? darkVariables : lightVariables);

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, variables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme debe utilizarse dentro de ThemeProvider.");
  }
  return context;
}
