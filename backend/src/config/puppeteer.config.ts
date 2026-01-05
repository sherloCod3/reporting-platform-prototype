import puppeteer from 'puppeteer';
import type { LaunchOptions } from 'puppeteer'
import { env } from './env.config.js';

export async function launchBrowser() {
    const options: LaunchOptions = {
    };

    if (env.PUPPETEER_EXECUTABLE_PATH) {
        options.executablePath = env.PUPPETEER_EXECUTABLE_PATH;
    }

    return puppeteer.launch({
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    });
}