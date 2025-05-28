import { defineString } from 'firebase-functions/params'
import { validateLicense } from './validateLicense'
import { test } from '@jest/globals'

const HWID = '94b988103243d466e682c8549c678a774a71d4740974fc6cc8e1e097ddc8e155'
const wrongHWID = '94b988103243d466e682c8549c678a774a71d4740974fc6cc8e1e097ddc8e1551'
const whopApiSecret = defineString('WHOP_API_SECRET')

test('validate software', async () => {
  const data = await validateLicense('G-ABB40B-8F0E2EB3-E2B8E2W', HWID, whopApiSecret.value())
  const data1 = await validateLicense('G-ABB40B-8F0E2EB3-E2B8E2W', wrongHWID, whopApiSecret.value())
  if (data) {
    console.log('Valid license')
  } else {
    console.log('Invalid license')
  }
  console.log(data1)
})
