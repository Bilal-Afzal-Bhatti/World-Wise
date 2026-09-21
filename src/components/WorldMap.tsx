import React from "react";
import Svg, { G, Path } from "react-native-svg";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { getAllCountries } from "@/data/data";

const AnimatedG = Animated.createAnimatedComponent(G);

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 520;

interface WorldMapProps {
  selectedCCA3: string;
  accentColor: string;
  fillColor: string;
  borderColor: string;
  animatedGroupProps: ReturnType<typeof useAnimatedProps>;
  onSelectCountry: (cca3: string) => void;
}

export default function WorldMap({
  selectedCCA3,
  accentColor,
  fillColor,
  borderColor,
  animatedGroupProps,
  onSelectCountry,
}: WorldMapProps) {
  const countries = getAllCountries();

  return (
    <Svg height="100%" width="100%" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
      <AnimatedG animatedProps={animatedGroupProps}>
        {countries.map((c: any) => {
          if (!c.geoPath) return null;
          const isSelected = c.cca3 === selectedCCA3;
          return (
            <Path
              key={c.cca3}
              d={c.geoPath}
              fill={isSelected ? accentColor : fillColor}
              stroke={borderColor}
              strokeWidth={isSelected ? 1.5 : 0.6}
              onPress={() => onSelectCountry(c.cca3)}
            />
          );
        })}
      </AnimatedG>
    </Svg>
  );
}