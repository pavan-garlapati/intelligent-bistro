import { View, Text } from 'react-native';

type Variant = 'spicy' | 'vegan' | 'popular' | 'default';

const variantClasses: Record<Variant, { container: string; text: string }> = {
  spicy: { container: 'bg-[#fde8e8]', text: 'text-[#a32d2d]' },
  vegan: { container: 'bg-[#eaf3de]', text: 'text-[#27500a]' },
  popular: { container: 'bg-[#faeeda]', text: 'text-[#633806]' },
  default: { container: 'bg-[#f0e6d9]', text: 'text-[#8a6240]' },
};

export interface TagProps {
  label: string;
  variant?: Variant;
}

export function Tag({ label, variant = 'default' }: TagProps) {
  const v = variantClasses[variant];
  return (
    <View className={`${v.container} px-2 py-0.5 rounded-full self-start`}>
      <Text className={`${v.text} text-[11px] font-medium`}>{label}</Text>
    </View>
  );
}

export function tagVariantFor(tag: string): Variant {
  const lower = tag.toLowerCase();
  if (lower === 'spicy') return 'spicy';
  if (lower === 'vegan') return 'vegan';
  if (lower === 'popular') return 'popular';
  return 'default';
}
