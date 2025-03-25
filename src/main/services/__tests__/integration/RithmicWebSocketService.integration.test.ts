import { RithmicWebSocketService } from '../../RithmicWebSocketService';

// Skip these tests by default unless explicitly run
describe.skip('RithmicWebSocketService Integration Tests', () => {
  let service: RithmicWebSocketService;
  
  // These should be configured via environment variables or a config file
  const config = {
    url: process.env.RITHMIC_WS_URL || 'wss://rituz00100.rithmic.com:443',
    apiKey: process.env.RITHMIC_API_KEY || 'Rithmic Test',
    systemName: process.env.RITHMIC_SYSTEM_NAME || 'andy@goat-algo.net',
    userId: process.env.RITHMIC_USER_ID || 'andy@goat-algo.net',
    password: process.env.RITHMIC_PASSWORD || 'jBMHOPAY'
  };
  // CME NQM5

  beforeAll(() => {
    // Validate required environment variables
    if (!config.apiKey || !config.systemName || !config.userId || !config.password) {
      throw new Error('Missing required environment variables for integration tests');
    }
  });

  beforeEach(() => {
    service = new RithmicWebSocketService(config);
  });

  afterEach(async () => {
    if (service) {
      service.disconnect();
    }
  });

  it('should connect to Rithmic and authenticate', async () => {
    // Connect to the service
    await service.connect();

    // Wait for authentication (you might need to adjust this timeout)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check the connection state
    const state = service.getState();
    expect(state.isConnected).toBe(true);
    expect(state.fcmId).toBeDefined();
    expect(state.ibId).toBeDefined();
  }, 30000); // Increase timeout for integration test

  it('should handle disconnection and reconnection', async () => {
    // Connect initially
    await service.connect();
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Force disconnect
    service.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check disconnected state
    let state = service.getState();
    expect(state.isConnected).toBe(false);

    // Reconnect
    await service.connect();
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check reconnected state
    state = service.getState();
    expect(state.isConnected).toBe(true);
    expect(state.fcmId).toBeDefined();
    expect(state.ibId).toBeDefined();
  }, 30000);

  it('should receive order notifications', async () => {
    // Connect and wait for authentication
    await service.connect();
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Subscribe to order updates (you'll need to implement this method)
    // await service.subscribeToOrders();

    // Wait for potential notifications
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Check if we received any notifications
    const state = service.getState();
    expect(state.isConnected).toBe(true);
  }, 30000);
}); 