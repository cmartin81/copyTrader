import { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import { defineString } from 'firebase-functions/params'
import * as license from './license/validateLicense'

// Autopilot
const whopOauthKey = defineString('WHOP_OAUTH_KEY')
const whopOauthSecret = defineString('WHOP_OAUTH_SECRET')
const oauthCallbackUrl = defineString('OAUTH_CALLBACK_URL')
const serverCallbackUrl = defineString('SERVER_CALLBACK_URL')
const whopApiSecret = defineString('WHOP_API_SECRET')

export const helloWorld = onRequest((request: any, response: any) => {
  response.send('Hello from Firebase!!' + whopOauthKey.value())
})

export const status = onRequest((request: any, response: any) => {
  response.send({ ok: true })
})

const _validateLicense = async (request: any, response: any, apiSecret: string): Promise<any> => {
  console.log('Validating license')

  const licenseKey = request.query.licenseKey
  const hwId = request.query.hwId
  const result = await license.validateLicense(licenseKey, hwId, apiSecret)
  if (!result) {
    return response.status(400).json({
      success: false,
      msg: 'Invalid License'
    })
  }
  console.log(`License ${licenseKey} validated for hwId ${hwId}`)
  response.json({
    success: true,
    data: result
  })
}

export const validateLicense = onRequest((req, res) => {
  const api = whopApiSecret.value()
  return _validateLicense(req, res, api)
})

const _oauthCallback = (
  req: any,
  res: any,
  oauthKey: string,
  oauthSecret: string,
  oauthCallback: string
): void => {
  if (req.query.code) {
    const payload = {
      code: req.query.code,
      client_id: oauthKey,
      client_secret: oauthSecret,
      redirect_uri: serverCallbackUrl
    }
    console.log('new request')
    console.log(payload)


    const requestOptions: AxiosRequestConfig = {
      method: 'POST',
      url: 'https://api.whop.com/v5/oauth/token',
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    }

    logger.log(requestOptions)
    axios
      .request(requestOptions)
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          const redirectUrl = `${oauthCallback}?access_token=${response.data.access_token}&expires_in=${response.data.expires_in}&refresh_token=${response.data.refresh_token}`
          console.log(redirectUrl)
          res.redirect(redirectUrl)
        } else {
          console.error(response.data)
          res.status(400).json({
            success: false,
            msg: 'Whop Error'
          })
        }
      })
      .catch((error: AxiosError) => {
        console.error(error)
        res.status(500).json({
          success: false,
          msg: 'Failed to fetch the token, please try again!'
        })
      })
  } else {
    res.status(400).json({
      success: false,
      msg: 'Invalid Parameters'
    })
  }
}

export const oauthCallback = onRequest((req, res) => {
  const oauthKey = whopOauthKey.value()
  const oauthSecret = whopOauthSecret.value()
  const oauthCallbackUrlString = oauthCallbackUrl.value()

  return _oauthCallback(req, res, oauthKey, oauthSecret, oauthCallbackUrlString)
})
