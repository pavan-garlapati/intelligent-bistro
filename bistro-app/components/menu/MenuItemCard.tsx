import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => onPress(item)}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 14, stiffness: 220 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 180 });
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
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
            <Pressable
              onPress={() => onAdd(item, 1)}
              hitSlop={8}
              className="h-9 w-9 rounded-full bg-brand-primary items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
