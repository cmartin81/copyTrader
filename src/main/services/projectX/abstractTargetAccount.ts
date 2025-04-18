import { Browser } from 'puppeteer-core'
import { BrowserWindow } from 'electron'
import { Page } from 'puppeteer-core'
import { AppState } from '../../../shared/types'
import { broadcastState } from '../../utils/broadcastState'

// @ts-ignore: ...
// import { default as PQueue } from "p-queue";

export interface Account {
  id: string;
  name: string;
  alias: string | null;
}

export abstract class AbstractTargetAccount {
  browser: Browser
  puppeteerBrowser: BrowserWindow
  page?: Page
 // queue = new PQueue({ concurrency: 1 });
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


  abstract start()
  abstract getAccounts(): Promise<[Account]>
  // abstract getSymbolMappings()
  // abstract setSymbolMapping(sourceSymbol:string, targetSymbol:string)
  // abstract addSymbol(newSymbol:string)
  // abstract placeOrder(targetSymbol:string, amount:number)
  // abstract stop()

  async closeBrowser() {
    try {
      this.puppeteerBrowser?.close()
    } catch (e) {
      console.log(e)
    }
    
    try {
      broadcastState()
    } catch (e) {
      console.error('Error broadcasting state:', e)
    }
  }
}
