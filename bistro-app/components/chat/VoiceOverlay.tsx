import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface VoiceOverlayProps {
  visible: boolean;
  transcript: string;
  onStop: () => void;
  onCancel: () => void;
}

function PulsingRing({
  delay,
  finalScale,
}: {
  delay: number;
  finalScale: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(withTiming(finalScale, { duration: 1400 }), -1, false),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(0, { duration: 1400 }), -1, false),
    );
  }, [delay, finalScale, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          position: 'absolute',
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 2,
          borderColor: '#b85c28',
        },
      ]}
    />
  );
}

function WaveformBar({ delay }: { delay: number }) {
  const height = useSharedValue(8);

  useEffect(() => {
    height.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(28 + Math.random() * 8, { duration: 420 }),
          withTiming(6 + Math.random() * 6, { duration: 420 }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, height]);

  const style = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 4,
          marginHorizontal: 3,
          borderRadius: 2,
          backgroundColor: '#b85c28',
        },
      ]}
    />
  );
}

const BAR_DELAYS = [0, 90, 180, 60, 220, 140, 200, 50];

export function VoiceOverlay({
  visible,
  transcript,
  onStop,
  onCancel,
}: VoiceOverlayProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{ backgroundColor: 'rgba(26, 16, 8, 0.92)' }}
      className="absolute inset-0 items-center justify-center px-8"
    >
      <View className="w-[72px] h-[72px] items-center justify-center">
        <PulsingRing delay={0} finalScale={1.4} />
        <PulsingRing delay={300} finalScale={1.8} />
        <Pressable
          onPress={onStop}
          className="w-[72px] h-[72px] rounded-full bg-brand-primary items-center justify-center"
        >
          <Ionicons name="mic" size={32} color="#ffffff" />
        </Pressable>
      </View>

      <View className="flex-row items-end h-9 mt-7">
        {BAR_DELAYS.map((d, i) => (
          <WaveformBar key={i} delay={d} />
        ))}
      </View>

      <Text className="text-white text-[16px] font-semibold mt-4">
        Listening...
      </Text>

      <View className="min-h-[44px] mt-3 px-2">
        <Text
          className="text-brand-cream text-[15px] italic text-center opacity-80"
          numberOfLines={3}
        >
          {transcript}
        </Text>
      </View>

      <Text className="text-brand-muted text-[12px] mt-1">Tap mic to stop</Text>

      <Pressable
        onPress={onCancel}
        style={{ borderColor: 'rgba(255,255,255,0.3)' }}
        className="absolute bottom-12 px-6 py-3 rounded-full border"
      >
        <Text className="text-white text-[14px] font-semibold">Cancel</Text>
      </Pressable>
    </Animated.View>
  );
}
