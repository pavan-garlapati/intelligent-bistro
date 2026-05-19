import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useChatStore } from '../../store/chatStore';
import { useCartStore } from '../../store/cartStore';
import { sendChatMessage as apiSendChatMessage } from '../../services/api';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { VoiceOverlay } from '../../components/chat/VoiceOverlay';
import { LoadingDots } from '../../components/ui/LoadingDots';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import type { Message } from '../../types';

const DEFAULT_SUGGESTIONS = [
  "What's popular?",
  'Any vegan options?',
  "What's on the menu?",
  'Clear my order',
];

const QUICK_START_CHIPS = DEFAULT_SUGGESTIONS.slice(0, 3);

function SuggestionChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full mr-2"
    >
      <Text className="text-[13px] text-brand-dark">{label}</Text>
    </Pressable>
  );
}

function ChatHeader({ onClear }: { onClear: () => void }) {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#1a1008' }}>
      <View className="px-4 pt-1 pb-3 flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center">
          <MaterialCommunityIcons name="robot" size={22} color="#ffffff" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white text-[16px] font-semibold">
            Bistro AI
          </Text>
          <View className="flex-row items-center mt-0.5">
            <View
              style={{ backgroundColor: '#5fb947' }}
              className="w-2 h-2 rounded-full mr-1.5"
            />
            <Text className="text-brand-muted text-[12px]">
              Ready to take your order
            </Text>
          </View>
        </View>
        <Pressable onPress={onClear} hitSlop={8} className="p-2">
          <Ionicons name="trash-outline" size={20} color="#a8937a" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function WelcomeCard({ onChipPress }: { onChipPress: (text: string) => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-brand-primary items-center justify-center mb-4">
        <MaterialCommunityIcons name="robot" size={44} color="#ffffff" />
      </View>
      <Text className="text-[20px] font-bold text-brand-dark">
        Hi, I&rsquo;m Bistro AI
      </Text>
      <Text className="text-[14px] text-brand-muted text-center mt-2 mb-6 leading-5">
        Tell me what you&rsquo;d like to order, ask about the menu, or let me
        suggest something delicious.
      </Text>
      <View className="flex-row flex-wrap justify-center">
        {QUICK_START_CHIPS.map((c) => (
          <View key={c} className="m-1">
            <SuggestionChip label={c} onPress={() => onChipPress(c)} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const sessionId = useCartStore((s) => s.sessionId);
  const syncCart = useCartStore((s) => s.syncCart);

  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const voice = useVoiceInput({
    onTranscriptReady: (text) => {
      sendMessage(text, true);
    },
  });

  useEffect(() => {
    if (!voice.error) return;
    Alert.alert(
      'Voice input unavailable',
      `${voice.error}\n\nEnable microphone access for The Bistro in Settings, then try again.`,
    );
  }, [voice.error]);

  const hasText = inputText.trim().length > 0;
  const sendOpacity = useSharedValue(0);
  const micOpacity = useSharedValue(1);

  useEffect(() => {
    sendOpacity.value = withTiming(hasText ? 1 : 0, { duration: 160 });
    micOpacity.value = withTiming(hasText ? 0 : 1, { duration: 160 });
  }, [hasText, sendOpacity, micOpacity]);

  const sendAnimStyle = useAnimatedStyle(() => ({
    opacity: sendOpacity.value,
  }));
  const micAnimStyle = useAnimatedStyle(() => ({
    opacity: micOpacity.value,
  }));

  useEffect(() => {
    const id = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 60);
    return () => clearTimeout(id);
  }, [messages.length, isLoading]);

  const sendMessage = async (text: string, isVoice = false) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    addMessage({ role: 'user', content: trimmed, isVoice });
    setInputText('');
    setLoading(true);

    try {
      const res = await apiSendChatMessage(trimmed, sessionId);
      addMessage({
        role: 'assistant',
        content: res.reply,
        actions: res.actions,
        suggestions: res.suggestions,
      });
      if (Array.isArray(res.updatedCart)) {
        syncCart(res.updatedCart);
      }
    } catch {
      addMessage({
        role: 'assistant',
        content:
          "Sorry, I'm having trouble connecting. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = () => {
    if (messages.length === 0) return;
    Alert.alert(
      'Clear conversation?',
      'This will remove all messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearMessages(),
        },
      ],
    );
  };

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant');
  const activeSuggestions =
    lastAssistant?.suggestions && lastAssistant.suggestions.length > 0
      ? lastAssistant.suggestions
      : DEFAULT_SUGGESTIONS;

  return (
    <View className="flex-1 bg-brand-cream">
      <StatusBar style="light" />

      <ChatHeader onClear={handleClearConversation} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {messages.length === 0 ? (
          <WelcomeCard onChipPress={(t) => sendMessage(t)} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={
              isLoading ? (
                <View className="items-start mb-3">
                  <View className="bg-white border border-brand-border rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-[4px] px-4">
                    <LoadingDots />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {messages.length > 0 && (
          <View className="border-t border-brand-border bg-brand-cream pt-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {activeSuggestions.map((s) => (
                <SuggestionChip
                  key={s}
                  label={s}
                  onPress={() => sendMessage(s)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View className="bg-brand-cream border-t border-brand-border px-3 py-2 flex-row items-center">
          <View className="flex-1 bg-white rounded-full border border-brand-border px-4 h-11 flex-row items-center mr-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message Bistro AI..."
              placeholderTextColor="#a8937a"
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
              blurOnSubmit={false}
              autoCorrect
              className="flex-1 text-brand-dark text-[15px]"
              style={{ paddingVertical: 0 }}
            />
          </View>

          <View className="w-11 h-11 items-center justify-center">
            <Animated.View
              style={[micAnimStyle, { position: 'absolute' }]}
              pointerEvents={hasText ? 'none' : 'auto'}
            >
              <Pressable
                onPress={voice.startRecording}
                className="w-11 h-11 rounded-full bg-brand-surface items-center justify-center"
              >
                <Ionicons name="mic" size={20} color="#b85c28" />
              </Pressable>
            </Animated.View>

            <Animated.View
              style={[sendAnimStyle, { position: 'absolute' }]}
              pointerEvents={hasText ? 'auto' : 'none'}
            >
              <Pressable
                onPress={() => sendMessage(inputText)}
                disabled={isLoading}
                className="w-11 h-11 rounded-full bg-brand-primary items-center justify-center"
              >
                <Ionicons name="arrow-up" size={20} color="#ffffff" />
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <VoiceOverlay
        visible={voice.state !== 'idle'}
        transcript={voice.transcript}
        onStop={voice.stopRecording}
        onCancel={voice.cancelRecording}
      />
    </View>
  );
}
