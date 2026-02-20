import puppeteer from 'puppeteer';
import { launchBrowser } from '../config/puppeteer.config.js';

export async function htmlToPdf(htmlContent: string): Promise<Buffer> {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();

    // networkidle0 aguarda estabilidade da pagina (fontes, imagens)
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' }
    });

    return pdf;
  } catch (error) {
    console.error('Erro ao converter HTML para PDF:', error);
    throw new Error('Falha ao renderizar PDF');
  } finally {
    await browser.close();
  }
}
