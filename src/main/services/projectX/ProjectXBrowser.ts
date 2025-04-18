import { Browser } from 'puppeteer-core'
import { AbstractTargetAccount, Account } from './abstractTargetAccount'
import { safeStorage, app } from 'electron'
import pie from 'puppeteer-in-electron'
import * as puppeteer from 'puppeteer-core'
import _ from 'lodash'
import { ipcMain } from 'electron'

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
  }

  private async decryptPassword(encryptedPassword: string): Promise<string> {
    try {
      const response = await ipcMain.invoke('decrypt-password', encryptedPassword)
      if (response.success) {
        return response.data
      }
      throw new Error(response.error || 'Failed to decrypt password')
    } catch (error) {
      console.error('Error decrypting password:', error)
      throw new Error('Failed to decrypt password')
    }
  }

  async start(): Promise<void> {
    await this.openBrowser()
    if (this.username && this.password) {
      console.log('login...')
      /*        await this.page!.waitForNavigation()
        await waitMs(300)
        await this.login(this.username, this.password)
  */
    }
  }

  async openBrowser(): Promise<void> {
    if (!this.puppeteerBrowser) {
      throw new Error('Puppeteer browser not initialized')
    }
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

  async getAccounts(): Promise<[Account]> {
    if (!this.page) {
      throw new Error('Page not initialized')
    }
    const response = await this.page.evaluate(async (apiUrl) => {
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
      id: res.accountId,
      name: res.accountName,
      alias: res.nickname
    }))
    return accounts as [Account]
  }

  /*
    placeOrder(targetSymbol: string, amount: number) {
        throw new Error("Method not implemented.");
    }
    stop() {
        throw new Error("Method not implemented.");
    }*/
}
