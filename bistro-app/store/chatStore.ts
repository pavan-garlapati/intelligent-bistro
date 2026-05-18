import { create } from 'zustand';
import type { Message } from '../types';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (v: boolean) => void;
  clearMessages: () => void;
}

function generateMessageId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: generateMessageId(), timestamp: Date.now() },
      ],
    })),

  setLoading: (v) => set({ isLoading: v }),

  clearMessages: () => set({ messages: [] }),
}));
