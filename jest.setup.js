/* global jest */

// Increase timeout for all tests
jest.setTimeout(10000);

// Mock WebSocket globally
const WebSocketMock = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1 // WebSocket.OPEN
}));

// Add WebSocket constants
WebSocketMock.CONNECTING = 0;
WebSocketMock.OPEN = 1;
WebSocketMock.CLOSING = 2;
WebSocketMock.CLOSED = 3;

jest.mock('ws', () => {
  return {
    WebSocket: WebSocketMock
  };
}); 