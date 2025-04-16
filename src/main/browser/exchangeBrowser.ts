import pie from 'puppeteer-in-electron'
import { BrowserWindow } from 'electron'
import { Page } from 'puppeteer-core'
//import { AppState } from '../appState'
import { waitMs } from '../utils'
import * as _ from 'lodash'
import { default as PQueue } from "p-queue";
const cron = require('node-cron')

declare global {
  interface Window {
    sendToMain: ({ method, parameters }) => void
  }
}

export interface MarketOrderResponse {
  success: boolean;
  reason?: string;
}

export abstract class ExchangeBrowser {
  browser: any
  puppeteerBrowser: BrowserWindow
  page?: Page
  queue = new PQueue({ concurrency: 1 });
  storeName: string
  appStoreName: string
  exchangeUrl: string
  exchangeName: string

  constructor(browser: any, exchangeName, storeName, appStoreName, exchangeUrl) {
    this.browser = browser
    this.puppeteerBrowser = new BrowserWindow({
      width: 1200,
      height: 800,
      // show: false,
      webPreferences: {backgroundThrottling: false}})
    this.exchangeName = exchangeName
    AppState.setExchangeBrowser(exchangeName, this)
    this.storeName = storeName
    this.appStoreName = appStoreName
    this.exchangeUrl = exchangeUrl
  }

  async closeBrowser() {
    try {
      this.puppeteerBrowser?.close()
    } catch (e) {
      console.log(e)
    }
    const mainWindow = AppState.getMainWindow()

    mainWindow!.webContents.send(this.storeName, {
      method: 'setIsBotRunning',
      parameters: [false],
    })


  }
  async openBrowser() {
    await this.puppeteerBrowser.loadURL(this.exchangeUrl)
    this.page = await pie.getPage(this.browser, this.puppeteerBrowser)
    const originalUserAgent = await this.page.browser().userAgent();
    let customUserAgent = originalUserAgent.replace(/Electron\/[\d.]+ /, '');
    customUserAgent = customUserAgent.replace(/GOATAutoPilot\/[\d.]+ /, '');
    await this.page.setUserAgent(customUserAgent);

    // this is a fix for not freezing when out of focus
    const session = await this.page.createCDPSession();
    await session.send(`Emulation.setFocusEmulationEnabled`, { enabled: true });
    await this.scheduleTasks()

    this.addCloseListener()

    // this.puppeteerBrowser.webContents.openDevTools();
  }

  private addCloseListener() {
    const mainWindow = AppState.getMainWindow()
    this.puppeteerBrowser.on('closed', async () => {
      mainWindow!.webContents.send(this.storeName, {
        method: 'setIsBotRunning',
        parameters: [false],
      })
    })
  }

  private async scheduleTasks(){
    const mainWindow = AppState.getMainWindow()
    this.scheduleKeepalive()
    this.scheduleCheckHotkeyEnabled()
    this.scheduleExtractAccountInfo((accountInfo) => {
      mainWindow!.webContents.send(this.appStoreName, {
        method: 'setExchangeAccounts',
        parameters: [accountInfo],
      })
    })
    this.scheduleExtractContractNames((contractNames) => {
      mainWindow!.webContents.send(this.appStoreName, {
        method: 'setExchangeContracts',
        parameters: [contractNames],
      })
    })
  }

  scheduleCheckHotkeyEnabled() {
    if (this.doHotkeyCheck()) {
      setTimeout(() => {
        this.queue.add(async () => {
          await waitMs(1000)
          const hotkeysEnbled = await this.checkIfHotkeyEnabled()
          const logLine = hotkeysEnbled ? "Hotkeys are enabled" : "Hotkeys are disabled"
          this.log(logLine, hotkeysEnbled ? 'info' : 'error')
        })
      }, 10 * 1000)
    }
  }

  scheduleKeepalive(cronString = '30 17,47 * * * *') {
    cron.schedule(cronString, () => {
      this.queue.add(async () => {
        if (this.page) {
          try{
            await this.extractAccountInfo()
            await waitMs(200)
          } catch (e) {}
        }
      })
    })
  }

  async pressHotkey(combo: any) {
    await this!.page!.keyboard.down(combo[0])
    await this!.page!.keyboard.press(combo[1])
    await this!.page!.keyboard.up(combo[0])
    await waitMs(100)
  }

  log(message: string, type: string = 'info', meta?: any) {
    const logLine = [message]
    AppState.getMainWindow()!.webContents.send(this.storeName, {
      method: "addLog",
      parameters: [logLine, type, meta],
    });
  }

  createResponse(reasonOfFailure?: string): MarketOrderResponse {
    if (reasonOfFailure) {
      return {
        success: false,
        reason: reasonOfFailure,
      };
    }
    return {
      success: true,
    };
  }

  abstract getContractNames(): Promise<any>
  abstract extractAccountInfo(): Promise<any>
  abstract checkIfHotkeyEnabled(): Promise<any>
  abstract doHotkeyCheck(): Boolean
  abstract prepareBrowser(): Promise<any>
  abstract sellMarketOrder(botsetting, amountOfContracts: number): Promise<boolean>
  abstract buyMarketOrder(botsetting, amountOfContracts: number): Promise<boolean>

  scheduleExtractContractNames(callback: (contractNames) => void) {
    this.queue.add(async () => {
      await waitMs(1000)
      const contractNames = await this.getContractNames()
      callback(contractNames)
    })
  }

  scheduleExtractAccountInfo(callback: (accountInfo) => void) {
    this.queue.add(async () => {
      await waitMs(1000)
      const accountInfo = await this.extractAccountInfo()
      callback(accountInfo)
    })
  }

}
