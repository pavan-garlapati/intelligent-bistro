import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useOrdersStore } from '../../store/ordersStore';
import { OrderCard } from '../../components/orders/OrderCard';

export default function OrdersScreen() {
  const router = useRouter();
  const orders = useOrdersStore((s) => s.orders);

  const subtitle =
    orders.length === 0
      ? 'No orders yet'
      : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`;

  return (
    <View className="flex-1 bg-brand-cream">
      <StatusBar style="light" />

      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1a1008' }}>
        <View className="px-4 pt-1 pb-3">
          <Text className="text-white text-[20px] font-semibold">
            Your orders
          </Text>
          <Text className="text-brand-muted text-[12px] mt-0.5">
            {subtitle}
          </Text>
        </View>
      </SafeAreaView>

      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[72px]">📋</Text>
          <Text className="text-[18px] font-semibold text-brand-dark mt-4">
            No orders yet
          </Text>
          <Text className="text-brand-muted text-[14px] text-center mt-1 mb-6">
            Place your first order and it&rsquo;ll show up here.
          </Text>
          <Pressable
            onPress={() => router.push('/menu')}
            className="bg-brand-primary px-6 py-3 rounded-full"
          >
            <Text className="text-brand-cream font-bold text-[15px]">
              Browse Menu
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
