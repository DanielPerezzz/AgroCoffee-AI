import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

type AnimatedProgressBarProps = {
  value: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
};

export function AnimatedProgressBar({
  value,
  color = "#2F7D32",
  backgroundColor = "rgba(0, 0, 0, 0.06)",
  height = 8,
}: AnimatedProgressBarProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const normalizedValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: normalizedValue,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [normalizedValue, progress]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: normalizedValue }}
      className="overflow-hidden rounded-full"
      style={{ height, backgroundColor }}
    >
      <Animated.View
        className="h-full rounded-full"
        style={{
          backgroundColor: color,
          width: progress.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
          }),
        }}
      />
    </View>
  );
}
