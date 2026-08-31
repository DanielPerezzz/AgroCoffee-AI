import { Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const points = [
  { x: 44, y: 27 },
  { x: 78, y: 39 },
  { x: 112, y: 54 },
  { x: 146, y: 70 },
  { x: 180, y: 88 },
  { x: 214, y: 98 },
  { x: 248, y: 104 },
  { x: 282, y: 108 },
  { x: 316, y: 113 },
];

const linePath = points
  .map((point, index) => {
    return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  })
  .join(" ");

const areaPath = `${linePath} L 316 140 L 44 140 Z`;

const horizontalLines = [
  { y: 26, value: "25" },
  { y: 54, value: "22" },
  { y: 82, value: "19" },
  { y: 110, value: "16" },
  { y: 138, value: "13" },
];

const timeLabels = [
  { x: 44, value: "0h" },
  { x: 134, value: "24h" },
  { x: 226, value: "48h" },
  { x: 316, value: "72h" },
];

export function HumidityChart() {
  return (
    <View className="rounded-card border border-black/5 bg-white p-5 shadow-sm">
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="font-poppins-semibold text-base text-agro-text">
            Evolución de humedad
          </Text>

          <Text className="mt-1 font-inter text-xs text-agro-muted">
            Humedad estimada del café
          </Text>
        </View>

        <View className="rounded-full bg-agro-green-light px-3 py-1.5">
          <Text className="font-inter-semibold text-sm text-agro-green-dark">
            19 %
          </Text>
        </View>
      </View>

      <Svg width="100%" height={190} viewBox="0 0 350 175">
        <Defs>
          <LinearGradient id="humidityArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2F7D32" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#2F7D32" stopOpacity={0.01} />
          </LinearGradient>
        </Defs>

        {horizontalLines.map((line) => (
          <Line
            key={line.value}
            x1="44"
            y1={line.y}
            x2="316"
            y2={line.y}
            stroke="#DFE5DF"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {horizontalLines.map((line) => (
          <SvgText
            key={`label-${line.value}`}
            x="20"
            y={line.y + 4}
            fill="#7A847C"
            fontSize="10"
            fontFamily="Inter_400Regular"
            textAnchor="middle"
          >
            {line.value}
          </SvgText>
        ))}

        <Path d={areaPath} fill="url(#humidityArea)" />

        <Path
          d={linePath}
          fill="none"
          stroke="#2F7D32"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <Circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 5 : 3.5}
            fill="#FFFFFF"
            stroke="#2F7D32"
            strokeWidth={index === points.length - 1 ? 3 : 2}
          />
        ))}

        {timeLabels.map((label) => (
          <SvgText
            key={label.value}
            x={label.x}
            y="162"
            fill="#68736B"
            fontSize="10"
            fontFamily="Inter_400Regular"
            textAnchor="middle"
          >
            {label.value}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}