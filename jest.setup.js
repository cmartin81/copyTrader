// Increase timeout for all tests
jest.setTimeout(10000);

// Mock WebSocket globally
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1 // WebSocket.OPEN
  }));
}); 