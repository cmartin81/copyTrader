import { AbstractMasterAccount, Status } from './AbstractMasterAccount'
import { ipcMain } from 'electron'
import { logToFile } from '../../utils/logger'

export class TestMasterAccount extends AbstractMasterAccount {
  isListening = false
  constructor() {
    super()
  }

  start(): Promise<boolean> {
    super.setStatus(Status.running)
    this.connect()
    return Promise.resolve(true)
  }

  private connect() {
    if (this.isListening) return

    ipcMain.on('masterAccountBuy', (_event, { source, contracts }) => {
      super.emit('order', {
        sourceSymbolId: source,
        orderSize: contracts
      })
      logToFile(`[Master Account] Buy order received: source=${source}, contracts=${contracts}`)
      console.log(`[Master Account] Buy order received:`, { source, contracts })
    })

    ipcMain.on('masterAccountSell', (_event, { source, contracts }) => {
      super.emit('order', {
        sourceSymbolId: source,
        orderSize: contracts * -1
      })
      logToFile(`[Master Account] Sell order received: source=${source}, contracts=${contracts}`)
      console.log(`[Master Account] Sell order received:`, { source, contracts })
    })
    this.isListening = true
  }

  stop(): Promise<boolean> {
    super.setStatus(Status.stopped)
    return Promise.resolve(true)
  }
}
