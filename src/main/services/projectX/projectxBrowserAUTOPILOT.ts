import pie from 'puppeteer-in-electron'
import { turnOffBot, waitMs } from '../../utils'
import * as _ from 'lodash'
import { config } from '../../config'
import { ExchangeBrowser } from '../exchangeBrowser'
import { v4 as uuidv4 } from "uuid";
import { BotSetting } from "../../rest/tvHandler";
const puppeteer = require('puppeteer-core')

declare global {
  interface Window {
    sendToMain: ({ method, parameters }) => void
  }
}

interface Account {
  id: string;
  name: string;
  alias: string | null;
}

interface Ticker {
  id: string
  name: string
  short: string
}

interface Order {
  "ok": boolean;
  "errorMessage":null | string
}

interface RestResponse {
  ok: boolean;
  errorMessage:null | string,
  data?: any;
}
interface GetAccountInfoResponse {
  userName: string;
  email: string;
  userId: number;
  firstName: string;
  lastName: string;
  hasSignedAgreements: boolean;
}

interface GetActiveOrdersResponse {
  id: string;
  symbolId:string;
  symbolName: string;
  positionSize: number;
  stopLoss: null | number;
  takeProfit: null | number;
  toMake: null | number;
  risk: null | number;
  averagePrice: number;
  profitAndLoss: number;
  entryTime: string;
  accountId: number;
  stopLossOrderId: null;
  takeProfitOrderId: null;
  contractId: string;
}

export enum PropFirm {
  'topstepx' = 'topstepx',
  'theFuturesDesk' = 'theFuturesDesk',
  'tickTickTrader' = 'tickTickTrader',
  'bulenox' = 'bulenox',
}

export class ProjectXBrowser extends ExchangeBrowser {
  private username: string | null
  private password: string | null
  private apiUrl: string | null
  private exchangeUserId : number | null = null
  constructor(browser: any, propfirm: PropFirm, username: string | null, password: string | null) {
    super(
      browser,
      propfirm,
      config.exchanges[propfirm].storeName,
      config.exchanges[propfirm].appStoreName,
      config.exchanges[propfirm].url,
    )
    this.username = username
    this.password = password
    this.apiUrl =  config.exchanges[this.exchangeName].apiUrl

  }

  static async create(
    app: any,
    propFirm: PropFirm,
    username: string | null = null,
    password: string | null = null,
  ): Promise<ProjectXBrowser> {
    const browser = await pie.connect(app, puppeteer)
    return new ProjectXBrowser(browser, propFirm, username, password)
  }


  async extractAccountInfo(): Promise<[Account]>{
    const page = this.page!
    const response = await page.evaluate(async (apiUrl) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found in localStorage');

      const res = await fetch(apiUrl + '/TradingAccount', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    }, this.apiUrl);

    const accounts = _.map(response, (res) => ({id: res.accountId, name: res.accountName, alias: res.nickname}))
    return accounts as [Account];
  }

  async getContractNames(): Promise<[Ticker]> {
    const page = this.page!

    const response = await page.evaluate(async (apiUrl) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token not found in localStorage')

      const res = await fetch(apiUrl + '/Metadata', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error('Network response was not ok')
      return await res.json()
    }, this.apiUrl)

    const tickers = _.chain(response)
      .map((res) => ({ id: res.symbol, name: res.exchange.substring(1) + ' - ' + res.fullName }))
      .sortBy('name')
      .value()

    return tickers as [Ticker]
  }

  async doRestCall(url, method, body= null): Promise<RestResponse>{
    const page = this.page!
    try{
      const response = await page.evaluate(async (url, method, body) => {

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found in localStorage');

        const payload:any = {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
        if (body) {
          payload.body = JSON.stringify(body)
        }

        const res = await fetch(url, payload);
        if (!res.ok) {
          return {
            ok: false,
            errorMessage: 'Something went wrong with the request.',
          }
        };

        const jsonRes :any= await res.json();
        return {
          ok: true,
          data: jsonRes,
          errorMessage: null,
        }
      }, url, method, body);

      return response as Order;
    } catch (e:any) {
      return { ok: false, errorMessage: e.message };
    }
  }


  async placeOrder(accountId, tickerId, position: number): Promise<Order>{
    const url = this.apiUrl + '/Order';
    const body:any = {
      "accountId": accountId,
      "symbolId": tickerId,
      "type":2, // 2 limit order
      "limitPrice": null,
      "stopPrice": null,
      "positionSize": position,
      "customTag": uuidv4()
    }
    const response = await this.doRestCall(url, 'POST', body)

    return response as Order;
  }

  async closePosition(accountId, tickerId){
    const url = this.apiUrl + `/Position/close/${accountId}/symbol/${tickerId}`;
    const response = await this.doRestCall(url, 'DELETE')
    return response.ok
  }

  async getAccountInfo():Promise <GetAccountInfoResponse> {
    const url = 'https://userapi.topstepx.com/User';
    const response = await this.doRestCall(url, 'GET', null)
    return response.data as GetAccountInfoResponse
  }

  async getActiveOrders(userId): Promise<GetActiveOrdersResponse[]> {
    const url = `https://userapi.topstepx.com/Position/all/user/${userId}`;
    const response = await this.doRestCall(url, 'GET', null)
    console.log(response);
    return response.data
  }

  async setTpAndSlOnActiveTicker(symbolId, tpInDollar, riskInDollar){
    if (!this.exchangeUserId) {
      const accountInfo = await this.getAccountInfo()
      this.exchangeUserId = accountInfo.userId
    }
    const activeOrders = await this.getActiveOrders(this.exchangeUserId)
    const activeOrder = activeOrders.find((order) => order.symbolId === symbolId)

    const positionId = activeOrder?.id

    if (positionId) {
      const url = `https://userapi.topstepx.com/Position/riskToMake?PositionId=${positionId}&Risk=${riskInDollar}&ToMake=${tpInDollar}`;
      const response = await this.doRestCall(url, 'PUT', null)
      if (response.ok) {
        return true
      }
    }
    return true
  }

  doHotkeyCheck() {
    return false
  }

  async checkIfHotkeyEnabled() {
    return true
  }

  private async login(username: string, password: string) {
    const checkUrlWithRetries = async (retries: number, delay: number): Promise<boolean> => {
      for (let i = 0; i < retries; i++) {
        const currentUrl = page.url()
        if (currentUrl.includes('login')) {
          return true
        }
        await waitMs(delay)
      }
      return false
    }
    const page = this.page!

    const isLoginPage = await checkUrlWithRetries(5, 200)
    if (!isLoginPage) {
      return
    }

    const usernameSelector = '[name="userName"]'
    const passwordSelector = '[name="password"]'
    await page.waitForSelector(usernameSelector)
    await page.type(usernameSelector, username, { delay: 50 })
    await page.waitForSelector(passwordSelector)
    await page.type(passwordSelector, password, { delay: 50 })

    const buttons = await page.$$('form button') // Get all buttons inside forms
    await buttons[buttons.length - 1].click()
  }

  async openBrowser() {
    await super.openBrowser()
    if (this.username && this.password) {
      await this.page!.waitForNavigation()
      await waitMs(300)
      await this.login(this.username, this.password)
    }
  }

  async buyMarketOrder(botsetting, amountOfContracts: number): Promise<boolean> {
    await this.buyOrSellMarketOrder(botsetting, amountOfContracts, 'BUY')
    return true
  }

  async sellMarketOrder(botsetting, amountOfContracts: number): Promise<boolean> {
    await this.buyOrSellMarketOrder(botsetting, amountOfContracts * -1, 'SELL')
    return true
  }

  async buyOrSellMarketOrder(
    botsetting: BotSetting,
    amountOfContracts: number,
    type: 'SELL' | 'BUY',
  ): Promise<boolean> {
    const contract = botsetting.contract
    const account = botsetting.account
    const logMeta = { name: botsetting.name }

    this.queue.add(async () => {
      const startTime = Date.now();
      this.log(`${type} ${amountOfContracts} ${contract!.split('.')[2]} @MARKET`, 'info', logMeta)

      try {
        const orderResponse = await this.placeOrder(account, contract, amountOfContracts)

        if (orderResponse.errorMessage) {
          this.log(
            `${botsetting.name}: Did not buy! Pausing bot and close position (${orderResponse.errorMessage})`,
            'error',
            logMeta,
          )
          await this.closePosition(account, contract)
          await turnOffBot(botsetting.id)
          return false
        }
        const endTime = Date.now();
        const totalMs = endTime - startTime;
        this.log(`Placed ${amountOfContracts} (${totalMs}ms)`, 'success', logMeta)
        if (botsetting.type === 'indicator') {
          const sl = botsetting.stopLossInUsd ?? null
          const tp = botsetting.takeProfitInUsd ?? null

          setTimeout(() => {
            this.setTpAndSlOnActiveTicker(botsetting.contract, tp, sl).then(() => {
              this.log(`Added TP@${tp}$ an SL@${sl}$ on order`, 'success', logMeta)
            })
          }, 1)
        }
        return true
      } catch (e) {
        return false
      }
    })
    return true
  }

  async prepareBrowser() {

  }
}
