import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { MenuItem } from '../../types';
import { QuantityStepper } from '../ui/QuantityStepper';
import { Tag, tagVariantFor } from '../ui/Tag';
import { categoryBg } from './categoryColors';

export interface ItemDetailSheetProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number) => void;
}

const TOAST_VISIBLE_MS = 1500;

function Toast({ visible }: { visible: boolean }) {
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
        Added to order!
      </Text>
    </Animated.View>
  );
}

export function ItemDetailSheet({ item, onClose, onAdd }: ItemDetailSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snapPoints = useMemo(() => ['60%'], []);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [item]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
      />
    ),
    [],
  );

  const handleAdd = () => {
    if (!item) return;
    onAdd(item, quantity);
    sheetRef.current?.dismiss();
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), TOAST_VISIBLE_MS);
  };

  const lineTotal = item ? item.price * quantity : 0;

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#fdf6ee' }}
        handleIndicatorStyle={{ backgroundColor: '#b85c28', width: 40 }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          {item && (
            <View className="flex-1 px-6 pt-3 pb-6 items-center">
              <View
                style={{ backgroundColor: categoryBg[item.category] }}
                className="w-20 h-20 rounded-full items-center justify-center"
              >
                <Text className="text-[48px]">{item.emoji}</Text>
              </View>

              <Text className="text-[22px] font-bold text-brand-dark text-center mt-4">
                {item.name}
              </Text>
              <Text className="text-[20px] font-bold text-brand-primary mt-1">
                ${item.price.toFixed(2)}
              </Text>

              <Text className="text-[15px] text-brand-muted text-center mt-3 px-2 leading-5">
                {item.description}
              </Text>

              {item.tags.length > 0 && (
                <View className="flex-row flex-wrap justify-center mt-3">
                  {item.tags.map((t) => (
                    <View key={t} className="mx-0.5 my-0.5">
                      <Tag label={t} variant={tagVariantFor(t)} />
                    </View>
                  ))}
                </View>
              )}

              <View className="flex-1" />

              <View className="mb-5">
                <QuantityStepper
                  quantity={quantity}
                  onIncrease={() => setQuantity((q) => q + 1)}
                  onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                  min={1}
                />
              </View>

              <Pressable
                onPress={handleAdd}
                className="w-full h-[50px] rounded-[14px] bg-brand-primary items-center justify-center flex-row"
              >
                <Text className="text-brand-cream text-[16px] font-bold">
                  Add to order
                </Text>
                <Text className="text-brand-cream text-[16px] font-bold mx-2">
                  •
                </Text>
                <Text className="text-brand-cream text-[16px] font-bold">
                  ${lineTotal.toFixed(2)}
                </Text>
              </Pressable>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
      <Toast visible={toastVisible} />
    </>
  );
}
