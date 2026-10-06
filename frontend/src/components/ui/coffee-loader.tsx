import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

type CoffeeLoaderProps = {
  label?: string;
};

export function CoffeeLoader({
  label = "Preparando AgroCoffee AI...",
}: CoffeeLoaderProps) {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animation]);

  return (
    <View className="items-center justify-center px-6">
      <Animated.View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        className="h-14 w-10 items-center justify-center rounded-full bg-agro-coffee"
        style={{
          opacity: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.55, 1],
          }),
          transform: [
            { rotate: "-24deg" },
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.88, 1.08],
              }),
            },
          ],
        }}
      >
        <View className="h-9 w-1 rounded-full bg-agro-cream/80" />
      </Animated.View>
      <Text className="mt-4 text-center font-inter-medium text-sm text-agro-muted">
        {label}
      </Text>
    </View>
  );
}
