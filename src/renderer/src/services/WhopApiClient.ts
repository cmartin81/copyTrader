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

  findHighestNumberInString(input: string): number {
    const numbers = input.match(/\d+/g);
    if (!numbers) {
      return 0;
    }
    const maxNumber = Math.max(...numbers.map(Number));

    return maxNumber;
  }


  async getAllLicenseData(): Promise<GetAllLicenseDataResponse[]> {
    const memberships = await this.getMemberships();
    const products = await this.getProducts();
    const productMap = _.keyBy(products.data, 'id');
    return _.chain(memberships.data)
      .filter(m => m.license_key !== null)
      .map(m => ({
        productName: productMap[m.product_id].name,
        licenseKey: m.license_key,
        maxBots: this.findHighestNumberInString(productMap[m.product_id].name),
        isUsed: m.metadata?.HWID !== undefined,
      })).value()
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

  private async validateLicense(licenseKey: string, hwId: string) {
    try{
      const url = `${import.meta.env.VITE_URL_VALIDATE_LICENSE}?licenseKey=${licenseKey}&hwId=${hwId}`
      const response = await axios.get(url);
      console.log(response.data);
      return response.data;
    } catch (e) {
      return false
    }
  }
  public async checkOrRegisterLicense(hwId: string, currentOrNewLicense:string | null) {
    const response = await this.getMemberships();
    const memberShips = response.data;

    const membership = memberShips.find(m => m.metadata?.HWID === hwId)
    if (membership) {
      return membership.license_key;
    }

    if (!currentOrNewLicense) {
      return false
    }

    const isValid =  await this.validateLicense(currentOrNewLicense, hwId)
    if (isValid) {
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
