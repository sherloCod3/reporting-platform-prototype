import puppeteer from 'puppeteer';
import { launchBrowser } from '../config/puppeteer.config.js';

export async function generatePdf(html: string) {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true
    });

    await browser.close();
    return pdf;
}

export async function htmlToPdf(htmlContent: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
        ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
        })
    });

    const page = await browser.newPage()

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.addStyleTag({
        content: `
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #4CAF50; color: white; }
        `
    });

    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px' }
    });

    await browser.close();
    return pdf;
}