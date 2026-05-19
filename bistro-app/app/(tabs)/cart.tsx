import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  LinearTransition,
  ZoomIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useCartStore } from '../../store/cartStore';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import {
  removeFromCart as apiRemoveFromCart,
  updateCartItem as apiUpdateCartItem,
} from '../../services/api';
import type { CartItem } from '../../types';

const SWIPE_THRESHOLD = 100;

interface CartItemRowProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemRowProps) {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -screenWidth);
      } else {
        translateX.value = 0;
      }
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -screenWidth,
          { duration: 220 },
          (finished) => {
            if (finished) runOnJS(onRemove)();
          },
        );
      } else {
        translateX.value = withSpring(0, { damping: 14, stiffness: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleTrashPress = () => {
    translateX.value = withTiming(
      -screenWidth,
      { duration: 220 },
      (finished) => {
        if (finished) runOnJS(onRemove)();
      },
    );
  };

  const lineTotal = item.price * item.quantity;

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      className="mb-3"
    >
      <View
        pointerEvents="none"
        className="absolute inset-0 rounded-2xl bg-red-500 items-end justify-center pr-6"
      >
        <Ionicons name="trash" size={22} color="#ffffff" />
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={cardStyle}
          className="bg-brand-card border border-brand-border rounded-2xl p-3 flex-row items-center"
        >
          <View className="w-12 h-12 rounded-full bg-brand-surface items-center justify-center mr-3">
            <Text className="text-[24px]">{item.emoji}</Text>
          </View>

          <View className="flex-1 mr-2 pr-5">
            <Text
              numberOfLines={1}
              className="text-[15px] font-semibold text-brand-dark"
            >
              {item.name}
            </Text>
            <Text className="text-[12px] text-brand-muted mt-0.5">
              ${item.price.toFixed(2)} each
            </Text>
            <View className="mt-2">
              <QuantityStepper
                quantity={item.quantity}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                min={0}
              />
            </View>
          </View>

          <View className="items-end self-start">
            <Pressable onPress={handleTrashPress} hitSlop={8} className="p-1">
              <Ionicons name="close" size={18} color="#a8937a" />
            </Pressable>
            <Text className="text-[16px] font-bold text-brand-primary mt-2">
              ${lineTotal.toFixed(2)}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-[80px]">🍽️</Text>
      <Text className="text-[18px] font-semibold text-brand-dark mt-4">
        Your cart is empty
      </Text>
      <Text className="text-brand-muted text-[14px] text-center mt-1 mb-6">
        Browse our menu and add something delicious
      </Text>
      <Pressable
        onPress={onExplore}
        className="bg-brand-primary px-6 py-3 rounded-full"
      >
        <Text className="text-brand-cream font-bold text-[15px]">
          Explore Menu
        </Text>
      </Pressable>
    </View>
  );
}

interface SuccessModalProps {
  visible: boolean;
  onOrderAgain: () => void;
}

function SuccessModal({ visible, onOrderAgain }: SuccessModalProps) {
  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      className="absolute inset-0 items-center justify-center px-8"
    >
      <Animated.View
        entering={ZoomIn.springify().damping(14).stiffness(180)}
        className="bg-white rounded-3xl px-6 pt-6 pb-5 items-center w-full"
      >
        <View
          style={{ backgroundColor: '#27500a' }}
          className="w-16 h-16 rounded-full items-center justify-center mb-3"
        >
          <Ionicons name="checkmark" size={36} color="#ffffff" />
        </View>
        <Text className="text-[20px] font-bold text-brand-dark">
          Order placed!
        </Text>
        <Text className="text-brand-muted text-[14px] text-center mt-1 mb-5">
          Your food will be ready in ~20 minutes
        </Text>
        <Pressable
          onPress={onOrderAgain}
          className="w-full h-12 bg-brand-primary rounded-2xl items-center justify-center"
        >
          <Text className="text-brand-cream font-bold text-[15px]">
            Order again
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const tax = useCartStore((s) => s.tax);
  const total = useCartStore((s) => s.total);
  const sessionId = useCartStore((s) => s.sessionId);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const [showSuccess, setShowSuccess] = useState(false);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleIncrease = (item: CartItem) => {
    const nextQty = item.quantity + 1;
    updateQuantity(item.itemId, nextQty);
    apiUpdateCartItem(sessionId, item.itemId, nextQty).catch(() => {});
  };

  const handleDecrease = (item: CartItem) => {
    const nextQty = item.quantity - 1;
    updateQuantity(item.itemId, nextQty);
    if (nextQty <= 0) {
      apiRemoveFromCart(sessionId, item.itemId).catch(() => {});
    } else {
      apiUpdateCartItem(sessionId, item.itemId, nextQty).catch(() => {});
    }
  };

  const handleRemove = (item: CartItem) => {
    removeItem(item.itemId);
    apiRemoveFromCart(sessionId, item.itemId).catch(() => {});
  };

  const handlePlaceOrder = () => {
    setShowSuccess(true);
  };

  const handleOrderAgain = () => {
    setShowSuccess(false);
    clearCart();
    router.push('/menu');
  };

  return (
    <View className="flex-1 bg-brand-cream">
      <StatusBar style="light" />

      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1a1008' }}>
        <View className="px-4 pt-1 pb-3">
          <Text className="text-white text-[20px] font-semibold">
            Your order
          </Text>
          <Text className="text-brand-muted text-[12px] mt-0.5">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · Table 7
          </Text>
        </View>
      </SafeAreaView>

      {items.length === 0 ? (
        <EmptyState onExplore={() => router.push('/menu')} />
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <CartItemRow
                key={item.itemId}
                item={item}
                onIncrease={() => handleIncrease(item)}
                onDecrease={() => handleDecrease(item)}
                onRemove={() => handleRemove(item)}
              />
            ))}
          </ScrollView>

          <View className="px-4 pb-4 pt-2 bg-brand-cream">
            <View className="bg-brand-card border border-brand-border rounded-2xl px-4 py-3 mb-3">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-[14px] text-brand-muted">Subtotal</Text>
                <Text className="text-[14px] font-semibold text-brand-dark">
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[14px] text-brand-muted">Tax (8%)</Text>
                <Text className="text-[14px] font-semibold text-brand-dark">
                  ${tax.toFixed(2)}
                </Text>
              </View>
              <View className="h-px bg-brand-border my-1" />
              <View className="flex-row justify-between items-baseline mt-2">
                <Text className="text-[16px] font-semibold text-brand-dark">
                  Total
                </Text>
                <Text className="text-[22px] font-bold text-brand-dark">
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handlePlaceOrder}
              className="w-full h-[52px] bg-brand-primary rounded-2xl items-center justify-center"
            >
              <Text className="text-brand-cream text-[16px] font-bold">
                Place order — ${total.toFixed(2)}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      <SuccessModal visible={showSuccess} onOrderAgain={handleOrderAgain} />
    </View>
  );
}
