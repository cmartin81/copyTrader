import { getAppState, setAppState, getSessionState, setSessionState } from '../../store'
import _ from 'lodash'
import { ProjectXBrowser } from '../projectX/ProjectXBrowser'
import { AbstractTargetAccount } from '../projectX/abstractTargetAccount'
import { ipcMain } from 'electron'
import { AbstractMasterAccount } from '../masterAccounts/AbstractMasterAccount'
import { TestMasterAccount } from '../masterAccounts/testMasterAccount'
import { RithmicWsMasterAccount } from "../masterAccounts/rithmic/RithmicWsMasterAccount";
import { TargetAccountStatus } from '../../../shared/types';
import { broadcastState } from '../../utils/broadcastState';

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
    // Listen for bot-manager-ready event to ensure this handler is set up after other handlers
    setTimeout(() => {
      // Listen for app state updates
      ipcMain.on('bot-manager-store-update', (appStateOrEvent, maybeAppState) => {
        // Handle both cases: when called with (event, appState) and when called with just (appState)
        const appState = maybeAppState || appStateOrEvent;

        if (this.currentBotId && appState && appState.bots) {
          this.botSettings = _.find(appState.bots, { id: this.currentBotId });
        }
      });

      // Listen for user updates on bot
      ipcMain.on('set-bots', (_event, bots) => {
        if (this.currentBotId) {
          this.botSettings = _.find(bots, { id: this.currentBotId });
        }
      });
    }, 0);
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
    console.log('BotManager stopping all targets')

    // Update all target account statuses to STOPPED
    const sessionState = getSessionState();
    if (sessionState.runningBot && sessionState.runningBot.id === this.currentBotId) {
      for (const targetAccount of sessionState.runningBot.targetAccounts) {
        this.updateTargetAccountStatus(targetAccount.id, TargetAccountStatus.STOPPED);
      }
    }

    // Close all target browsers
    for (const targetId in this.targets) {
      try {
        await this.targets[targetId].stop()
        console.log(`Stopped target: ${targetId}`)
      } catch (error) {
        console.error(`Error stopping target ${targetId}:`, error)
      }
    }

    // Stop master account if it exists
    if (this.masterAccount) {
      try {
        await this.masterAccount.stop()
        console.log('Stopped master account')
      } catch (error) {
        console.error('Error stopping master account:', error)
      }
      this.masterAccount = undefined
    }

    // Clear targets
    this.targets = {}

    // Clear running bot from session state
    setSessionState({
      ...sessionState,
      runningBot: null
    });

    // Broadcast the state change to all renderer processes
    broadcastState();

    // Reset state
    this.currentBotId = null
    this.botSettings = null

    console.log('BotManager stopped')
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

  startSubsubscribingToMasterAccount(){
    if (this.currentBotId && this.masterAccount) {
      this.masterAccount.subscribe('order', ({ sourceSymbolId, orderSize }) => {
        console.log('order', { sourceSymbolId, orderSize })
        this.placeOrder(sourceSymbolId, orderSize).then((ok) => {
          console.log(`Order placed (${ok}): `, sourceSymbolId, orderSize);
        })
      })
    }
  }

  async start() {
    console.log('BotManager started')
    // if (Object.keys(this.targets).length !== 0) {
    //   throw new Error('Cannot start bot Error #S99')
    // }

    // Initialize session state with target accounts in STARTING status
    const sessionState = getSessionState();
    if (sessionState.runningBot && sessionState.runningBot.id === this.currentBotId) {
      // Bot is already in session state, no need to initialize
    } else {
      // Create new running bot entry in session state
      const targetAccountStatuses = this.botSettings.targetAccounts.map(ta => ({
        id: ta.id,
        status: TargetAccountStatus.STARTING
      }));

      setSessionState({
        ...sessionState,
        runningBot: {
          id: this.currentBotId,
          targetAccounts: targetAccountStatuses
        }
      });
    }

    const masterAccount = this.botSettings.masterAccount
    if (masterAccount.type === 'Test') {
      this.masterAccount = new TestMasterAccount()
      await this.masterAccount.start()
    } else if (masterAccount.type === 'Rithmic') {
      const config = {
        url: process.env.RITHMIC_WS_URL || 'wss://rituz00100.rithmic.com:443',
        userId: process.env.RITHMIC_USER_ID || 'andy@goat-algo.net',
        password: process.env.RITHMIC_PASSWORD || 'jBMHOPAY',
        systemName: process.env.RITHMIC_SYSTEM_NAME || 'Rithmic Test',
        ibId: 'Prospects',
        fcmId: 'Rithmic-FCM'
      }
      this.masterAccount = new RithmicWsMasterAccount(config)
      await this.masterAccount.start()
    }
    this.startSubsubscribingToMasterAccount()

    for (const targetAccount of this.botSettings.targetAccounts) {
      console.log('Starting bot for account: ' + targetAccount.type)
      if (['TopstepX', 'TopstepX', 'Bulenox', 'TheFuturesDesk', 'TickTickTrader'].includes(targetAccount.type)) {
        try {
          const targetBrowser = await ProjectXBrowser.create(
            targetAccount.type,
            targetAccount.credentials.username,
            targetAccount.credentials.password
          )

          // Update status to STARTING before browser starts
          this.updateTargetAccountStatus(targetAccount.id, TargetAccountStatus.STARTING);

          await targetBrowser.start()
          this.targets[targetAccount.id] = targetBrowser

          // Update status to RUNNING after browser is started
          this.updateTargetAccountStatus(targetAccount.id, TargetAccountStatus.RUNNING);
        } catch (error) {
          console.error(`Error starting target account ${targetAccount.id}:`, error);
          this.updateTargetAccountStatus(targetAccount.id, TargetAccountStatus.STOPPED);
        }
      }
    }
    return true
  }

  // Helper method to update target account status in session state
  private updateTargetAccountStatus(targetAccountId: string, status: TargetAccountStatus): void {
    console.log(`[BotManager] Updating target account status: ${targetAccountId} -> ${status}`);

    const sessionState = getSessionState();
    if (!sessionState.runningBot || sessionState.runningBot.id !== this.currentBotId) {
      console.log(`[BotManager] No running bot or bot ID mismatch. Current bot ID: ${this.currentBotId}, Running bot ID: ${sessionState.runningBot?.id}`);
      return;
    }

    const updatedTargetAccounts = sessionState.runningBot.targetAccounts.map(ta =>
      ta.id === targetAccountId ? { ...ta, status } : ta
    );

    console.log(`[BotManager] Setting session state with updated target accounts:`, updatedTargetAccounts);

    setSessionState({
      ...sessionState,
      runningBot: {
        ...sessionState.runningBot,
        targetAccounts: updatedTargetAccounts
      }
    });

    // Broadcast the state change to all renderer processes
    console.log(`[BotManager] Broadcasting state change`);
    broadcastState();
  }
}

export default BotManager
