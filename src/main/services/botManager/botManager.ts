import { getAppState, setAppState } from '../../store'
import _ from 'lodash'
import { ProjectXBrowser } from '../projectX/ProjectXBrowser'
import { sleepMs } from '../../tools/sleep'
import { broadcastState } from '../../index'

class BotManager {
  private static instance: BotManager | null = null
  private botSettings: any
  private currentBotId: string | null = null

  private constructor() {
    // Private constructor to prevent direct instantiation
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

  async start() {
    console.log('BotManager started')
    for (const targetAccount of this.botSettings.targetAccounts) {
      console.log('Starting bot for account: ' + targetAccount.type)
      if (targetAccount.type === 'TopstepX') {
        const targetBrowser = await ProjectXBrowser.create(
          'TopstepX',
          targetAccount.credentials.username,
          targetAccount.credentials.password
        )
        await targetBrowser.start()
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
