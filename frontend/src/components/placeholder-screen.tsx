import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type PlaceholderScreenProps = {
  title: string;
  description: string;
  icon: IoniconName;
};

export function PlaceholderScreen({
  title,
  description,
  icon,
}: PlaceholderScreenProps) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F7F5ED",
      }}
    >
      <View className="flex-1 items-center justify-center px-6 pb-24">
        <View className="w-full items-center rounded-card bg-white p-8 shadow-lg">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-agro-green-light">
            <Ionicons name={icon} size={42} color="#2F7D32" />
          </View>

          <Text className="mt-6 text-center font-poppins-bold text-3xl text-agro-green-dark">
            {title}
          </Text>

          <Text className="mt-3 text-center font-inter text-base leading-6 text-agro-muted">
            {description}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}