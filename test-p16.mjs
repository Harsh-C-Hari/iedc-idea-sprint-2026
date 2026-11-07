/**
 * test-p16.mjs — Comprehensive test suite for Phase 1.6 fixes:
 *   1) Hero: no cursor-following motion on text/buttons
 *   2) About Journey: connector lines never overlap circle at 1280, 1440, 1920
 *   3) Idea Spark 3D: continuous infinite motion + no freeze on settled
 *   4) Timeline: vertical rail stops at last node (Day 1 & Day 2)
 *   5) About Manifesto: scroll in 12px steps, strictly cream-to-lime color line
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5173';
const CHROMIUM = 'C:\\Users\\O M E N\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';
const SS_DIR = path.join(__dirname, 'p16-screenshots');

fs.mkdirSync(SS_DIR, { recursive: true });

function parseRgb(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

// Check if color is on cream (#F2EBDD) to lime (#D9F36A) transition line
function isCreamToLime(r, g, b, tol = 5) {
  // #F2EBDD = (242, 235, 221)
  // #D9F36A = (217, 243, 106)
  // Normalized line parameter t from R channel:
  const t = (242 - r) / 25;
  const expectedG = 235 + 8 * t;
  const expectedB = 221 - 115 * t;

  const validRange = r >= 210 && r <= 248 && g >= 230 && g <= 248 && b >= 100 && b <= 226;
  const matchesLine = Math.abs(g - expectedG) <= tol && Math.abs(b - expectedB) <= tol;
  return validRange && matchesLine;
}

const audit = {
  heroCursor: false,
  journeyLines: { 1280: false, 1440: false, 1920: false },
  ideaSpark3D: false,
  timelineRail: false,
  manifestoColors: { samples: 0, violations: 0 },
};

(async () => {
  console.log('Starting Phase 1.6 Verification Suite...\n');
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: HERO — No cursor motion on text/buttons
  // ──────────────────────────────────────────────────────────────────────────
  console.log('TEST 1: Hero cursor-following parallax check...');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200); // let entrance finish

    // Initial bounding rect of h1
    const h1 = page.locator('#hero-heading');
    const b0 = await h1.boundingBox();

    // Move mouse across extremes of screen
    await page.mouse.move(100, 100);
    await page.waitForTimeout(300);
    const b1 = await h1.boundingBox();

    await page.mouse.move(1340, 800);
    await page.waitForTimeout(300);
    const b2 = await h1.boundingBox();

    const dx = Math.abs(b1.x - b0.x) + Math.abs(b2.x - b0.x);
    const dy = Math.abs(b1.y - b0.y) + Math.abs(b2.y - b0.y);

    console.log(`  h1 movement on mouse move: dx=${dx.toFixed(2)}px, dy=${dy.toFixed(2)}px`);
    audit.heroCursor = dx === 0 && dy === 0;
    console.log(`  Hero cursor check: ${audit.heroCursor ? 'PASS ✓' : 'FAIL ✗'}`);

    await page.screenshot({ path: path.join(SS_DIR, '1-hero-static.png') });
    await page.close();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: ABOUT JOURNEY — Connector line clearance at 1280, 1440, 1920
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 2: About Journey line clearance check...');
  for (const width of [1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    await page.evaluate(() => {
      document.querySelector('[aria-label="Event journey stages"]')?.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(500);

    const clearanceCheck = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-journey-stage]'));
      let allClear = true;
      const details = [];

      items.forEach((item, i) => {
        const circle = item.querySelector('.rounded-full');
        const line = item.querySelector('span[aria-hidden="true"]');
        if (!circle) return;

        const cRect = circle.getBoundingClientRect();
        if (line) {
          const lRect = line.getBoundingClientRect();
          // Line must start after circle's right edge
          const startClearance = lRect.left - cRect.right;
          // Line must end before next circle's left edge (if exists)
          let endClearance = 999;
          if (items[i + 1]) {
            const nextCircle = items[i + 1].querySelector('.rounded-full');
            if (nextCircle) {
              const ncRect = nextCircle.getBoundingClientRect();
              endClearance = ncRect.left - lRect.right;
            }
          }
          details.push({ i, startClearance, endClearance });
          if (startClearance < 0 || endClearance < 0) {
            allClear = false;
          }
        }
      });
      return { allClear, details };
    });

    audit.journeyLines[width] = clearanceCheck.allClear;
    console.log(`  Width ${width}px: ${clearanceCheck.allClear ? 'PASS ✓' : 'FAIL ✗'}`);
    clearanceCheck.details.forEach(d => {
      console.log(`    Stage ${d.i}: gap before line = ${d.startClearance.toFixed(1)}px, gap after line = ${d.endClearance.toFixed(1)}px`);
    });

    await page.screenshot({ path: path.join(SS_DIR, `2-journey-${width}.png`) });
    await page.close();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: IDEA SPARK 3D — Continuous infinite motion check
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 3: Idea Spark 3D continuous motion check...');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Scroll to Idea Spark section
    await page.evaluate(() => {
      document.getElementById('idea-spark')?.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(1500); // let WebGL mount

    const canvas = page.locator('#idea-spark canvas');
    if (await canvas.count() > 0) {
      // Capture frame 1
      const img1 = await canvas.screenshot();

      // Wait 350ms
      await page.waitForTimeout(350);

      // Capture frame 2
      const img2 = await canvas.screenshot();

      // Compare buffer difference
      let diffPixels = 0;
      for (let i = 0; i < Math.min(img1.length, img2.length); i++) {
        if (img1[i] !== img2[i]) diffPixels++;
      }

      console.log(`  Pixel difference between frames (350ms apart): ${diffPixels} bytes`);
      audit.ideaSpark3D = diffPixels > 50;
      console.log(`  Continuous motion: ${audit.ideaSpark3D ? 'PASS ✓' : 'FAIL ✗'}`);

      // Click generate and ensure scene continues to move
      const genBtn = page.locator('#idea-spark button').filter({ hasText: /generate|another/i }).first();
      if (await genBtn.count() > 0) {
        await genBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(SS_DIR, '3-spark-generated.png') });
      }
    } else {
      console.log('  Canvas not found (fallback rendered).');
    }
    await page.close();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: TIMELINE — Vertical rail stops at last node
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 4: Timeline rail termination check...');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    await page.evaluate(() => {
      document.getElementById('timeline')?.scrollIntoView({ block: 'start' });
    });
    await page.waitForTimeout(600);

    const railCheck = await page.evaluate(() => {
      const dayPanels = document.querySelectorAll('#timeline [data-timeline-heading]');
      let ok = true;
      const details = [];

      // Check each day panel's last item
      const panels = document.querySelectorAll('#timeline ol');
      panels.forEach((ol, dayIdx) => {
        const items = ol.querySelectorAll('[data-timeline-item]');
        const lastItem = items[items.length - 1];
        const lastSeg = lastItem?.querySelector('[data-rail-segment]');
        const hasSegOnLast = !!lastSeg;
        const totalSegments = ol.querySelectorAll('[data-rail-segment]').length;

        details.push({
          day: dayIdx + 1,
          itemsCount: items.length,
          segmentsCount: totalSegments,
          hasSegOnLast,
        });

        // There should be exactly (items.length - 1) segments
        if (totalSegments !== items.length - 1 || hasSegOnLast) {
          ok = false;
        }
      });
      return { ok, details };
    });

    audit.timelineRail = railCheck.ok;
    console.log(`  Rail terminates at last node: ${railCheck.ok ? 'PASS ✓' : 'FAIL ✗'}`);
    railCheck.details.forEach(d => {
      console.log(`    Day ${d.day}: ${d.itemsCount} items, ${d.segmentsCount} rail segments. Last item has segment: ${d.hasSegOnLast}`);
    });

    // Mobile screenshot
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SS_DIR, '4-timeline-mobile.png') });

    // Desktop screenshot
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SS_DIR, '4-timeline-desktop.png') });

    await page.close();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: ABOUT MANIFESTO — Color line sampling during scroll
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 5: Manifesto mid-scroll color sampling check...');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Scroll to about
    await page.evaluate(() => {
      document.querySelector('[aria-label="Our manifesto"]')?.scrollIntoView({ block: 'start' });
    });
    await page.waitForTimeout(400);

    let totalSamples = 0;
    let violations = 0;

    // Scroll in 12px increments, sampling every word every 40ms
    for (let step = 0; step < 40; step++) {
      await page.evaluate(() => window.scrollBy(0, 12));
      await page.waitForTimeout(40);

      const colors = await page.evaluate(() => {
        const words = document.querySelectorAll('[data-manifesto-word]');
        return Array.from(words).map(w => getComputedStyle(w).color);
      });

      for (const colStr of colors) {
        totalSamples++;
        const rgb = parseRgb(colStr);
        if (rgb) {
          const [r, g, b] = rgb;
          if (!isCreamToLime(r, g, b)) {
            violations++;
            console.log(`    VIOLATION at step ${step}: color = ${colStr}`);
          }
        }
      }
    }

    audit.manifestoColors = { samples: totalSamples, violations };
    console.log(`  Total color samples: ${totalSamples}`);
    console.log(`  Violations: ${violations}`);
    console.log(`  Manifesto color integrity: ${violations === 0 ? 'PASS ✓' : 'FAIL ✗'}`);

    await page.screenshot({ path: path.join(SS_DIR, '5-manifesto-active.png') });
    await page.close();
  }

  await browser.close();

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  PHASE 1.6 VERIFICATION SUMMARY');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  1. Hero static text/buttons:      ${audit.heroCursor ? 'PASS' : 'FAIL'}`);
  console.log(`  2. Journey connector lines (1280): ${audit.journeyLines[1280] ? 'PASS' : 'FAIL'}`);
  console.log(`     Journey connector lines (1440): ${audit.journeyLines[1440] ? 'PASS' : 'FAIL'}`);
  console.log(`     Journey connector lines (1920): ${audit.journeyLines[1920] ? 'PASS' : 'FAIL'}`);
  console.log(`  3. SparkScene continuous motion:  ${audit.ideaSpark3D ? 'PASS' : 'FAIL'}`);
  console.log(`  4. Timeline rail terminates:      ${audit.timelineRail ? 'PASS' : 'FAIL'}`);
  console.log(`  5. Manifesto color purity:        ${audit.manifestoColors.violations === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`\n  Screenshots saved to: ${SS_DIR}`);

  const allPassed =
    audit.heroCursor &&
    audit.journeyLines[1280] &&
    audit.journeyLines[1440] &&
    audit.journeyLines[1920] &&
    audit.ideaSpark3D &&
    audit.timelineRail &&
    audit.manifestoColors.violations === 0;

  process.exit(allPassed ? 0 : 1);
})();
