import { getAppState } from '../../store'
import _ from 'lodash'
import { ProjectXBrowser } from '../projectX/ProjectXBrowser'
import { AbstractTargetAccount } from '../projectX/abstractTargetAccount'
import { ipcMain } from 'electron'

class BotManager {
  private static instance: BotManager | null = null
  private botSettings: any
  private currentBotId: string | null = null
  private targets:{[key:string]:AbstractTargetAccount} = {}

  private constructor() {
    // Private constructor to prevent direct instantiation
    this.setupAppStateListener()
  }

  private setupAppStateListener(): void {
    // Listen for store-send events
    ipcMain.on('store-send', (_event, { action, key, value }) => {
      if (action === 'set' && key === 'appState' && this.currentBotId) {
        this.botSettings = _.find(value.bots, { id: this.currentBotId })
      }
    })

    // Also listen for set-bots events
    ipcMain.on('set-bots', (_event, bots) => {
      if (this.currentBotId) {
        this.botSettings = _.find(bots, { id: this.currentBotId })
      }
    })
  }

  public static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager()
    }
    return BotManager.instance
  }

  public initialize(botId: string): void {
    if (this.currentBotId && this.currentBotId !== botId) {
      throw new Error('Cannot initialize new bot while another bot is running. Please stop the current bot first.')
    }

    if (!this.currentBotId) {
      console.log('BotManager initialized for bot: ' + botId)
      const appState = getAppState()
      this.botSettings = _.find(appState.bots, { id: botId })

      if (!this.botSettings) {
        throw new Error('Bot not found or no target accounts configured.')
      }

      if (!this.botSettings.targetAccounts?.length) {
        throw new Error('No target accounts configured.')
      }
      this.currentBotId = botId
      console.log('Current bots:', this.botSettings)
    }
  }

  public async stop(): Promise<void> {
    console.log('BotManager stopped')
    this.currentBotId = null
    this.botSettings = null
  }

  public isInitialized(): boolean {
    return this.currentBotId !== null
  }

  public getCurrentBotId(): string | null {
    return this.currentBotId
  }

  public async placeOrderSingelOrder(targetAccountId: string, sourceSymbol, orderSize): Promise<boolean> {
    const target = this.targets[targetAccountId];
    const targetSettings = _.find(this.botSettings.targetAccounts, { id: targetAccountId }) ?? {}
    const targetSymbolMapping = _.find(targetSettings.symbolMappings, mapping => mapping.sourceSymbol === sourceSymbol)
    const { targetSymbolId, multiplier } = targetSymbolMapping
    console.log({
      targetSymbolId, targetSymbolMapping, targetSettings, realOrder: orderSize * multiplier
    })
    if (targetAccountId && targetSymbolId){
      const result = await target.placeOrder(targetSettings.accountId, targetSymbolId, orderSize*multiplier)
      return result
    }
    return false
  }

  async start() {
    console.log('BotManager started')
    if (Object.keys(this.targets).length !== 0) {
      throw new Error('Cannot start bot Error #S99')
    }

    for (const targetAccount of this.botSettings.targetAccounts) {
      console.log('Starting bot for account: ' + targetAccount.type)
      if (targetAccount.type === 'TopstepX') {
        const targetBrowser = await ProjectXBrowser.create(
          'TopstepX',
          targetAccount.credentials.username,
          targetAccount.credentials.password
        )
        await targetBrowser.start()
        this.targets[targetAccount.id] = targetBrowser

        // const accounts = await targetBrowser.getAccounts()
        // console.log({ accounts })
        // targetAccount.accounts = accounts
        // const appState = getAppState()
        // const updatedBot = { ...this.botSettings }
        // const updatedBots = appState.bots.map((bot) =>
        //   bot.id === this.botSettings.id ? updatedBot : bot
        // )
        // console.log({ ...appState, bots: updatedBots })
        // setAppState({ ...appState, bots: updatedBots })

      }
    }
    return true
  }
}

export default BotManager
