import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export interface ToastProps {
  visible: boolean;
  message: string;
  emoji?: string;
  onHide: () => void;
}

const VISIBLE_MS = 1800;

export function Toast({ visible, message, emoji, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 180 });
      const timer = setTimeout(() => {
        translateY.value = withTiming(-120, { duration: 240 });
        opacity.value = withTiming(0, { duration: 240 }, (finished) => {
          if (finished) runOnJS(onHide)();
        });
      }, VISIBLE_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, translateY, opacity, onHide]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          position: 'absolute',
          top: insets.top + 8,
          left: 0,
          right: 0,
          alignItems: 'center',
        },
      ]}
    >
      <View className="bg-brand-dark rounded-full px-4 py-2.5 flex-row items-center max-w-[90%]">
        {emoji ? (
          <Text className="text-[16px] mr-2">{emoji}</Text>
        ) : null}
        <Text
          numberOfLines={1}
          className="text-white text-[14px] font-semibold"
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
