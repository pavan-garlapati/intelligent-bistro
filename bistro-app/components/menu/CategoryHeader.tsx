import { Text, View } from 'react-native';

export interface CategoryHeaderProps {
  title: string;
  count: number;
}

export function CategoryHeader({ title, count }: CategoryHeaderProps) {
  return (
    <View className="flex-row items-center my-3 px-1">
      <View className="w-[3px] h-5 bg-brand-primary rounded-full mr-2.5" />
      <Text className="flex-1 text-[13px] font-semibold uppercase tracking-widest text-brand-dark">
        {title}
      </Text>
      <View className="bg-brand-surface px-2 py-0.5 rounded-full min-w-[24px] items-center">
        <Text className="text-[11px] font-semibold text-brand-muted">
          {count}
        </Text>
      </View>
    </View>
  );
}
