import puppeteer from 'puppeteer';
import { launchBrowser } from '../config/puppeteer.config.js';


export async function htmlToPdf(htmlContent: string): Promise<Buffer> {
    const browser = await launchBrowser();

    try {
        const page = await browser.newPage();

        // finaliza e cria o HTML recebido do frontend
        // o frontend fica responsável por enviar a estilização do HTML 
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        return pdf;
    } finally {
        await browser.close();
    }
}
