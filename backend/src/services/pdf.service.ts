import { browserPool } from '../config/puppeteer.config.js';
import { logger } from '../utils/logger.js';

export async function htmlToPdf(htmlContent: string): Promise<Buffer> {
  // Acquire a warm browser from the pool
  const browser = await browserPool.acquire();

  try {
    const page = await browser.newPage();

    try {
      // networkidle0 aguarda estabilidade da pagina (fontes, imagens)
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 15000 // 15s prevents total stalling
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' }
      });

      return Buffer.from(pdf);
    } finally {
      // Always close the tab context to unbind memory, regardless of generation success
      await page.close().catch(err => logger.error({ err }, 'Error closing page'));
    }
  } catch (error) {
    logger.error({ err: error }, 'Erro ao converter HTML para PDF');
    throw new Error('Falha ao renderizar PDF');
  } finally {
    // Release the browser back to the pool
    await browserPool.release(browser).catch(err => logger.error({ err }, 'Error releasing browser'));
  }
}
