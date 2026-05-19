import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export interface ToastProps {
  visible: boolean;
  message: string;
}

export function Toast({ visible, message }: ToastProps) {
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 180 });
    } else {
      translateY.value = withTiming(60, { duration: 220 });
      opacity.value = withTiming(0, { duration: 220 });
    }
  }, [visible, translateY, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={style}
      className="absolute bottom-24 left-6 right-6 bg-brand-dark rounded-full px-5 py-3 items-center"
    >
      <Text className="text-brand-cream text-[14px] font-semibold">
        {message}
      </Text>
    </Animated.View>
  );
}
