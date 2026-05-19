import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { MenuItem } from '../../types';
import { Tag, tagVariantFor } from '../ui/Tag';
import { categoryBg } from './categoryColors';

export interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem, quantity: number) => void;
  onPress: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAdd, onPress }: MenuItemCardProps) {
  const cardScale = useSharedValue(1);
  const plusRotation = useSharedValue(0);
  const floatY = useSharedValue(0);
  const floatOpacity = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${plusRotation.value}deg` }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    opacity: floatOpacity.value,
    transform: [{ translateY: floatY.value }],
  }));

  const handlePlusPress = () => {
    plusRotation.value = withSequence(
      withTiming(90, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );

    floatY.value = 0;
    floatOpacity.value = 1;
    floatY.value = withTiming(-60, { duration: 280 });
    floatOpacity.value = withTiming(0, { duration: 280 });

    onAdd(item, 1);
  };

  return (
    <Pressable
      onPress={() => onPress(item)}
      onPressIn={() => {
        cardScale.value = withSpring(0.97, { stiffness: 300, damping: 18 });
      }}
      onPressOut={() => {
        cardScale.value = withSpring(1, { stiffness: 220, damping: 16 });
      }}
    >
      <Animated.View
        style={[
          cardStyle,
          {
            shadowColor: '#1a1008',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          },
        ]}
        className="bg-brand-card border border-brand-border rounded-2xl p-3 flex-row"
      >
        <View
          style={{ backgroundColor: categoryBg[item.category] }}
          className="w-[72px] h-[72px] rounded-2xl items-center justify-center mr-3"
        >
          <Text className="text-[32px]">{item.emoji}</Text>
        </View>

        <View className="flex-1 justify-between">
          <View>
            <Text
              numberOfLines={1}
              className="text-[15px] font-semibold text-brand-dark"
            >
              {item.name}
            </Text>
            <Text
              numberOfLines={2}
              className="text-[12px] text-brand-muted mt-0.5"
            >
              {item.description}
            </Text>
            {item.tags.length > 0 && (
              <View className="flex-row flex-wrap mt-1.5">
                {item.tags.map((t) => (
                  <View key={t} className="mr-1 mt-1">
                    <Tag label={t} variant={tagVariantFor(t)} />
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-[16px] font-bold text-brand-primary">
              ${item.price.toFixed(2)}
            </Text>
            <View>
              <Pressable
                onPress={handlePlusPress}
                hitSlop={8}
                className="h-9 w-9 rounded-full bg-brand-primary items-center justify-center"
              >
                <Animated.View style={plusStyle}>
                  <Ionicons name="add" size={20} color="#ffffff" />
                </Animated.View>
              </Pressable>
              <Animated.View
                pointerEvents="none"
                style={[
                  floatStyle,
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                  },
                ]}
              >
                <Text className="text-[22px]">{item.emoji}</Text>
              </Animated.View>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
