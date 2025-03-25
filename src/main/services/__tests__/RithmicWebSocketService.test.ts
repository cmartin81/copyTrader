import { RithmicWebSocketService } from '../RithmicWebSocketService';
import { WebSocket } from 'ws';

// Mock the WebSocket module
jest.mock('ws');

describe('RithmicWebSocketService', () => {
  let service: RithmicWebSocketService;
  let mockWebSocket: jest.Mocked<WebSocket>;

  const mockConfig = {
    url: 'wss://test.rithmic.com',
    apiKey: 'test-api-key',
    systemName: 'test-system',
    userId: 'test-user',
    password: 'test-password'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock WebSocket instance
    mockWebSocket = {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN
    } as unknown as jest.Mocked<WebSocket>;

    // Mock the WebSocket constructor
    (WebSocket as jest.Mock).mockImplementation(() => mockWebSocket);

    // Create service instance
    service = new RithmicWebSocketService(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const state = service.getState();
      expect(state.isConnected).toBe(false);
      expect(state.fcmId).toBeUndefined();
      expect(state.ibId).toBeUndefined();
    });

    it('should merge provided config with defaults', () => {
      const customConfig = {
        ...mockConfig,
        appName: 'CustomApp',
        appVersion: '2.0.0',
        infraType: 'CUSTOM_TYPE'
      };

      const customService = new RithmicWebSocketService(customConfig);
      const state = customService.getState();
      expect(state.isConnected).toBe(false);
    });
  });

  describe('connect', () => {
    it('should establish WebSocket connection', async () => {
      // Simulate successful connection
      const openCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'open'
      )[1];
      openCallback();

      await service.connect();
      expect(WebSocket).toHaveBeenCalledWith(mockConfig.url, {
        rejectUnauthorized: false
      });
      expect(mockWebSocket.on).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should handle connection errors', async () => {
      // Simulate connection error
      const errorCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'error'
      )[1];
      errorCallback(new Error('Connection failed'));

      await expect(service.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('message handling', () => {
    it('should handle auth response message', async () => {
      await service.connect();

      const messageCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'message'
      )[1];

      const mockAuthResponse = {
        templateId: 11,
        type: 'auth_response',
        rpCode: ['0'],
        fcmId: 'test-fcm-id',
        ibId: 'test-ib-id',
        userMsg: ['success'],
        templateVersion: '3.9',
        countryCode: 'US',
        stateCode: 'CA',
        heartbeatInterval: 30,
        uniqueUserId: 'test-user-id'
      };

      messageCallback(Buffer.from(JSON.stringify(mockAuthResponse)));

      const state = service.getState();
      expect(state.fcmId).toBe('test-fcm-id');
      expect(state.ibId).toBe('test-ib-id');
    });

    it('should handle order notification message', async () => {
      await service.connect();

      const messageCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'message'
      )[1];

      const mockOrderNotification = {
        templateId: 351,
        type: 'order_notification',
        notifyType: 'ORDER_RCVD_FROM_CLNT',
        status: 'complete',
        symbol: 'ES',
        exchange: 'CME',
        quantity: 1,
        price: 4000,
        triggerPrice: 0,
        transactionType: 'BUY',
        duration: 'DAY',
        priceType: 'LIMIT',
        manualOrAuto: 'MANUAL',
        sequenceNumber: 1,
        currency: 'USD',
        countryCode: 'US',
        text: 'Test order',
        reportText: 'Order report',
        remarks: 'Test remarks'
      };

      messageCallback(Buffer.from(JSON.stringify(mockOrderNotification)));

      // Verify the message was processed (you might want to add more specific assertions)
      const state = service.getState();
      expect(state.isConnected).toBe(true);
    });
  });

  describe('disconnect', () => {
    it('should close WebSocket connection', async () => {
      await service.connect();
      service.disconnect();
      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Normal closure');
    });
  });

  describe('reconnection', () => {
    it('should attempt to reconnect on disconnection', async () => {
      jest.useFakeTimers();

      await service.connect();

      // Simulate disconnection
      const closeCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'close'
      )[1];
      closeCallback();

      // Fast-forward timers
      jest.advanceTimersByTime(5000);

      expect(WebSocket).toHaveBeenCalledTimes(2); // Initial connection + reconnection attempt

      jest.useRealTimers();
    });
  });
}); 