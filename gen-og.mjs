import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROMIUM = 'C:\\Users\\O M E N\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  
  const svgPath = path.join(__dirname, 'public', 'images', 'og-image.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden">${svgContent}</body></html>`);
  await page.screenshot({ path: path.join(__dirname, 'public', 'images', 'og-image.png') });
  
  console.log('og-image.png created (1200x630)');
  await browser.close();
})();

