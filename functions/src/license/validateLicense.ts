import axios from 'axios'

export async function validateLicense(
  licenseKey: string,
  hwId: string,
  whopApiSecret: string
): Promise<any | false> {
  const url = `https://api.whop.com/api/v2/memberships/${licenseKey}/validate_license`
  const payload = {
    metadata: {
      HWID: hwId
    }
  }
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${whopApiSecret}`, // Make sure API_KEY is defined
    'Content-Type': 'application/json'
  }

  try {
    const response = await axios.post(url, payload, { headers })
    return response.data // Adjust the return value if needed
  } catch (error) {
    console.error('Error validating license:', error)
    return false
  }
}
