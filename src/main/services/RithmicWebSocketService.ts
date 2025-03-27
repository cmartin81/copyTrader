import { WebSocket } from 'ws'
import { RithmicProtoLoader } from './proto/RithmicProtoLoader'

interface RithmicWebSocketConfig {
  url: string
  systemName: string
  userId: string
  password: string
  appName?: string
  appVersion?: string
  infraType?: string
}

interface RithmicWebSocketState {
  isConnected: boolean
  lastError?: string
  connectionId?: string
  fcmId?: string
  ibId?: string
  accountId?: string
  tradeRoute?: string
}

export class RithmicWebSocketService {
  private ws: WebSocket | null = null
  private config: RithmicWebSocketConfig
  private state: RithmicWebSocketState = {
    isConnected: false
  }
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectTimeout: number = 5000 // 5 seconds
  private messageHandlers: Map<number, (data: Buffer) => void> = new Map()
  private protoLoader: RithmicProtoLoader
  transactionTypeToString: { [x: number]: string } = {}
  priceTypeToString: { [x: number]: string } = {}
  orderPlacementToString: { [x: number]: string } = {}

  constructor(config: RithmicWebSocketConfig) {
    this.config = {
      appName: 'RithmicWebSocketService',
      appVersion: '1.0.0',
      infraType: 'ORDER_PLANT',
      ...config
    }
    this.protoLoader = RithmicProtoLoader.getInstance()
    this.setupMessageHandlers()
    this.defineMappings()
    setInterval(() => {
      if (this.state.isConnected) {
        process.stdout.write('❤️');
        this.sendHeartbeat()
      }
    }, 10 * 1000)
  }

  private defineMappings(): void {
    const RithmicOrderNotification: protobuf.Type = this.protoLoader.getMessageType(
      'RithmicOrderNotification'
    )
    const TransactionType = RithmicOrderNotification.TransactionType
    const PriceType = RithmicOrderNotification.PriceType
    const OrderPlacement = RithmicOrderNotification.OrderPlacement

    this.transactionTypeToString = {
      [TransactionType.BUY]: 'BUY',
      [TransactionType.SELL]: 'SELL'
    }

    this.priceTypeToString = {
      [PriceType.LIMIT]: 'LIMIT',
      [PriceType.MARKET]: 'MARKET',
      [PriceType.STOP_LIMIT]: 'STOP_LIMIT',
      [PriceType.STOP_MARKET]: 'STOP_MARKET'
    }

    this.orderPlacementToString = {
      [OrderPlacement.MANUAL]: 'MANUAL',
      [OrderPlacement.AUTO]: 'AUTO'
    }
  }
  private setupMessageHandlers(): void {
    // this.messageHandlers.set(11, this.handleAuthResponse.bind(this));
    this.messageHandlers.set(351, this.handleOrderNotification.bind(this))
    this.messageHandlers.set(352, this.handleExchangeOrderNotification.bind(this))
    this.messageHandlers.set(19, this.handleHeartbeatResponse.bind(this))
    this.messageHandlers.set(309, this.handleGenericSubscribeForOrderUpdates.bind(this))
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, {
          rejectUnauthorized: false,
          autoPong: true
        })

        this.ws.on('open', () => {
          this.state.isConnected = true
          this.reconnectAttempts = 0
          this.authenticate().then(() => {
            console.log('DONE my job here...');

            resolve()
          })
        })

        this.ws.on('message', (data: Buffer) => {
          this.handleMessage(data)
        })

        this.ws.on('error', (error: Error) => {
          console.log('🔴🔴🔴🔴🔴')
          this.state.lastError = error.message
          console.error('WebSocket error:', error)
          this.handleDisconnect()
          reject(error)
        })

        this.ws.on('close', () => {
          console.log('WebSocket closed')
          this.handleDisconnect()
        })
      } catch (error) {
        console.log('💥💥💥💥')

        this.state.lastError = error instanceof Error ? error.message : 'Unknown error'
        reject(error)
      }
    })
  }

  private handleMessage(data: Buffer): void {
    try {
      // First decode the base message to get the template ID
      const baseMessage = this.protoLoader.decodeMessage('Base', data)
      // console.log(JSON.stringify(baseMessage))

      const handler = this.messageHandlers.get(baseMessage.templateId)

      if (handler) {
        handler(data)
      } else {
        console.log('Unhandled message type:', baseMessage.templateId)
      }
    } catch (error) {
      console.error('Error parsing message:', error)
    }
  }

  private handleAuthResponse(data: Buffer): void {
    try {
      const message = this.protoLoader.decodeMessage('ResponseLogin', data)
      console.log(message)
      if (message.rpCode[0] === '0') {
        this.state.fcmId = message.fcmId
        this.state.ibId = message.ibId
        console.log('Successfully authenticated with Rithmic')
      } else {
        this.state.lastError = message.userMsg.join(', ') + ' (' + message.rpCode.join(' ,') + ')'
        console.error('Authentication failed:', this.state.lastError)
        console.log('222222');

        this.handleDisconnect()
      }
    } catch (error) {
      console.error('Error handling auth response:', error)
    }
  }

  private handleGenericSubscribeForOrderUpdates(data: Buffer): void {
    try {
      const message = this.protoLoader.decodeMessage('ResponseSubscribeForOrderUpdates', data)
      console.log({message});

    } catch (error) {
      console.error('Error handling order notification:', error)
    }
  }
  private handleOrderNotification(data: Buffer): void {
    try {
      const message = this.protoLoader.decodeMessage('RithmicOrderNotification', data)
      // console.log('Order notification received:', {
      //   status: message.status,
      //   symbol: message.symbol,
      //   exchange: message.exchange,
      //   quantity: message.quantity,
      //   price: message.price,
      //   notifyType: message.notifyType
      // });
      if (message.status === 'complete' && message.totalFillSize !== 0) {
        console.log(message)
        const executionType = this.priceTypeToString[message.priceType]
        const type = this.transactionTypeToString[message.transactionType]
        console.log(`${type} ${executionType} ${message.quantity}x${message.symbol}`)
      }
    } catch (error) {
      console.error('Error handling order notification:', error)
    }
  }

  private handleExchangeOrderNotification(data: Buffer): void {
    try {
      // const message = this.protoLoader.decodeMessage('ExchangeOrderNotification', data)
      // console.log('Exchange order notification received:', {
      //   status: message.status,
      //   symbol: message.symbol,
      //   exchange: message.exchange,
      //   quantity: message.quantity,
      //   price: message.price,
      //   notifyType: message.notifyType
      // })
    } catch (error) {
      console.error('Error handling exchange order notification:', error)
    }
  }

  private handleHeartbeatResponse(data: Buffer): void {
    try {
      const message = this.protoLoader.decodeMessage('ResponseHeartbeat', data)
      process.stdout.write('💞');

      // console.log('Heartbeat received')
      // console.log(message)
    } catch (error) {
      console.error('Error handling heartbeat response:', error)
    }
  }

  private async authenticate(): Promise<void> {
    const loginMessage = {
      templateId: 10,
      templateVersion: '3.9',
      userMsg: ['hello'],
      user: this.config.userId,
      password: this.config.password,
      appName: this.config.appName!,
      appVersion: this.config.appVersion!,
      systemName: this.config.systemName,
      infraType: 2
    }

    const buffer = this.protoLoader.createMessage('RequestLogin', loginMessage)
    this.sendMessage(buffer)
    const response = await new Promise((resolve) => this.ws!.once('message', resolve))

    this.handleAuthResponse(response as Buffer)
  }

  public subscribeToOrders(): void {
    if (!this.state.fcmId || !this.state.ibId) {
      throw new Error('Cannot subscribe to orders: Missing required IDs')
    }

    const subscribeMessage = {
      templateId: 308,
      userMsg: ['hello'],
      fcmId: this.state.fcmId,
      ibId: this.state.ibId,
      accountId: 'AN7989'
    }

    const buffer = this.protoLoader.createMessage(
      'RequestSubscribeForOrderUpdates',
      subscribeMessage
    )
    this.sendMessage(buffer)
  }

  public sendHeartbeat(): void {
    const heartbeatMessage = {
      templateId: 18
    }

    const buffer = this.protoLoader.createMessage('RequestHeartbeat', heartbeatMessage)
    this.sendMessage(buffer)
  }

  private handleDisconnect(): void {
    this.state.isConnected = false
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        )
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error)
        })
      }, this.reconnectTimeout)
    } else {
      console.error('Max reconnection attempts reached')
      this.disconnect()
    }
  }

  public disconnect(): void {
    console.log('disconnecting');

    if (this.ws) {
      const logoutMessage = {
        templateId: 12,
        userMsg: ['goodbye']
      }
      const buffer = this.protoLoader.createMessage('RequestLogout', logoutMessage)
      this.sendMessage(buffer)
      this.ws.close(1000, 'Normal closure')
      this.ws = null
      this.state.isConnected = false
    }
  }

  private sendMessage(buffer: Buffer): void {
    if (this.ws && this.state.isConnected) {
      this.ws.send(buffer)
    } else {
      throw new Error('WebSocket is not connected')
    }
  }

  public getState(): RithmicWebSocketState {
    return { ...this.state }
  }
}
