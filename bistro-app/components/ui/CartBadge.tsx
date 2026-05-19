import { useEffect, useRef } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export interface CartBadgeProps {
  count: number;
}

export function CartBadge({ count }: CartBadgeProps) {
  const scale = useSharedValue(1);
  const flash = useSharedValue(0);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      scale.value = withSequence(
        withSpring(1.4, { damping: 6, stiffness: 220 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
      flash.value = withSequence(
        withTiming(1, { duration: 130 }),
        withTiming(0, { duration: 170 }),
      );
    }
    prevCount.current = count;
  }, [count, scale, flash]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      flash.value,
      [0, 1],
      ['#b85c28', '#ffffff'],
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      flash.value,
      [0, 1],
      ['#ffffff', '#b85c28'],
    ),
  }));

  return (
    <Animated.View
      style={containerStyle}
      className="min-w-[20px] h-5 px-1.5 rounded-full items-center justify-center"
    >
      <Animated.Text
        style={textStyle}
        className="text-[11px] font-bold"
      >
        {count}
      </Animated.Text>
    </Animated.View>
  );
}
