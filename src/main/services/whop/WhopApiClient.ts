// THIS IS A COPY FROM RENDERER!!
// THIS IS A COPY FROM RENDERER!!
// THIS IS A COPY FROM RENDERER!!
// THIS IS A COPY FROM RENDERER!!

import axios, { AxiosInstance } from 'axios';
import * as _ from "lodash";

interface Membership {
  id: string;
  product_id: string;
  user_id: string;
  created_at:string;
  expires_at: string;
  license_key: string;
  metadata?: { HWID?:string}
}

interface getWhopMembershipsResponse {
  pagination: any;
  data: Membership[]
}

interface GetAllLicenseDataResponse {
  productName: string;
  licenseKey: string;
  maxBots: number;
  isUsed: boolean;
}

interface Product {
  id: string;
  created_at: number,
  name: string;
  title: string;
  company_id: string;
  description?: string;
  page_id: string
  visibility: "visible" | string
}

interface getWhopProductsResponse {
  pagination: any;
  data: Product[]
}

class WhopApiClient {
  private axiosInstance: AxiosInstance;

  constructor(private accessToken: string) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.whop.com/api/v5',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  // Method to retrieve current user information
  public async getCurrentUser() {
    try {
      const response = await this.axiosInstance.get('/me');
      return response.data;
    } catch (error) {
      // Handle error appropriately if needed
      throw new Error(`Failed to retrieve user: ${error}`);
    }
  }

  public async getProducts(): Promise<getWhopProductsResponse>{
    try {
      const response = await this.axiosInstance.get(`/me/products?company_id=${import.meta.env.VITE_WHOP_COMPANY_ID}`);
      return response.data;
    } catch (error) {
      // Handle error appropriately if needed
      throw new Error(`Failed to retrieve user: ${error}`);
    }
  }

  public async getMemberships(): Promise<getWhopMembershipsResponse>{
    try {
      const response = await this.axiosInstance.get(`/me/memberships`);
      return response.data;
    } catch (error) {
      // Handle error appropriately if needed
      throw new Error(`Failed to retrieve user: ${error}`);
    }
  }

  findBotCountByProductId(productId) {
    const productMapping = {
      'prod_iIVYhggqznmWB': 8,
    }
    return productMapping[productId] ?? 0;
  }

  findBotCountNumber(input: string): number  {
    const pattern = /(\d+)\s+bots?|bots?\s+(\d+)/i; // Match a number before 'bots' or after 'bots', case insensitive
    const match = input.match(pattern);

    if (!match) {
      return 0;
    }
    return Number(match[1] || match[2]);
  }

  async getAllLicenseData(): Promise<GetAllLicenseDataResponse[]> {
    const memberships = await this.getMemberships();
    const products = await this.getProducts();
    const productMap = _.keyBy(products.data, 'id');
    const returnValue =  _.chain(memberships.data)
      .filter(m => m.license_key !== null)
      .map(m => ({
        productName: productMap[m.product_id]?.name ?? null,
        licenseKey: m.license_key,
        maxBots: this.findBotCountByProductId(productMap[m.product_id]?.id) || this.findBotCountNumber(productMap[m.product_id]?.name ?? "Unknown 2 bots"),
        isUsed: m.metadata?.HWID !== undefined,
      }))
      .filter(p => p.productName !== null)
      .value()
    return returnValue;
  }

  public async getMembership(prodCode): Promise<getWhopMembershipsResponse>{
    try {
      const productCode = prodCode
      const response = await this.axiosInstance.get(`/me/memberships?product_id=${productCode}`);
      return response.data;
    } catch (error) {
      // Handle error appropriately if needed
      throw new Error(`Failed to retrieve user: ${error}`);
    }
  }

  async checkSystemOk() {
    try {
      // @ts-ignore
      const url = import.meta.env.VITE_URL_STATUS
      const response = await axios.get(url);
      const isOk = response.data.ok === true;
      return isOk;
    } catch (e) {
      return false
    }
  }

  private async validateLicense(licenseKey: string, hwId: string) {
    try{
      // @ts-ignore
      const url = `${import.meta.env.VITE_URL_VALIDATE_LICENSE}?licenseKey=${licenseKey}&hwId=${hwId}`
      console.log({ url })

      const response = await axios.get(url);
      console.log({ response })
      return response.data;
    } catch (e) {
      return false
    }
  }

  public async findLicenseOnHwId(hwId: string) {
    const response = await this.getMemberships();
    const memberShips = response.data;

    const membership = memberShips.find(m => m.metadata?.HWID === hwId)
    if (membership) {
      return membership.license_key;
    }
    return false
  }


  public async checkOrRegisterLicense(hwId: string, currentOrNewLicense:string | null) {
    const existingLicense = await this.findLicenseOnHwId(hwId)
    console.log(22)

    if (existingLicense) {
      return existingLicense;
    }

    console.log(33)

    if (!currentOrNewLicense) {
      return false
    }
    console.log(44)

    const isValid = await this.validateLicense(currentOrNewLicense, hwId)
    if (isValid) {
      console.log(55)
      return currentOrNewLicense
    }
    return false;
  }


  public async hasValidSession() {
    try {
      await this.getCurrentUser();
      return true
    } catch (e) {
      return false
    }
  }

  // You can add more methods here to interact with other endpoints as needed
}

export default WhopApiClient;
