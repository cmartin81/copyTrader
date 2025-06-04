import * as _ from "lodash";
import { machineIdSync } from 'node-machine-id'

import WhopApiClient from "./whop/WhopApiClient";
import { getAccessToken, getLicenseKey } from "./stores/app.store";
import { AppState } from "./appState";


let lastIsOk = true;

function logout(){
// todo: remove
}

export const doAuthorization = async (accesstoken:string, licenseKey:string): Promise<Boolean> => {
  const whopClient = new WhopApiClient(accesstoken)

  const isOk = await whopClient.checkSystemOk()
  if (!isOk && !lastIsOk) {
    logout()
  }
  lastIsOk = isOk;

  const user = await whopClient.getCurrentUser()

  if (user && !licenseKey) {
    return false
  }

  const linkedLicenseKey = whopClient.checkOrRegisterLicense(machineIdSync(), licenseKey)
  if (!linkedLicenseKey) {
    return false
  } else {
    // todo: store linkedLicenseKey in appStore
  }
  return true

}

