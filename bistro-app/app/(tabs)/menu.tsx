import { useEffect, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  Pressable,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useMenuStore } from '../../store/menuStore';
import { useCartStore } from '../../store/cartStore';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import { CategoryHeader } from '../../components/menu/CategoryHeader';
import { ItemDetailSheet } from '../../components/menu/ItemDetailSheet';
import { CartBadge } from '../../components/ui/CartBadge';
import { useToast } from '../../components/ui/ToastProvider';
import type { Category, MenuItem } from '../../types';

const PILL_OPTIONS = ['All', 'Starters', 'Mains', 'Drinks', 'Desserts'] as const;
type PillOption = (typeof PILL_OPTIONS)[number];

const CATEGORY_TO_KEY: Record<
  Category,
  'starters' | 'mains' | 'drinks' | 'desserts'
> = {
  Starters: 'starters',
  Mains: 'mains',
  Drinks: 'drinks',
  Desserts: 'desserts',
};

const ALL_CATEGORIES: Category[] = ['Starters', 'Mains', 'Drinks', 'Desserts'];

function SkeletonCard() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={animStyle}
      className="bg-brand-card border border-brand-border rounded-2xl p-3 flex-row mb-3"
    >
      <View className="w-[72px] h-[72px] rounded-2xl bg-brand-surface mr-3" />
      <View className="flex-1 justify-center">
        <View className="h-4 bg-brand-surface rounded-md w-3/4 mb-2" />
        <View className="h-3 bg-brand-surface rounded-md w-full mb-1.5" />
        <View className="h-3 bg-brand-surface rounded-md w-1/2" />
      </View>
    </Animated.View>
  );
}

export default function MenuScreen() {
  const router = useRouter();
  const items = useMenuStore((s) => s.items);
  const grouped = useMenuStore((s) => s.grouped);
  const isLoading = useMenuStore((s) => s.isLoading);
  const error = useMenuStore((s) => s.error);
  const fetchMenu = useMenuStore((s) => s.fetchMenu);

  const cartItems = useCartStore((s) => s.items);
  const addItemToCart = useCartStore((s) => s.addItem);

  const [selectedPill, setSelectedPill] = useState<PillOption>('All');
  const [searchText, setSearchText] = useState('');
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      fetchMenu();
    }
  }, [items.length, isLoading, fetchMenu]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems],
  );

  const sections = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return ALL_CATEGORIES
      .filter((c) => selectedPill === 'All' || selectedPill === c)
      .map((c) => {
        const data = (grouped[CATEGORY_TO_KEY[c]] || []).filter((i) => {
          if (!q) return true;
          const hay = `${i.name} ${i.description} ${i.tags.join(' ')}`.toLowerCase();
          return hay.includes(q);
        });
        return { title: c, data };
      })
      .filter((s) => s.data.length > 0);
  }, [grouped, selectedPill, searchText]);

  const handleAdd = (item: MenuItem, quantity: number) => {
    addItemToCart({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      emoji: item.emoji,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    showToast('Added to order', item.emoji);
  };

  const showSkeleton = isLoading && items.length === 0;
  const showError = !!error && items.length === 0;

  return (
    <View className="flex-1 bg-brand-cream">
      <StatusBar style="light" />

      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1a1008' }}>
        <View className="px-4 pt-1 pb-3">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-brand-muted text-[12px]">Good evening</Text>
              <Text className="text-white text-[20px] font-semibold">
                The Bistro
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/cart')}
              hitSlop={8}
              className="p-2"
            >
              <View>
                <Ionicons name="bag-outline" size={26} color="#ffffff" />
                {cartCount > 0 && (
                  <View
                    pointerEvents="none"
                    className="absolute -top-1.5 -right-2"
                  >
                    <CartBadge count={cartCount} />
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          <View className="flex-row items-center bg-[#2a1f12] rounded-full px-4 h-11">
            <Ionicons name="search" size={18} color="#a8937a" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search dishes..."
              placeholderTextColor="#a8937a"
              autoCorrect={false}
              autoCapitalize="none"
              className="flex-1 ml-2 text-white text-[15px]"
              style={{ paddingVertical: 0 }}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#a8937a" />
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>

      <View className="bg-brand-cream">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        >
          {PILL_OPTIONS.map((option) => {
            const active = selectedPill === option;
            return (
              <Pressable
                key={option}
                onPress={() => setSelectedPill(option)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  active ? 'bg-brand-primary' : 'bg-brand-surface'
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    active ? 'text-white' : 'text-brand-muted'
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {showSkeleton ? (
        <View className="px-4 pt-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : showError ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#a8937a" />
          <Text className="text-brand-dark text-[16px] font-semibold mt-3 mb-1">
            Couldn't load menu
          </Text>
          <Text className="text-brand-muted text-[14px] mb-4 text-center">
            {error}
          </Text>
          <Pressable
            onPress={fetchMenu}
            className="bg-brand-primary px-5 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderSectionHeader={({ section }) => (
            <View className="bg-brand-cream">
              <CategoryHeader title={section.title} count={section.data.length} />
            </View>
          )}
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              onAdd={handleAdd}
              onPress={(i) => setSheetItem(i)}
            />
          )}
          refreshing={isLoading}
          onRefresh={fetchMenu}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Text className="text-brand-dark text-[16px] font-semibold mb-1">
                No dishes found
              </Text>
              {searchText.length > 0 && (
                <Text className="text-brand-muted text-[14px]">
                  for &ldquo;{searchText}&rdquo;
                </Text>
              )}
            </View>
          }
        />
      )}

      <ItemDetailSheet
        item={sheetItem}
        onClose={() => setSheetItem(null)}
        onAdd={handleAdd}
      />
    </View>
  );
}
