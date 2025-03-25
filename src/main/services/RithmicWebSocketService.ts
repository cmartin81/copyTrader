import { WebSocket } from 'ws';
import { RithmicProtoLoader } from './proto/RithmicProtoLoader';

// Enums from the Rithmic protocol
enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL'
}

enum Duration {
  DAY = 'DAY',
  GTC = 'GTC',
  IOC = 'IOC',
  FOK = 'FOK'
}

enum PriceType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LIMIT = 'STOP_LIMIT',
  STOP_MARKET = 'STOP_MARKET'
}

enum OrderPlacement {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO'
}

enum NotifyType {
  ORDER_RCVD_FROM_CLNT = 'ORDER_RCVD_FROM_CLNT',
  MODIFY_RCVD_FROM_CLNT = 'MODIFY_RCVD_FROM_CLNT',
  CANCEL_RCVD_FROM_CLNT = 'CANCEL_RCVD_FROM_CLNT',
  OPEN_PENDING = 'OPEN_PENDING',
  MODIFY_PENDING = 'MODIFY_PENDING',
  CANCEL_PENDING = 'CANCEL_PENDING',
  ORDER_RCVD_BY_EXCH_GTWY = 'ORDER_RCVD_BY_EXCH_GTWY',
  MODIFY_RCVD_BY_EXCH_GTWY = 'MODIFY_RCVD_BY_EXCH_GTWY',
  CANCEL_RCVD_BY_EXCH_GTWY = 'CANCEL_RCVD_BY_EXCH_GTWY',
  ORDER_SENT_TO_EXCH = 'ORDER_SENT_TO_EXCH',
  MODIFY_SENT_TO_EXCH = 'MODIFY_SENT_TO_EXCH',
  CANCEL_SENT_TO_EXCH = 'CANCEL_SENT_TO_EXCH',
  OPEN = 'OPEN',
  MODIFIED = 'MODIFIED',
  COMPLETE = 'COMPLETE',
  MODIFICATION_FAILED = 'MODIFICATION_FAILED',
  CANCELLATION_FAILED = 'CANCELLATION_FAILED',
  TRIGGER_PENDING = 'TRIGGER_PENDING',
  GENERIC = 'GENERIC',
  LINK_ORDERS_FAILED = 'LINK_ORDERS_FAILED'
}

interface RithmicWebSocketConfig {
  url: string;
  apiKey: string;
  systemName: string;
  userId: string;
  password: string;
  appName?: string;
  appVersion?: string;
  infraType?: string;
}

interface RithmicWebSocketState {
  isConnected: boolean;
  lastError?: string;
  connectionId?: string;
  fcmId?: string;
  ibId?: string;
  accountId?: string;
  tradeRoute?: string;
}

export class RithmicWebSocketService {
  private ws: WebSocket | null = null;
  private config: RithmicWebSocketConfig;
  private state: RithmicWebSocketState = {
    isConnected: false,
  };
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 5000; // 5 seconds
  private messageHandlers: Map<number, (data: Buffer) => void> = new Map();
  private protoLoader: RithmicProtoLoader;

  constructor(config: RithmicWebSocketConfig) {
    this.config = {
      appName: 'RithmicWebSocketService',
      appVersion: '1.0.0',
      infraType: 'ORDER_PLANT',
      ...config
    };
    this.protoLoader = RithmicProtoLoader.getInstance();
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    this.messageHandlers.set(11, this.handleAuthResponse.bind(this));
    this.messageHandlers.set(351, this.handleOrderNotification.bind(this));
    this.messageHandlers.set(352, this.handleExchangeOrderNotification.bind(this));
    this.messageHandlers.set(19, this.handleHeartbeatResponse.bind(this));
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, {
          rejectUnauthorized: false
        });

        this.ws.on('open', () => {
          this.state.isConnected = true;
          this.reconnectAttempts = 0;
          this.authenticate();
          resolve();
        });

        this.ws.on('message', (data: Buffer) => {
          this.handleMessage(data);
        });

        this.ws.on('error', (error: Error) => {
          this.state.lastError = error.message;
          this.handleDisconnect();
          reject(error);
        });

        this.ws.on('close', () => {
          this.handleDisconnect();
        });

      } catch (error) {
        this.state.lastError = error instanceof Error ? error.message : 'Unknown error';
        reject(error);
      }
    });
  }

  private handleMessage(data: Buffer): void {
    try {
      // First decode the base message to get the template ID
      const baseMessage = this.protoLoader.decodeMessage('Base', data);
      const handler = this.messageHandlers.get(baseMessage.templateId);
      
      if (handler) {
        handler(data);
      } else {
        console.log('Unhandled message type:', baseMessage.templateId);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  private handleAuthResponse(data: Buffer): void {
    try {
      const message = this.protoLoader.decodeMessage('ResponseLogin', data);
      if (message.rpCode[0] === '0') {
        this.state.fcmId = message.fcmId;
        this.state.ibId = message.ibId;
        console.log('Successfully authenticated with Rithmic');
      } else {
        this.state.lastError = message.userMsg.join(', ');
        this.handleDisconnect();
      }
    } catch (error) {
      console.error('Error handling auth response:', error);
    }
  }

  private handleOrderNotification(data: Buffer): void {
    try {
      const message = this.protoLoader.decodeMessage('RithmicOrderNotification', data);
      console.log('Order notification received:', {
        status: message.status,
        symbol: message.symbol,
        exchange: message.exchange,
        quantity: message.quantity,
        price: message.price,
        notifyType: message.notifyType
      });
    } catch (error) {
      console.error('Error handling order notification:', error);
    }
  }

  private handleExchangeOrderNotification(data: Buffer): void {
    try {
      const message = this.protoLoader.decodeMessage('ExchangeOrderNotification', data);
      console.log('Exchange order notification received:', {
        status: message.status,
        symbol: message.symbol,
        exchange: message.exchange,
        quantity: message.quantity,
        price: message.price,
        notifyType: message.notifyType
      });
    } catch (error) {
      console.error('Error handling exchange order notification:', error);
    }
  }

  private handleHeartbeatResponse(data: Buffer): void {
    try {
      const message = this.protoLoader.decodeMessage('ResponseHeartbeat', data);
      console.log('Heartbeat received');
    } catch (error) {
      console.error('Error handling heartbeat response:', error);
    }
  }

  private authenticate(): void {
    const loginMessage = {
      templateId: 10,
      templateVersion: '3.9',
      userMsg: ['hello'],
      user: this.config.userId,
      password: this.config.password,
      appName: this.config.appName!,
      appVersion: this.config.appVersion!,
      systemName: this.config.systemName,
      infraType: this.config.infraType!
    };

    const buffer = this.protoLoader.createMessage('RequestLogin', loginMessage);
    this.sendMessage(buffer);
  }

  public subscribeToOrders(): void {
    if (!this.state.fcmId || !this.state.ibId || !this.state.accountId) {
      throw new Error('Cannot subscribe to orders: Missing required IDs');
    }

    const subscribeMessage = {
      templateId: 308,
      userMsg: ['hello'],
      fcmId: this.state.fcmId,
      ibId: this.state.ibId,
      accountId: this.state.accountId
    };

    const buffer = this.protoLoader.createMessage('RequestSubscribeForOrderUpdates', subscribeMessage);
    this.sendMessage(buffer);
  }

  public sendHeartbeat(): void {
    const heartbeatMessage = {
      templateId: 18
    };

    const buffer = this.protoLoader.createMessage('RequestHeartbeat', heartbeatMessage);
    this.sendMessage(buffer);
  }

  private handleDisconnect(): void {
    this.state.isConnected = false;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectTimeout);
    } else {
      console.error('Max reconnection attempts reached');
      this.disconnect();
    }
  }

  public disconnect(): void {
    if (this.ws) {
      const logoutMessage = {
        templateId: 12,
        userMsg: ['goodbye']
      };
      const buffer = this.protoLoader.createMessage('RequestLogout', logoutMessage);
      this.sendMessage(buffer);
      this.ws.close(1000, "Normal closure");
      this.ws = null;
      this.state.isConnected = false;
    }
  }

  private sendMessage(buffer: Buffer): void {
    if (this.ws && this.state.isConnected) {
      this.ws.send(buffer);
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  public getState(): RithmicWebSocketState {
    return { ...this.state };
  }
} 