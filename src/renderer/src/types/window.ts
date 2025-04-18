export interface IpcResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface TargetAccount {
  id: string;
  type: 'TopstepX' | 'Bulenox' | 'TheFuturesDesk' | 'TickTickTrader';
  accountId: string;
  credentials?: {
    username: string;
    password: string;
  };
  accounts?: {
    id: string;
    name: string;
    alias: string | null;
  }[];
  symbolMappings: {
    sourceSymbol: string;
    targetSymbol: string;
    multiplier: number;
    isEditing: boolean;
  }[];
}

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, func: (...args: any[]) => void) => void;
        removeListener: (channel: string, func: (...args: any[]) => void) => void;
      };
    };
    store: {
      get: (key: string) => any;
      set: (key: string, value: any) => void;
    };
  }
} 