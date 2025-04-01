class BotManager {
  constructor(settings: any) {
    this.settings = settings
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
