import { RithmicWebSocketService } from './RithmicWebSocketService'

const config = {
  url: process.env.RITHMIC_WS_URL || 'wss://rituz00100.rithmic.com:443',
  userId: process.env.RITHMIC_USER_ID || 'andy@goat-algo.net',
  password: process.env.RITHMIC_PASSWORD || 'jBMHOPAY',
  systemName: process.env.RITHMIC_SYSTEM_NAME || 'Rithmic Test',
  ibId: 'Prospects',
  fcmId: 'Rithmic-FCM'
}

async function start() {

  const service = new RithmicWebSocketService(config)

  try {
    await service.start()
    service.subscribe('order', (order) => {
      console.log('Order:', order)
    })
  } catch (error) {
    console.error(error)
  }
}

start().then(() => {
  console.log('Done!')
})

