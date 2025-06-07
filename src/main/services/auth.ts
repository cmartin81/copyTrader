import * as _ from "lodash";
import { machineIdSync } from 'node-machine-id'

import WhopApiClient from "./whop/WhopApiClient";
import { getAppState, setAppState, setLicense } from '../store'

let lastIsOk = true;

export const logout = async (): Promise<boolean> => {
  try {
    // Get current app state
    const currentState = getAppState();

    // Remove user data
    const updatedState = {
      ...currentState,
      user: undefined
    };

    // Update app state
    setAppState(updatedState);

    console.log('User logged out successfully');
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

export const doAuthorization = async (accesstoken:string, licenseKey:string): Promise<Boolean> => {
  setLicense(null)

  const whopClient = new WhopApiClient(accesstoken)
  console.log(1)

  const isOk = await whopClient.checkSystemOk()
  if (!isOk && !lastIsOk) {
    await logout();
  }
  lastIsOk = isOk;

  console.log(2)
  const user = await whopClient.getCurrentUser()

  if (!user) {
    return false
  }
  console.log(3)
  const linkedLicenseKey = await whopClient.checkOrRegisterLicense(machineIdSync(), licenseKey)
  if (!linkedLicenseKey) {
    return false
  }

  console.log(4)
  console.log(linkedLicenseKey)

  if (!linkedLicenseKey) {
    return false
  } else {
    setLicense(linkedLicenseKey)
  }
  return true
}
