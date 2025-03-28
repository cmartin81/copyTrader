import { create } from 'zustand';

interface BotWindow {
  id: string;
}

interface BotWindowStore {
  windows: BotWindow[];
  addBotWindow: (id: string) => void;
  removeBotWindow: (id: string) => void;
}

export const useBotWindowStore = create<BotWindowStore>((set) => ({
  windows: [],
  addBotWindow: (id: string): void => set((state) => ({ 
    windows: [...state.windows, { id }] 
  })),
  removeBotWindow: (id: string): void => set((state) => ({ 
    windows: state.windows.filter((window) => window.id !== id) 
  }))
})); 