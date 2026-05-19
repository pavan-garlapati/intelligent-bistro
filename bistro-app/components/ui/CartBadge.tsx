import { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

export interface CartBadgeProps {
  count: number;
}

export function CartBadge({ count }: CartBadgeProps) {
  const scale = useSharedValue(1);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      scale.value = withSequence(
        withSpring(1.35, { damping: 6, stiffness: 220 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
    prevCount.current = count;
  }, [count, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary items-center justify-center"
    >
      <Text className="text-white text-[11px] font-bold">{count}</Text>
    </Animated.View>
  );
}
