import { StatusBar } from "expo-status-bar";

import { useAppTheme } from "@/context/theme-context";

export function ThemedStatusBar() {
  const { isDark } = useAppTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}
