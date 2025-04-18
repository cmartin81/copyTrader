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
    id: number;
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