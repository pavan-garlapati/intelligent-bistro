import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import * as Haptics from 'expo-haptics';

export type VoiceState = 'idle' | 'recording' | 'processing';

export interface UseVoiceInputOptions {
  onTranscriptReady?: (transcript: string) => void;
}

export interface UseVoiceInputResult {
  state: VoiceState;
  transcript: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
}

export function useVoiceInput(
  options: UseVoiceInputOptions = {},
): UseVoiceInputResult {
  const { onTranscriptReady } = options;

  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const transcriptRef = useRef('');
  const cancelledRef = useRef(false);
  const onTranscriptReadyRef = useRef(onTranscriptReady);

  useEffect(() => {
    onTranscriptReadyRef.current = onTranscriptReady;
  }, [onTranscriptReady]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useSpeechRecognitionEvent('start', () => {
    setState('recording');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const next = event.results?.[0]?.transcript ?? '';
    if (next) setTranscript(next);
  });

  useSpeechRecognitionEvent('error', (event) => {
    const message =
      (event as { message?: string }).message ||
      (event as { error?: string }).error ||
      'Speech recognition failed';
    setError(message);
    setState('idle');
  });

  useSpeechRecognitionEvent('end', () => {
    const final = transcriptRef.current.trim();
    const wasCancelled = cancelledRef.current;
    cancelledRef.current = false;
    setState('idle');
    if (!wasCancelled && final.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      onTranscriptReadyRef.current?.(final);
    }
  });

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');
    transcriptRef.current = '';
    cancelledRef.current = false;

    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setError('Microphone permission required');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setState('recording');

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to start recording';
      setError(msg);
      setState('idle');
    }
  }, []);

  const stopRecording = useCallback(() => {
    setState('processing');
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      setState('idle');
    }
  }, []);

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true;
    setTranscript('');
    transcriptRef.current = '';
    setState('idle');
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // already stopped
    }
  }, []);

  return {
    state,
    transcript,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
