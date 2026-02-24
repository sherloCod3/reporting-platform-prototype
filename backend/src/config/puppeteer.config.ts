import puppeteer, { Browser } from 'puppeteer';
import { createPool, Pool } from 'generic-pool';
import type { LaunchOptions } from 'puppeteer';
import { env } from './env.config.js';

const factory = {
  create: async function (): Promise<Browser> {
    const options: any = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Recommended for containers to prevent memory crashes
        '--disable-gpu'
      ]
    };

    if (env.PUPPETEER_EXECUTABLE_PATH) {
      options.executablePath = env.PUPPETEER_EXECUTABLE_PATH;
    }

    return await puppeteer.launch(options);
  },
  destroy: async function (browser: Browser): Promise<void> {
    await browser.close();
  }
};

const opts = {
  max: 5, // Maximum concurrent browsers
  min: 1, // Minimum warm browsers
  idleTimeoutMillis: 30000,
  evictionRunIntervalMillis: 10000
};

export const browserPool: Pool<Browser> = createPool(factory, opts);
