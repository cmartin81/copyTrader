import { BrowserWindow } from 'electron'
import { Browser, Page } from 'puppeteer-core'

// @ts-ignore: ...
// import { default as PQueue } from "p-queue";

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
      width: 1200,
      height: 800,
      // show: false,
      webPreferences: {backgroundThrottling: false}})
    this.exchangeName = exchangeName
   // AppState.setExchangeBrowser(exchangeName, this)
    this.storeName = storeName
    this.appStoreName = appStoreName
    this.exchangeUrl = exchangeUrl
  }


  abstract start()
  // abstract getAccounts()
  // abstract getSymbolMappings()
  // abstract setSymbolMapping(sourceSymbol:string, targetSymbol:string)
  // abstract addSymbol(newSymbol:string)
  // abstract placeOrder(targetSymbol:string, amount:number)
  // abstract stop()
}
