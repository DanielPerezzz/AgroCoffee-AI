import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type MetricCardProps = {
  title: string;
  value: string;
  icon: IoniconName;
  iconColor: string;
  iconBackground: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  description?: string;
  wide?: boolean;
};

export function MetricCard({
  title,
  value,
  icon,
  iconColor,
  iconBackground,
  trend,
  trendDirection = "neutral",
  description,
  wide = false,
}: MetricCardProps) {
  const trendColor = {
    up: "#D9534F",
    down: "#2F8F46",
    neutral: "#68736B",
  }[trendDirection];

  const trendIcon: IoniconName = {
    up: "arrow-up",
    down: "arrow-down",
    neutral: "remove",
  }[trendDirection] as IoniconName;

  return (
    <View
      className="mb-4 min-h-36 rounded-card border border-black/5 bg-white p-4 shadow-sm"
      style={{ width: wide ? "100%" : "48%" }}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: iconBackground }}
      >
        <Ionicons name={icon} size={25} color={iconColor} />
      </View>

      <Text
        className="mt-3 font-inter-medium text-xs leading-4 text-agro-muted"
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text className="mt-1 font-poppins-bold text-2xl text-agro-text">
        {value}
      </Text>

      {trend ? (
        <View className="mt-2 flex-row items-center">
          <Ionicons name={trendIcon} size={14} color={trendColor} />

          <Text
            className="ml-1 font-inter-semibold text-xs"
            style={{ color: trendColor }}
          >
            {trend}
          </Text>
        </View>
      ) : null}

      {description ? (
        <Text className="mt-2 font-inter text-xs text-agro-muted">
          {description}
        </Text>
      ) : null}
    </View>
  );
}