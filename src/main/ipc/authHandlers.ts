import { ipcMain } from 'electron';
import { getAppState, setAppState } from '../store';
import { logToFile } from '../utils/logger';

export function setupAuthHandlers(): void {
  // Handle login request from renderer process
  ipcMain.handle('auth:login', async () => {
    try {
      // Get current app state
      const currentState = getAppState();

      // Simulate network latency with a 2-second delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Set fake user data
      const updatedState = {
        ...currentState,
        user: {
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
          username: 'Demo User',
          email: 'demo@example.com',
          isLoggedIn: true
        }
      };

      // Update app state
      setAppState(updatedState);

      logToFile('User logged in successfully');

      return { success: true };
    } catch (error:any) {
      console.error('Error during login:', error);
      logToFile(`Login error: ${error.message}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  });

  // Handle logout request from renderer process
  ipcMain.handle('auth:logout', async () => {
    try {
      // Get current app state
      const currentState = getAppState();

      // Remove user data
      const updatedState = {
        ...currentState,
        user: undefined
      };

      // Update app state
      setAppState(updatedState);

      logToFile('User logged out successfully');

      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      logToFile(`Logout error: ${error.message}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  });
}
