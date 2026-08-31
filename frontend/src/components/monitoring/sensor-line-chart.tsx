import { Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Text as SvgText,
} from "react-native-svg";

type SensorLineChartProps = {
  title: string;
  currentValue: string;
  color: string;
  fillColor: string;
  data: number[];
  labels: string[];
  minimum: number;
  maximum: number;
};

const SVG_WIDTH = 350;
const SVG_HEIGHT = 180;
const LEFT = 42;
const RIGHT = 326;
const TOP = 22;
const BOTTOM = 138;

export function SensorLineChart({
  title,
  currentValue,
  color,
  fillColor,
  data,
  labels,
  minimum,
  maximum,
}: SensorLineChartProps) {
  const plotWidth = RIGHT - LEFT;
  const plotHeight = BOTTOM - TOP;
  const range = maximum - minimum || 1;

  const getX = (index: number) => {
    if (data.length <= 1) {
      return LEFT;
    }

    return LEFT + (index * plotWidth) / (data.length - 1);
  };

  const getY = (value: number) => {
    return TOP + ((maximum - value) / range) * plotHeight;
  };

  const points = data.map((value, index) => ({
    x: getX(index),
    y: getY(value),
  }));

  const linePath = points
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  const areaPath = `${linePath} L ${RIGHT} ${BOTTOM} L ${LEFT} ${BOTTOM} Z`;

  const gridValues = Array.from({ length: 4 }, (_, index) => {
    return maximum - (index * range) / 3;
  });

  return (
    <View className="mb-5 rounded-card border border-black/5 bg-white p-5 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 font-poppins-semibold text-base text-agro-text">
          {title}
        </Text>

        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: fillColor }}
        >
          <Text
            className="font-inter-semibold text-sm"
            style={{ color }}
          >
            {currentValue}
          </Text>
        </View>
      </View>

      <Svg width="100%" height={190} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
        {gridValues.map((value, index) => {
          const y = TOP + (index * plotHeight) / 3;

          return (
            <Line
              key={`grid-${value}`}
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
          const y = TOP + (index * plotHeight) / 3;

          return (
            <SvgText
              key={`value-${value}`}
              x="21"
              y={y + 4}
              fill="#7A847C"
              fontSize="9"
              fontFamily="Inter_400Regular"
              textAnchor="middle"
            >
              {Number.isInteger(value) ? value : value.toFixed(1)}
            </SvgText>
          );
        })}

        <Path d={areaPath} fill={fillColor} opacity={0.55} />

        <Path
          d={linePath}
          fill="none"
          stroke={color}
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
            stroke={color}
            strokeWidth={index === points.length - 1 ? 3 : 2}
          />
        ))}

        {labels.map((label, index) => (
          <SvgText
            key={`${label}-${index}`}
            x={getX(index)}
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