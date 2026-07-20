import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const htmlPath = path.resolve(__dirname, '../docs/Shree_Hari_Ecommerce_Plans.html');
  const pdfPath = path.resolve(__dirname, '../docs/Shree_Hari_Ecommerce_Plans.pdf');
  
  console.log(`Loading HTML from: file://${htmlPath}`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
  
  // Hide the floating print button during PDF generation
  await page.evaluate(() => {
    const btn = document.querySelector('.print-btn');
    if (btn) btn.style.display = 'none';
  });

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true, // Respect A4 print CSS we configured
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '10mm',
      right: '10mm'
    }
  });
  
  console.log(`PDF successfully generated at: ${pdfPath}`);
  await browser.close();
}

run().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
