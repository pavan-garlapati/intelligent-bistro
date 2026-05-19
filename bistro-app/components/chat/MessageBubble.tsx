import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Action, Message } from '../../types';
import { ActionConfirmCard, type ActionConfirmAction } from '../ui/ActionConfirmCard';

function formatTime(ts: number) {
  const d = new Date(ts);
  const h24 = d.getHours();
  const m = d.getMinutes();
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function mapActions(actions: Action[] | undefined): ActionConfirmAction[] {
  if (!actions) return [];
  return actions
    .filter((a) => a.type === 'add_item' || a.type === 'remove_item')
    .map((a) => ({
      name: a.name ?? a.itemId ?? '',
      quantity: a.quantity ?? 1,
      type: a.type === 'add_item' ? ('add' as const) : ('remove' as const),
    }));
}

export interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const confirmActions = isUser ? [] : mapActions(message.actions);

  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      {isUser && message.isVoice && (
        <View className="flex-row items-center bg-[#fbe7d8] px-2 py-0.5 rounded-full mb-1 mr-1">
          <Ionicons name="mic" size={11} color="#b85c28" />
          <Text className="text-[10px] text-brand-primary ml-1 font-semibold uppercase tracking-wide">
            Voice
          </Text>
        </View>
      )}

      <View
        className={
          isUser
            ? 'max-w-[80%] bg-brand-primary px-4 py-2.5 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-[4px]'
            : 'max-w-[80%] bg-white border border-brand-border px-4 py-2.5 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-[4px]'
        }
      >
        <Text
          className={
            isUser
              ? 'text-white text-[15px] leading-5'
              : 'text-brand-dark text-[15px] leading-5'
          }
        >
          {message.content}
        </Text>
      </View>

      <Text
        className={`text-[10px] text-brand-muted mt-1 ${
          isUser ? 'mr-1' : 'ml-1'
        }`}
      >
        {formatTime(message.timestamp)}
      </Text>

      {!isUser && confirmActions.length > 0 && (
        <View className="mt-1 max-w-[80%] w-full">
          <ActionConfirmCard actions={confirmActions} />
        </View>
      )}
    </View>
  );
}
