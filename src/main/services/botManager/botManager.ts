import { getAppState, setAppState } from '../../store'
import _ from 'lodash'
import { ProjectXBrowser } from '../projectX/ProjectXBrowser'
import { AbstractTargetAccount } from '../projectX/abstractTargetAccount'
import { ipcMain } from 'electron'
import { AbstractMasterAccount } from '../masterAccounts/AbstractMasterAccount'
import { TestMasterAccount } from '../masterAccounts/testMasterAccount'

class BotManager {
  private static instance: BotManager | null = null
  private botSettings: any
  private currentBotId: string | null = null
  private targets: { [key: string]: AbstractTargetAccount } = {}
  private masterAccount?: AbstractMasterAccount

  private constructor() {
    // Private constructor to prevent direct instantiation
    this.setupAppStateListener()
  }

  private setupAppStateListener(): void {
    // Listen for user updates on bot
    ipcMain.on('store-send', (_event, { action, key, value }) => {
      if (action === 'set' && key === 'appState' && this.currentBotId) {
        this.botSettings = _.find(value.bots, { id: this.currentBotId })
      }
    })

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
      throw new Error(
        'Cannot initialize new bot while another bot is running. Please stop the current bot first.'
      )
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

  private async _placeOrder(targetSetting, sourceSymbol, orderSize): Promise<boolean> {
    console.log(
      'BotManager._placeOrder',
      targetSetting,
      sourceSymbol,
      orderSize,
      this.botSettings
    )

    const targetAccountId = targetSetting.accountId
    const targetSymbolMapping = _.find(
      targetSetting.symbolMappings,
      (mapping) => mapping.sourceSymbol === sourceSymbol
    )
    if (!targetSymbolMapping) {
      //todo: make a switch.. for recording new symbols if not found
      targetSetting.symbolMappings.push({
        sourceSymbol: sourceSymbol,
        targetSymbolId: '',
        isEditing: true,
        multiplier: 1
      })
      this.updateBotStore();
      return true
    }
    if (targetSymbolMapping.isEditing) {
      return true
    }
    const { targetSymbolId, multiplier } = targetSymbolMapping
    const target = this.targets[targetSetting.id]
    // todo: check if targetbot is "on" and window exist

    if (targetAccountId && targetSymbolId && target) {
      console.log({
        targetSymbolId,
        targetSymbolMapping,
        targetSetting,
        realOrder: orderSize * multiplier
      })
      const result = await target.placeOrder(
        targetAccountId,
        targetSymbolId,
        orderSize * multiplier
      )
      return result
    }
    return false
  }

  private updateBotStore(): void {
    if (!this.botSettings || !this.currentBotId) {
      console.error('[BotManager] Cannot update bot store - Bot is not initialized.');
      return;
    }

    const currentState = getAppState();
    const updatedBots = currentState.bots.map(bot =>
      bot.id === this.currentBotId ? this.botSettings : bot
    );

    setAppState({ ...currentState, bots: updatedBots });
    console.log('[BotManager] botStore updated with new symbol mappings');
  }

  public async placeOrder(sourceSymbol, orderSize): Promise<boolean> {
    const placeOrderPromises: Promise<boolean>[] = []
    for (const targetSetting of this.botSettings.targetAccounts) {
      placeOrderPromises.push(this._placeOrder(targetSetting, sourceSymbol, orderSize))
    }
    const results = await Promise.all(placeOrderPromises)
    return results.includes(true)
  }

  public async placeSingleOrder(
    targetAccountId: string,
    sourceSymbol,
    orderSize
  ): Promise<boolean> {
    const targetSettings = _.find(this.botSettings.targetAccounts, { id: targetAccountId }) ?? {}
    return await this._placeOrder(targetSettings, sourceSymbol, orderSize)
  }

  async start() {
    console.log('BotManager started')
    // if (Object.keys(this.targets).length !== 0) {
    //   throw new Error('Cannot start bot Error #S99')
    // }

    const masterAccount = this.botSettings.masterAccount
    if (masterAccount.type === 'Test') {
      this.masterAccount = new TestMasterAccount()
      await this.masterAccount.start()
      this.masterAccount.subscribe('order', ({ sourceSymbolId, orderSize }) => {
        console.log('order', { sourceSymbolId, orderSize })
        this.placeOrder(sourceSymbolId, orderSize).then((ok) => {
          console.log(`Order placed (${ok}): `, sourceSymbolId, orderSize);
        })
      })
    }

    for (const targetAccount of this.botSettings.targetAccounts) {
      console.log('Starting bot for account: ' + targetAccount.type)
      if (['TopstepX', 'TopstepX', 'Bulenox', 'TheFuturesDesk', 'TickTickTrader'].includes(targetAccount.type)) {
        const targetBrowser = await ProjectXBrowser.create(
          targetAccount.type,
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
