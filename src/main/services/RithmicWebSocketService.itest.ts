import { RithmicWebSocketService } from './RithmicWebSocketService';
jest.setTimeout(600000);

// Skip these tests by default unless explicitly run
describe('RithmicWebSocketService Integration Tests', () => {

  // These should be configured via environment variables or a config file
  const config = {
    url: process.env.RITHMIC_WS_URL || 'wss://rituz00100.rithmic.com:443',
    systemName: process.env.RITHMIC_SYSTEM_NAME || 'Rithmic Test',
    userId: process.env.RITHMIC_USER_ID || 'andy@goat-algo.net',
    password: process.env.RITHMIC_PASSWORD || 'jBMHOPAY',
    ibId: 'Prospects',
    fcmId: 'Rithmic-FCM'
  };


  it.only('should just connect', async () => {
    const service = new RithmicWebSocketService(config);

    try {
      await service.connect();
      console.log('Connected!!!!💉');

      await new Promise(resolve => setTimeout(resolve, 3000));
      await service.subscribeToOrders()
      await new Promise(resolve => setTimeout(resolve, 30000));
    } finally {
      service.disconnect();
    }
  }); // Increase timeout for integration test


  it('should connect to Rithmic and authenticate', async () => {
    // Connect to the service
    const service = new RithmicWebSocketService(config);

    console.log('Connecting to Rithmic');
    await service.connect();

    // Wait for authentication (you might need to adjust this timeout)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check the connection state
    const state = service.getState();
    expect(state.isConnected).toBe(true);
    expect(state.fcmId).toBeDefined();
    expect(state.ibId).toBeDefined();
  }, 1000); // Increase timeout for integration test

});
