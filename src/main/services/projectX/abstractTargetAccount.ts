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
  abstract stop(): Promise<void>

  async closeBrowser() {
    console.log(`[${this.exchangeName}] Closing browser window... (Window ID: ${this.puppeteerBrowser?.id})`)
    try {
      // Close the page if it exists
      if (this.page) {
        console.log(`[${this.exchangeName}] Closing page... (Window ID: ${this.puppeteerBrowser?.id})`)
        await this.page.close().catch(e => console.log(`[${this.exchangeName}] Error closing page:`, e))
        this.page = undefined
        console.log(`[${this.exchangeName}] Page closed (Window ID: ${this.puppeteerBrowser?.id})`)
      } else {
        console.log(`[${this.exchangeName}] No page to close (Window ID: ${this.puppeteerBrowser?.id})`)
      }

      // Close the browser window
      if (this.puppeteerBrowser) {
        console.log(`[${this.exchangeName}] Destroying browser window... (Window ID: ${this.puppeteerBrowser.id})`)
        // Force close to ensure the window is closed immediately
        this.puppeteerBrowser.destroy()
        console.log(`[${this.exchangeName}] Browser window destroyed (Window ID: ${this.puppeteerBrowser.id})`)
      } else {
        console.log(`[${this.exchangeName}] No browser window to destroy`)
      }

      // Disconnect from Puppeteer
      if (this.browser) {
        console.log(`[${this.exchangeName}] Disconnecting from Puppeteer...`)
        await this.browser.disconnect().catch(e => console.log(`[${this.exchangeName}] Error disconnecting browser:`, e))
        console.log(`[${this.exchangeName}] Disconnected from Puppeteer`)
      } else {
        console.log(`[${this.exchangeName}] No Puppeteer browser to disconnect`)
      }

      // Notify the main window that the bot is no longer running
      const mainWindow = BrowserWindow.getAllWindows()[0]
      if (mainWindow) {
        console.log(`[${this.exchangeName}] Notifying main window...`)
        mainWindow.webContents.send(this.storeName, {
          method: 'setIsBotRunning',
          parameters: [false],
        })
        console.log(`[${this.exchangeName}] Main window notified`)
      } else {
        console.log(`[${this.exchangeName}] No main window to notify`)
      }

      console.log(`[${this.exchangeName}] Browser window closed successfully`)
    } catch (e) {
      console.error(`[${this.exchangeName}] Error in closeBrowser:`, e)
    }
  }
}
