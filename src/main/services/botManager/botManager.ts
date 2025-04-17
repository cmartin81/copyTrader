import { getAppState } from '../../store'
import _ from 'lodash'

class BotManager {
  botSettings: any

  constructor(botId: string) {
    console.log('BotManager created for bot: ' + botId)
    const appState = getAppState();
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
    return true
  }

  async stop(): Promise<void> {
    console.log('BotManager stopped')
  }
}

export default BotManager
