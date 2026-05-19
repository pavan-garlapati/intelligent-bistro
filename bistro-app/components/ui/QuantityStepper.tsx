import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

export interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
}

export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  min = 0,
}: QuantityStepperProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 180 }),
      withSpring(1, { damping: 10, stiffness: 180 }),
    );
  }, [quantity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const showTrash = quantity === 1;
  const decreaseDisabled = quantity <= min;

  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={onDecrease}
        disabled={decreaseDisabled}
        hitSlop={8}
        className={`h-9 w-9 rounded-full border border-brand-border items-center justify-center ${
          decreaseDisabled ? 'opacity-40' : ''
        }`}
      >
        <Ionicons
          name={showTrash ? 'trash-outline' : 'remove'}
          size={18}
          color="#1a1008"
        />
      </Pressable>

      <Animated.View style={animatedStyle} className="mx-3 min-w-[28px] items-center">
        <Text className="text-[16px] font-semibold text-brand-dark">
          {quantity}
        </Text>
      </Animated.View>

      <Pressable
        onPress={onIncrease}
        hitSlop={8}
        className="h-9 w-9 rounded-full bg-brand-primary items-center justify-center"
      >
        <Ionicons name="add" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}
