import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#F5B700",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 14,
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: "#101512",
          borderTopWidth: 0,
          borderRadius: 28,
          elevation: 12,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="monitoring"
        options={{
          title: "Monitoreo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="ai"
        options={{
          title: "IA",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="hardware-chip-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="notifications-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}