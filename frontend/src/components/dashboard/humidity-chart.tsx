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

type HumidityChartProps = {
  values: number[];
  labels: string[];
  currentValue: string;
};

const LEFT = 44;
const RIGHT = 316;
const TOP = 26;
const BOTTOM = 138;

export function HumidityChart({
  values,
  labels,
  currentValue,
}: HumidityChartProps) {
  const data = values.length > 0 ? values : [0];
  const minimum = Math.max(0, Math.floor(Math.min(...data) - 2));
  const maximum = Math.max(minimum + 5, Math.ceil(Math.max(...data) + 2));
  const range = maximum - minimum;

  const points = data.map((value, index) => ({
    x:
      data.length === 1
        ? LEFT
        : LEFT + (index * (RIGHT - LEFT)) / (data.length - 1),
    y: TOP + ((maximum - value) / range) * (BOTTOM - TOP),
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const lastPoint = points[points.length - 1];
  const areaPath = `${linePath} L ${lastPoint?.x ?? RIGHT} ${BOTTOM} L ${LEFT} ${BOTTOM} Z`;
  const gridValues = Array.from(
    { length: 5 },
    (_, index) => maximum - (index * range) / 4
  );

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
            {currentValue}
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

        {gridValues.map((value, index) => {
          const y = TOP + (index * (BOTTOM - TOP)) / 4;
          return (
            <Line
              key={`grid-${index}`}
              x1={LEFT}
              y1={y}
              x2={RIGHT}
              y2={y}
              stroke="#DFE5DF"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {gridValues.map((value, index) => {
          const y = TOP + (index * (BOTTOM - TOP)) / 4;
          return (
            <SvgText
              key={`label-${index}`}
              x="20"
              y={y + 4}
              fill="#7A847C"
              fontSize="10"
              fontFamily="Inter_400Regular"
              textAnchor="middle"
            >
              {value.toFixed(0)}
            </SvgText>
          );
        })}

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

        {labels.map((label, index) => (
          <SvgText
            key={`${label}-${index}`}
            x={points[index]?.x ?? LEFT}
            y="162"
            fill="#68736B"
            fontSize="9"
            fontFamily="Inter_400Regular"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
