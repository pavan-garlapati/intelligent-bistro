import { Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export interface ActionConfirmAction {
  name: string;
  quantity: number;
  type: 'add' | 'remove';
}

export interface ActionConfirmCardProps {
  actions: ActionConfirmAction[];
}

export function ActionConfirmCard({ actions }: ActionConfirmCardProps) {
  if (actions.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(280)}
      className="bg-[#eaf3de] border border-[#97c459] rounded-2xl px-4 py-3 my-1"
    >
      <Text className="text-[13px] font-semibold text-[#27500a] mb-1.5 uppercase tracking-wide">
        Cart updated
      </Text>
      <View>
        {actions.map((a, i) => (
          <Text
            key={`${a.name}-${i}`}
            className="text-[14px] text-[#27500a] leading-5"
          >
            {a.type === 'add' ? '+ ' : '− '}
            {a.quantity}× {a.name}
          </Text>
        ))}
      </View>
    </Animated.View>
  );
}
