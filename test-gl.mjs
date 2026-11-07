import { chromium } from 'playwright';

const CHROMIUM = 'C:\\Users\\O M E N\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage();
  const res = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return {
      glAvailable: !!gl,
      renderer: gl ? gl.getParameter(gl.RENDERER) : null,
      vendor: gl ? gl.getParameter(gl.VENDOR) : null,
    };
  });
  console.log('WebGL test:', res);
  await browser.close();
})();

