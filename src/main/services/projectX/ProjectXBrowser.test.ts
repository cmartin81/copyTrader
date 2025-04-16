// ProjectXBrowser.test.ts
import { ProjectXBrowser, PropFirmConfig } from './ProjectXBrowser';
import { waitMs } from '../../utils';

// Remove all the mocks to test with the real implementation

describe('ProjectXBrowser', () => {
  let projectXBrowser: ProjectXBrowser;

  afterEach(async () => {
    // Close browser after each test
    if (projectXBrowser) {
      if (projectXBrowser.puppeteerBrowser) {
        projectXBrowser.puppeteerBrowser.close();
      }
      if (projectXBrowser.browser) {
        await projectXBrowser.browser.disconnect();
      }
    }
  });

  test('should create ProjectXBrowser instance and actually open browser', async () => {
    // Create a real instance
    projectXBrowser = await ProjectXBrowser.create('TopstepX');

    // Verify it was created correctly
    expect(projectXBrowser).toBeInstanceOf(ProjectXBrowser);
    expect(projectXBrowser.config).toEqual(PropFirmConfig.TopstepX);

    // Actually start the browser - this will call openBrowser() internally
    console.log('Starting browser...');
    await projectXBrowser.start();

    // Wait for 20 seconds to keep the browser open
    console.log('Browser started, now waiting for 20 seconds...');
    await waitMs(20000);
    console.log('Done waiting');

  }, 30000); // Increase timeout for this test to 30 seconds
});
