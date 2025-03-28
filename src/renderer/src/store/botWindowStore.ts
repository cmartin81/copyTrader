import { create } from 'zustand';

interface BotWindow {
  id: string;
  name: string;
  isActive: boolean;
}

interface BotWindowStore {
  windows: BotWindow[];
  addWindow: (name: string) => void;
  removeWindow: (id: string) => void;
  updateWindowStatus: (id: string, isActive: boolean) => void;
}

export const useBotWindowStore = create<BotWindowStore>((set) => ({
  windows: [],
  addWindow: (name: string): void => {
    set((state) => ({
      windows: [
        ...state.windows,
        {
          id: Math.random().toString(36).substr(2, 9),
          name,
          isActive: true,
        },
      ],
    }));
  },
  removeWindow: (id: string): void => {
    set((state) => ({
      windows: state.windows.filter((window) => window.id !== id),
    }));
  },
  updateWindowStatus: (id: string, isActive: boolean): void => {
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id ? { ...window, isActive } : window
      ),
    }));
  },
})); 