import { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";

const brandLogo = require("../../../assets/brand/agrocoffee-logo.png");
const LOGO_WIDTH = 72;
const LOGO_HEIGHT = 90;

type CoffeeLoaderProps = {
  label?: string;
};

export function CoffeeLoader({
  label = "Preparando AgroCoffee AI...",
}: CoffeeLoaderProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1150,
          useNativeDriver: false,
        }),
        Animated.delay(180),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const fillHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LOGO_HEIGHT],
  });

  return (
    <View
      className="items-center justify-center px-6"
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <View
        style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
        className="relative"
      >
        <Image
          source={brandLogo}
          resizeMode="contain"
          style={{
            width: LOGO_WIDTH,
            height: LOGO_HEIGHT,
            tintColor: "#D9C8BC",
          }}
        />

        <Animated.View
          className="absolute bottom-0 left-0 overflow-hidden"
          style={{ width: LOGO_WIDTH, height: fillHeight }}
        >
          <Image
            source={brandLogo}
            resizeMode="contain"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: LOGO_WIDTH,
              height: LOGO_HEIGHT,
              tintColor: "#6B3518",
            }}
          />
        </Animated.View>
      </View>

      <Text className="mt-4 text-center font-inter-medium text-sm text-agro-muted">
        {label}
      </Text>
    </View>
  );
}
