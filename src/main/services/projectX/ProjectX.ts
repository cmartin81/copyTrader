import { AbstractTargetAccount } from "./abstractTargetAccount";

const puppeteer = require('puppeteer-core');
const path = require('path');

public class ProjectX implements AbstractTargetAccount {


  async start() {
      const browser = await puppeteer.launch({
        executablePath: path.join(__dirname, 'path-to-your-electron-executable'), // Path to Electron binary
        headless: false, // Electron doesn't support headless mode
      });

      const page = await browser.newPage();
      await page.goto('https://example.com'); // Example: Load a URL
      console.log(await page.title()); // Example: Get the title of the loaded page
      await browser.close();

  }
    getAccounts() {
        throw new Error("Method not implemented.");
    }
    placeOrder(targetSymbol: string, amount: number) {
        throw new Error("Method not implemented.");
    }
    stop() {
        throw new Error("Method not implemented.");
    }

}
