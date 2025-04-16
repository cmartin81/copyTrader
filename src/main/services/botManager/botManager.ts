import { getBots } from '../../store'

class BotManager {
  settings: any
  constructor(botId: string) {
    console.log('BotManager created for bot: ' + botId)
    console.log(getBots())
    //this.settings = settings
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
