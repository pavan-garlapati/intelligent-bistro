import { Text, View } from 'react-native';
import type { Order } from '../../types';

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(ts).toLocaleDateString();
}

export interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const summary = order.items
    .map((i) => `${i.quantity}× ${i.name}`)
    .join(', ');

  return (
    <View className="bg-brand-card border border-brand-border rounded-2xl px-4 py-3 mb-2">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-brand-muted">
          Order #{order.id.slice(0, 6)}
        </Text>
        <Text className="text-[11px] text-brand-muted">
          {relativeTime(order.placedAt)}
        </Text>
      </View>
      <View className="flex-row justify-between items-baseline">
        <Text className="text-[14px] text-brand-dark">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
        <Text className="text-[16px] font-bold text-brand-primary">
          ${order.total.toFixed(2)}
        </Text>
      </View>
      <Text
        numberOfLines={2}
        className="text-[12px] text-brand-muted mt-1"
      >
        {summary}
      </Text>
    </View>
  );
}
