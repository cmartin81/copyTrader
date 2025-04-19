import { AbstractTargetAccount, type Account as AbstractAccount } from './abstractTargetAccount'
import { app } from 'electron'
import pie from 'puppeteer-in-electron'
import { Browser } from 'puppeteer-core'
import _ from 'lodash'
import { Symbol } from './abstractTargetAccount'
import { v4 as uuidv4 } from 'uuid'
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

interface Order {
  ok: boolean
  errorMessage: null | string
}

interface RestResponse {
  ok: boolean
  errorMessage: null | string
  data?: any
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

  async placeOrder(
    accountId: string,
    targetSymbolId: string,
    amountOfContracts: number
  ): Promise<boolean> {
    this.queue.add(async () => {
      const startTime = Date.now()
      // this.log(`${type} ${amountOfContracts} ${contract!.split('.')[2]} @MARKET`, 'info', logMeta)

      try {
        const orderResponse: any = await this.placeOrderRestCall(
          accountId,
          targetSymbolId,
          amountOfContracts
        )

        if (orderResponse.errorMessage) {
          console.error(orderResponse.errorMessage)
          console.log('ERROR: Could not place order')
          // this.log(
          //   `${botsetting.name}: Did not buy! Pausing bot and close position (${orderResponse.errorMessage})`,
          //   'error',
          //   logMeta,
          // )
          // await this.closePosition(account, contract)
          // await turnOffBot(botsetting.id)
          return false
        }
        const endTime = Date.now()
        const totalMs = endTime - startTime
        // this.log(`Placed ${amountOfContracts} (${totalMs}ms)`, 'success', logMeta)
        console.log(`Placed ${amountOfContracts} (${totalMs}ms)`, 'success')
        return true
      } catch (_e) {
        return false
      }
    })
    return true
  }

  async doRestCall(url, method, body = null): Promise<RestResponse> {
    const page = this.page!
    try {
      const response = await page.evaluate(
        async (url, method, body) => {
          const token = localStorage.getItem('token')
          if (!token) throw new Error('Token not found in localStorage')

          const payload: any = {
            method: method,
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
          if (body) {
            payload.body = JSON.stringify(body)
          }

          const res = await fetch(url, payload)
          if (!res.ok) {
            return {
              ok: false,
              errorMessage: 'Something went wrong with the request.'
            }
          }

          const jsonRes: any = await res.json()
          return {
            ok: true,
            data: jsonRes,
            errorMessage: null
          }
        },
        url,
        method,
        body
      )

      return response as Order
    } catch (e: any) {
      return { ok: false, errorMessage: e.message }
    }
  }

  private async placeOrderRestCall(accountId, tickerId, position: number): Promise<Order> {
    const url = this.config.apiUrl + '/Order'
    const body: any = {
      accountId: accountId,
      symbolId: tickerId,
      type: 2, // 2 limit order
      limitPrice: null,
      stopPrice: null,
      positionSize: position,
      customTag: uuidv4()
    }
    const response = await this.doRestCall(url, 'POST', body)

    return response as Order
  }

  async getPlatformSymbols(): Promise<[Symbol]> {
    const page = this.page!

    const response = await page.evaluate(async (apiUrl) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Could not fetch symbols (Error: #Symbol_1)')

      const res = await fetch(apiUrl + '/Metadata', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) throw new Error('Could not fetch symbols (Error: #Symbol_2)')
      return await res.json()
    }, this.config.apiUrl)

    const symbols = _.chain(response)
      .map((res) => ({ id: res.symbol, name: res.exchange.substring(1) + ' - ' + res.fullName }))
      .sortBy('name')
      .value()

    return symbols as [Symbol]
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
