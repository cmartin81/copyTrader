/*import { logToExchange } from "./log";
import { AppState } from "./appState";
import { getTopstepBotSettings } from "./stores/topstepxApp.store";
import { getTheFuturesDeskAppStoreBotSettings } from "./stores/theFuturesDeskApp.store";
import { getTickTickTraderAppStoreBotSettings } from "./stores/tickTickTraderApp.store";
import { getBulenoxAppStoreBotSettings } from "./stores/bulenoxApp.store";
import { getTradovateAppStoreBotSettings } from "./stores/tradovateApp.store";
import { getNinjaTraderAppStoreBotSettings } from "./stores/ninjaTraderApp.store";
import { getCryptoFundTraderAppStoreBotSettings } from "./stores/cryptoFundTraderApp.store";
import { config } from "./config";
import { safeStorage } from "electron";
import { BotSetting } from "./rest/tvHandler";*/

export function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/*export async function retry(
  taskName: string,
  task: () => Promise<boolean>,
  times: number,
  exchange:string,
  delayMs: number = 100,
): Promise<boolean> {
  for (let i = 0; i < times; i++) {
    try {
      const result = await task()
      if (result) {
        return result
      }
    } catch (error) {}

    logToExchange(exchange, `Task "${taskName}" failed. Retry in ${delayMs}ms:`, 'error')
    if (i !== times) {
      await waitMs(delayMs)
    }
  }
  return false
}

export function getAllBotSettings(): {[key:string]: BotSetting[]}{
  return {
    topstepx: getTopstepBotSettings(),
    theFuturesDesk: getTheFuturesDeskAppStoreBotSettings(),
    tickTickTrader: getTickTickTraderAppStoreBotSettings(),
    bulenox :getBulenoxAppStoreBotSettings(),
    tradovate: getTradovateAppStoreBotSettings(),
    ninjaTrader: getNinjaTraderAppStoreBotSettings(),
    cryptoFundTrader: getCryptoFundTraderAppStoreBotSettings(),}
}

export async function turnOffBot(id:string){
  const allBotSettings = getAllBotSettings()
  for (const [exchange, exchangeBotsettings] of Object.entries(allBotSettings)) {

    const botsetting = exchangeBotsettings.find((setting) => setting.id === id)
    if (botsetting) {
      botsetting.enabled = false;
      botsetting.errorMessage = "The bot failed to execute the last buy/sell order due to an unknown error. It has been turned off, positions are flattened. Please check the logs for more details."

      AppState.getMainWindow()!.webContents.send(config.exchanges[exchange].appStoreName, {
        method: "setBotSettings",
        parameters: [id, botsetting],
      })
      return
    }
  }
}

export function encrypt(sensitiveString: string) {
  const encryptedBuffer = safeStorage.encryptString(sensitiveString);
  return encryptedBuffer.toString('base64');
}

export function decrypt(encryptedString: string) {
  const retrievedEncryptedBuffer = Buffer.from(encryptedString, 'base64');
  return safeStorage.decryptString(retrievedEncryptedBuffer);
}
*/
