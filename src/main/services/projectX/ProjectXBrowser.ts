import { AbstractTargetAccount, type Account as AbstractAccount } from './abstractTargetAccount'
import { app, safeStorage } from 'electron'
import pie from 'puppeteer-in-electron'
import { Browser } from 'puppeteer-core'
import _ from 'lodash'
import { waitMs } from '../../utils'
const puppeteer = require('puppeteer-core')

export const PropFirmConfig = {
  TopstepX: {
    url: 'https://topstepx.com',
    apiUrl: 'https://userapi.topstepx.com'
  },
  TheFuturesDesk: {
    url: 'https://thefuturesdesk.projectx.com',
    apiUrl: 'https://userapi.thefuturesdesk.projectx.com'
  },
  TickTickTrader: {
    url: 'https://tickticktrader.projectx.com',
    apiUrl: 'https://userapi.tickticktrader.projectx.com'
  },
  Bulenox: {
    url: 'https://bulenox.projectx.com',
    apiUrl: 'https://userapi.bulenox.projectx.com'
  }
} as const
export type PropFirm = keyof typeof PropFirmConfig

interface PropConfig {
  url: string
  apiUrl: string
}

interface Account {
  id: string
  name: string
  alias: string | null
}

export class ProjectXBrowser extends AbstractTargetAccount {
  username: string | null
  password: string | null
  config: PropConfig
  constructor(
    browser: Browser,
    propfirm: PropFirm,
    username: string | null,
    password: string | null
  ) {
    super(
      browser,
      propfirm,
      'config.exchanges[propfirm].storeName',
      'config.exchanges[propfirm].appStoreName',
      PropFirmConfig[propfirm].url
    )
    this.config = PropFirmConfig[propfirm] as PropConfig

    this.username = username
    this.password = password
    this.config = PropFirmConfig[propfirm]

    //    this.apiUrl =  config.exchanges[this.exchangeName].apiUrl
  }

  // private decryptPassword(encryptedPassword: string): string {
  //   const retrievedEncryptedBuffer = Buffer.from(encryptedPassword, 'base64')
  //   return safeStorage.decryptString(retrievedEncryptedBuffer)
  // }

  async isLoginPageDisplayed(): Promise<boolean> {
    const page = this.page!
    try {
      // Use Promise.race to wait for either condition
      const result = await Promise.race([
        // Wait for login page URL or login form elements
        page
          .waitForSelector('[name="userName"]', { timeout: 10000 })
          .then(() => true)
          .catch(() => false),
        // Wait for Trading element (logged in)
        page
          .waitForSelector('[aria-label="Trading"]', { timeout: 10000 })
          .then(() => false)
          .catch(() => true)
      ])

      return result
    } catch (error) {
      console.error('Error checking login page status:', error)
      return true // Default to login page if there's an error
    }
  }

  async start(): Promise<boolean> {
    await this.openBrowser()
    const isLoginPageDisplayed = await this.isLoginPageDisplayed()
    if (isLoginPageDisplayed && this.username && this.password) {
      const loginSuccesfully = await this.login(this.username, this.password)
      return loginSuccesfully
    }
    return true
  }

  private async login(username: string, password: string) {
    const page = this.page!

    const usernameSelector = '[name="userName"]'
    const passwordSelector = '[name="password"]'
    await page.waitForSelector(usernameSelector)
    await page.type(usernameSelector, username, { delay: 50 })
    await page.waitForSelector(passwordSelector)
    await page.type(passwordSelector, password, { delay: 50 })

    const buttons = await page.$$('form button') // Get all buttons inside forms
    await buttons[buttons.length - 1].click()

    try {
      await page.waitForSelector('[aria-label="Trading"]', { timeout: 10000 })
      return true
    } catch (_error) {
      return false
    }
  }

  async openBrowser(): Promise<void> {
    await this.puppeteerBrowser.loadURL(this.exchangeUrl)
    console.log('openBrowser')
    this.page = await pie.getPage(this.browser, this.puppeteerBrowser)
    const originalUserAgent = await this.page.browser().userAgent()
    let customUserAgent = originalUserAgent.replace(/Electron\/[\d.]+ /, '')
    customUserAgent = customUserAgent.replace(/GOATAutoPilot\/[\d.]+ /, '')
    await this.page.setUserAgent(customUserAgent)

    // this is a fix for not freezing when out of focus
    const session = await this.page.createCDPSession()
    await session.send(`Emulation.setFocusEmulationEnabled`, { enabled: true })

    //await this.scheduleTasks()

    //this.addCloseListener()

    // this.puppeteerBrowser.webContents.openDevTools();
  }

  static async create(
    propFirm: PropFirm,
    username: string | null = null,
    password: string | null = null
  ): Promise<ProjectXBrowser> {
    const browser = await pie.connect(app, puppeteer)
    return new ProjectXBrowser(browser, propFirm, username, password)
  }

  async getAccounts(): Promise<[AbstractAccount]> {
    const page = this.page!
    const response = await page.evaluate(async (apiUrl) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token not found in localStorage')

      const res = await fetch(apiUrl + '/TradingAccount', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) throw new Error('Network response was not ok')
      return await res.json()
    }, this.config.apiUrl)

    const accounts = _.map(response, (res) => ({
      id: String(res.accountId),
      name: res.accountName,
      alias: res.nickname
    }))
    return accounts as [AbstractAccount]
  }

  /*
    placeOrder(targetSymbol: string, amount: number) {
        throw new Error("Method not implemented.");
    }
    stop() {
        throw new Error("Method not implemented.");
    }*/
}
