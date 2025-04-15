import { AbstractTargetAccount } from "./abstractTargetAccount";
import { app } from 'electron'
import pie from 'puppeteer-in-electron'
import { Browser } from 'puppeteer-core'

const puppeteer = require('puppeteer-core')

export const PropFirmConfig = {
  TopstepX: {
    url: 'https://topstepx.com',
    apiUrl: 'https://userapi.topstepx.com',
  },
  TheFuturesDesk: {
    url: 'https://thefuturesdesk.projectx.com',
    apiUrl: 'https://userapi.thefuturesdesk.projectx.com',
  },
  TickTickTrader: {
    url: 'https://tickticktrader.projectx.com',
    apiUrl: 'https://userapi.tickticktrader.projectx.com',
  },
  Bulenox: {
    url: 'https://bulenox.projectx.com',
    apiUrl: 'https://userapi.bulenox.projectx.com',
  }
} as const;
type PropFirm = keyof typeof PropFirmConfig;
interface PropConfig {
  url: string,
  apiUrl: string
}

export class ProjectXBrowser extends AbstractTargetAccount {

  username: string|null
  password: string|null
  config: PropConfig
  constructor(browser: Browser, propfirm: PropFirm, username: string | null, password: string | null) {
    super(browser, propfirm,
      "config.exchanges[propfirm].storeName",
      "config.exchanges[propfirm].appStoreName",
      PropFirmConfig[propfirm].url,
    )
    this.config = PropFirmConfig[propfirm] as PropConfig;

    this.username = username
    this.password = password
    this.config = PropFirmConfig[propfirm]

//    this.apiUrl =  config.exchanges[this.exchangeName].apiUrl

  }

  async start(): Promise<void> {
      await this.openBrowser()
      if (this.username && this.password) {
        console.log('login...')
/*        await this.page!.waitForNavigation()
        await waitMs(300)
        await this.login(this.username, this.password)
  */    }
    }

  async openBrowser():Promise<void> {
    await this.puppeteerBrowser.loadURL(this.exchangeUrl)
    this.page = await pie.getPage(this.browser, this.puppeteerBrowser)
    const originalUserAgent = await this.page.browser().userAgent();
    let customUserAgent = originalUserAgent.replace(/Electron\/[\d.]+ /, '');
    customUserAgent = customUserAgent.replace(/GOATAutoPilot\/[\d.]+ /, '');
    await this.page.setUserAgent(customUserAgent);

    // this is a fix for not freezing when out of focus
    const session = await this.page.createCDPSession();
    await session.send(`Emulation.setFocusEmulationEnabled`, { enabled: true });

    //await this.scheduleTasks()

    //this.addCloseListener()

    // this.puppeteerBrowser.webContents.openDevTools();
  }

  static async create(
    propFirm: PropFirm,
    username: string | null = null,
    password: string | null = null,
  ): Promise<ProjectXBrowser> {

    const browser = await pie.connect(app, puppeteer)
    return new ProjectXBrowser(browser, propFirm, username, password)
  }

  /*  getAccounts(): void {
        throw new Error("Method not implemented.");
    }
    placeOrder(targetSymbol: string, amount: number) {
        throw new Error("Method not implemented.");
    }
    stop() {
        throw new Error("Method not implemented.");
    }*/

}
