import { Browser } from 'puppeteer-core'
import { BrowserWindow } from 'electron'
import { Page } from 'puppeteer-core'
// @ts-ignore: ...
import { default as PQueue } from "p-queue";

export interface Account {
  id: string;
  name: string;
  alias: string | null;
}

export interface Symbol {
  id: string
  name: string
}

export abstract class AbstractTargetAccount {
  browser: Browser
  puppeteerBrowser: BrowserWindow
  page?: Page
  queue = new PQueue({ concurrency: 1 });
  storeName: string
  appStoreName: string
  exchangeUrl: string
  exchangeName: string


  constructor(browser: Browser, exchangeName, storeName, appStoreName, exchangeUrl) {
    this.browser = browser
    this.puppeteerBrowser = new BrowserWindow({
      width: 800,
      height: 600,
      // show: false,
      webPreferences: {backgroundThrottling: false}})
    this.exchangeName = exchangeName
   // AppState.setExchangeBrowser(exchangeName, this)
    this.storeName = storeName
    this.appStoreName = appStoreName
    this.exchangeUrl = exchangeUrl
  }


  abstract start(): Promise<boolean>
  abstract getAccounts(): Promise<[Account]>
  abstract getPlatformSymbols(): Promise<[Symbol]>
  abstract placeOrder(accountId: string, targetSymbolId:string, amount:number): Promise<boolean>
  // abstract stop()

  async closeBrowser() {
    try {
      // Close the page if it exists
      if (this.page) {
        await this.page.close().catch(e => console.log('Error closing page:', e))
        this.page = undefined
      }

      // Close the browser window
      if (this.puppeteerBrowser) {
        this.puppeteerBrowser.close()
      }

      // Disconnect from Puppeteer
      if (this.browser) {
        await this.browser.disconnect().catch(e => console.log('Error disconnecting browser:', e))
      }

      // Notify the main window that the bot is no longer running
      const mainWindow = BrowserWindow.getAllWindows()[0]
      if (mainWindow) {
        mainWindow.webContents.send(this.storeName, {
          method: 'setIsBotRunning',
          parameters: [false],
        })
      }
    } catch (e) {
      console.error('Error in closeBrowser:', e)
    }
  }
}
