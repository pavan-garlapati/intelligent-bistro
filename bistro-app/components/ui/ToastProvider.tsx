import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View } from 'react-native';
import { Toast } from './Toast';

interface ToastState {
  visible: boolean;
  message: string;
  emoji?: string;
}

interface ToastContextValue {
  showToast: (message: string, emoji?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({
    visible: false,
    message: '',
    emoji: undefined,
  });
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, emoji?: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setState({ visible: false, message: '', emoji: undefined });
    requestAnimationFrame(() => {
      setState({ visible: true, message, emoji });
    });
  }, []);

  const handleHide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <Toast
          visible={state.visible}
          message={state.message}
          emoji={state.emoji}
          onHide={handleHide}
        />
      </View>
    </ToastContext.Provider>
  );
}
