import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

type LiveDataIndicatorProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function LiveDataIndicator({
  active,
  activeLabel = "Recibiendo mediciones",
  inactiveLabel = "Esperando datos",
}: LiveDataIndicatorProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  return (
    <View className="flex-row items-center">
      <View className="h-3 w-3 items-center justify-center">
        {active ? (
          <Animated.View
            className="absolute h-3 w-3 rounded-full bg-agro-green"
            style={{
              opacity: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.45, 0],
              }),
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2.2],
                  }),
                },
              ],
            }}
          />
        ) : null}
        <View
          className={`h-2 w-2 rounded-full ${
            active ? "bg-agro-green" : "bg-agro-muted"
          }`}
        />
      </View>
      <Text
        className={`ml-2 font-inter-medium text-xs ${
          active ? "text-agro-green" : "text-agro-muted"
        }`}
      >
        {active ? activeLabel : inactiveLabel}
      </Text>
    </View>
  );
}
