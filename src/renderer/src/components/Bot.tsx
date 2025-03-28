import React, { useEffect } from 'react';
import { useBotWindowStore } from '../store/botWindowStore';

interface PuppeteerResponse {
  success: boolean;
  error?: string;
}

const Bot: React.FC = () => {
  const { windows, addWindow, removeWindow } = useBotWindowStore();

  useEffect(() => {
    // Listen for window close events from main process
    const handleWindowClosed = (_event: Electron.IpcRendererEvent, botId: string): void => {
      removeWindow(botId);
    };

    window.electron.ipcRenderer.on('bot-window-closed', handleWindowClosed);

    return (): void => {
      window.electron.ipcRenderer.removeListener('bot-window-closed', handleWindowClosed);
    };
  }, [removeWindow]);

  const handleLaunch = async (): Promise<void> => {
    try {
      const botName = `Bot ${windows.length + 1}`;
      const botId = Math.random().toString(36).substr(2, 9);
      const response = await window.electron.ipcRenderer.invoke('launch-puppeteer', botId) as PuppeteerResponse;
      
      if (response.success) {
        addWindow(botName);
      } else {
        console.error('Failed to launch Puppeteer:', response.error);
      }
    } catch (error) {
      console.error('Failed to launch Puppeteer:', error);
    }
  };

  const handleClose = async (botId: string): Promise<void> => {
    try {
      const response = await window.electron.ipcRenderer.invoke('close-bot-window', botId) as PuppeteerResponse;
      if (response.success) {
        removeWindow(botId);
      } else {
        console.error('Failed to close window:', response.error);
      }
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  const handleExecuteCommand = async (botId: string, command: string): Promise<void> => {
    try {
      const response = await window.electron.ipcRenderer.invoke('execute-command', botId, command) as PuppeteerResponse;
      if (!response.success) {
        console.error('Failed to execute command:', response.error);
      }
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Bot Control Panel</h2>
      <button
        onClick={handleLaunch}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Launch New Bot
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {windows.map((window) => (
          <div key={window.id} className="border rounded-lg p-4 bg-base-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{window.name}</h3>
              <button
                onClick={() => handleClose(window.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleExecuteCommand(window.id, 'alert("Hello from bot!")')}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded w-full"
              >
                Show Alert
              </button>
              <button
                onClick={() => handleExecuteCommand(window.id, 'console.log("Hello from bot!")')}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded w-full"
              >
                Console Log
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bot; 