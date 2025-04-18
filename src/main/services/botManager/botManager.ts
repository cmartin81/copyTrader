import { getAppState, setAppState } from '../../store'
import _ from 'lodash'
import { ProjectXBrowser } from '../projectX/ProjectXBrowser'
import { sleepMs } from '../../tools/sleep'
import { broadcastState } from '../../index'

class BotManager {
  botSettings: any

  constructor(botId: string) {
    console.log('BotManager created for bot: ' + botId)
    const appState = getAppState()
    this.botSettings = _.find(appState.bots, { id: botId })

    if (!this.botSettings) {
      throw new Error('Bot not found or no target accounts configured.')
    }

    if (!this.botSettings.targetAccounts?.length) {
      throw new Error('No target accounts configured.')
    }
    // todo: more validations....
    console.log('Current bots:', this.botSettings)
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
        await sleepMs(5000)
        const accounts = await targetBrowser.getAccounts()
        console.log({ accounts })
        targetAccount.accounts = accounts
        const appState = getAppState()
        const updatedBot = { ...this.botSettings }
        const updatedBots = appState.bots.map((bot) =>
          bot.id === this.botSettings.id ? updatedBot : bot
        )
        console.log({ ...appState, bots: updatedBots })
        setAppState({ ...appState, bots: updatedBots })
      }
    }
    return true
  }

  async stop(): Promise<void> {
    console.log('BotManager stopped')
  }
}

export default BotManager
