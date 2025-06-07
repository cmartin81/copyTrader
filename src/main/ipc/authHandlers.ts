import { ipcMain } from 'electron';
import { getAppState, setAppState, setLicense } from '../store'
import { logToFile } from '../utils/logger';
import WhopApiClient from '../services/whop/WhopApiClient';
import { doAuthorization, logout } from '../services/auth'

export function setupAuthHandlers(): void {
  // Handle license key update from renderer process
  ipcMain.handle('auth:set-license', async (_event, { licenseKey }) => {
    setLicense(licenseKey)
    logToFile('License key updated');
    return { success: true };
  });

  // Handle fake login request from renderer process
  ipcMain.handle('auth:login-fake', async () => {
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

      logToFile('User logged in with fake credentials');

      return { success: true };
    } catch (error:any) {
      console.error('Error during fake login:', error);
      logToFile(`Fake login error: ${error.message}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  });

  // Handle real OAuth login request from renderer process
  ipcMain.handle('auth:login', async (_event, { accessToken, refreshToken, expirationTime }) => {
    try {
      // Get current app state
      const currentState = getAppState();

      // Get licenseKey from appStore if it exists
      const licenseKey = currentState.user?.licenseKey || '';

      // Call doAuthorization with accessToken and licenseKey
      const isAuthorized = await doAuthorization(accessToken, licenseKey);

      // Set user data with provided tokens
      const updatedState = {
        ...currentState,
        user: {
          ...currentState.user,
          accessToken,
          refreshToken,
          expirationTime,
          isLoggedIn: true
        }
      };

      // Update app state
      setAppState(updatedState);

      logToFile('User logged in with OAuth tokens');

      // If not authorized, return a special response to show license page
      if (!isAuthorized) {
        return {
          success: true,
          needsLicense: true
        };
      }

      return { success: true };
    } catch (error:any) {
      console.error('Error during OAuth login:', error);
      logToFile(`OAuth login error: ${error.message}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  });

  // Handle logout request from renderer process
  ipcMain.handle('auth:logout', async () => {
    return await logout()
  });
}
