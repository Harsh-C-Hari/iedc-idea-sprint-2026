/**
 * contrast-check.js — Phase 1.5 Registration contrast audit
 *
 * Checks WCAG AA (≥ 4.5:1) for every specified state across:
 *   - Team step (default, selected tile, focused tile, hover Next)
 *   - Team step error state
 *   - Participants step
 *   - Review step
 * At viewports 390 and 1440 wide.
 *
 * Colour resolution: uses canvas.getContext('2d').fillStyle round-trip
 * so the browser resolves oklch / color-mix / CSS vars before we parse.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const VIEWPORTS = [
  { name: '390', width: 390,  height: 844 },
  { name: '1440', width: 1440, height: 900 },
];

const SCREENSHOTS_DIR = path.join(
  'C:\\Users\\OMEN~1\\.gemini\\antigravity\\brain\\a987d0b4-17a3-4c57-a0cc-86df5417f32b\\scratch\\contrast-screenshots'
);
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

/** Use a canvas to resolve any CSS colour string to [r,g,b] 0-255 */
async function resolveColour(page, cssColour) {
  return page.evaluate((col) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  }, cssColour);
}

/** Relative luminance from sRGB channel value */
function linearise(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance([r, g, b]) {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}
function ratio(fg, bg) {
  const l1 = luminance(fg), l2 = luminance(bg);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get the computed foreground + background colour of an element
 * by walking up the DOM tree for background (first non-transparent hit).
 */
async function getElementContrast(page, selector) {
  return page.evaluate((sel) => {
    function toRgb(colStr) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = colStr;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a };
    }
    function isTransparent(col) {
      return col.includes('rgba(0, 0, 0, 0)') || col === 'transparent';
    }
    function walkBg(el) {
      let cur = el;
      while (cur && cur !== document.body.parentElement) {
        const bg = getComputedStyle(cur).backgroundColor;
        if (!isTransparent(bg)) return bg;
        cur = cur.parentElement;
      }
      return 'rgb(242, 235, 221)'; // cream fallback (body bg)
    }

    const el = document.querySelector(sel);
    if (!el) return { error: `not found: ${sel}` };
    const style = getComputedStyle(el);
    const fg = style.color;
    const bg = walkBg(el);
    return {
      fg: toRgb(fg),
      bg: toRgb(bg),
      fgRaw: fg,
      bgRaw: bg,
    };
  }, selector);
}

function aaCheck(cr) { return cr >= 4.5; }

const results = [];

function record(viewport, state, label, cr, pass, fgRaw, bgRaw) {
  results.push({ viewport, state, label, ratio: +cr.toFixed(2), pass, fgRaw, bgRaw });
  const mark = pass ? '✓' : '✗ FAIL';
  console.log(`  [${viewport}] ${state} | ${label}: ${cr.toFixed(2)}:1 ${mark}`);
  if (!pass) console.log(`    fg="${fgRaw}"  bg="${bgRaw}"`);
}

async function checkState(page, viewport, stateName, selectors) {
  for (const { label, sel } of selectors) {
    const col = await getElementContrast(page, sel);
    if (col.error) {
      console.log(`  [${viewport}] ${stateName} | ${label}: SKIP (${col.error})`);
      results.push({ viewport, state: stateName, label, ratio: null, pass: null, note: col.error });
      continue;
    }
    const cr = ratio([col.fg.r, col.fg.g, col.fg.b], [col.bg.r, col.bg.g, col.bg.b]);
    record(viewport, stateName, label, cr, aaCheck(cr), col.fgRaw, col.bgRaw);
  }
}

async function scrollToRegistration(page) {
  await page.evaluate(() => {
    document.getElementById('registration')?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Viewport ${vp.name}px ===`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    // Wait for dev server
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await scrollToRegistration(page);

    // ── State 1: Team Step (default) ────────────────────────────────────
    console.log('\n--- Team Step (default) ---');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${vp.name}-team-default.png`), fullPage: false });
    await checkState(page, vp.name, 'Team/default', [
      { label: 'Field label',           sel: '#registration label[for="team-name"], #registration [for="team-name"]' },
      { label: 'Team name input text',  sel: '#registration input[id="team-name"]' },
      { label: 'Legend (Team size)',     sel: '#registration fieldset legend' },
      { label: 'Unselected tile',        sel: '#registration [name="team-size"] + span, #registration fieldset span:first-of-type' },
      { label: 'Step label (Stepper)',   sel: '#registration ol li:nth-child(1) span:last-child' },
      { label: 'Next button text',       sel: '#registration button[type="submit"], #registration [data-next]' },
    ]);

    // ── State 2: Selected tile ──────────────────────────────────────────
    // Click the first tile (team size 2)
    const firstTile = page.locator('#registration input[name="team-size"]').first();
    await firstTile.check();
    await page.waitForTimeout(200);
    console.log('\n--- Team Step (tile selected) ---');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${vp.name}-team-tile-selected.png`), fullPage: false });
    // The selected span is the sibling of the checked radio
    const selectedTileColours = await page.evaluate(() => {
      const inputs = document.querySelectorAll('#registration input[name="team-size"]');
      let checked = null;
      for (const inp of inputs) { if (inp.checked) { checked = inp; break; } }
      if (!checked) return { error: 'no checked radio' };
      const span = checked.nextElementSibling;
      if (!span) return { error: 'no span sibling' };
      const style = getComputedStyle(span);
      function toRgb(colStr) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = colStr;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return [r, g, b];
      }
      return { fg: toRgb(style.color), bg: toRgb(style.backgroundColor), fgRaw: style.color, bgRaw: style.backgroundColor };
    });
    if (selectedTileColours.error) {
      console.log(`  SKIP selected tile: ${selectedTileColours.error}`);
    } else {
      const cr = ratio(selectedTileColours.fg, selectedTileColours.bg);
      record(vp.name, 'Team/tile-selected', 'Selected tile number', cr, aaCheck(cr),
        selectedTileColours.fgRaw, selectedTileColours.bgRaw);
    }

    // ── State 3: Focused tile (keyboard) ───────────────────────────────
    console.log('\n--- Team Step (tile focused) ---');
    await firstTile.focus();
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${vp.name}-team-tile-focused.png`), fullPage: false });
    // Focus ring colour vs section background
    const focusRingColour = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      // --focus-ring on data-theme=dark section = cream
      const section = document.querySelector('#registration');
      ctx.fillStyle = getComputedStyle(section).getPropertyValue('--focus-ring').trim() || '#F2EBDD';
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      // bg of section = near-black
      const canvas2 = document.createElement('canvas');
      canvas2.width = canvas2.height = 1;
      const ctx2 = canvas2.getContext('2d');
      ctx2.fillStyle = getComputedStyle(section).backgroundColor;
      ctx2.fillRect(0, 0, 1, 1);
      const [r2, g2, b2] = ctx2.getImageData(0, 0, 1, 1).data;
      return { fg: [r, g, b], bg: [r2, g2, b2], fgRaw: 'var(--focus-ring)', bgRaw: getComputedStyle(section).backgroundColor };
    });
    const focusCr = ratio(focusRingColour.fg, focusRingColour.bg);
    record(vp.name, 'Team/tile-focused', 'Focus ring vs section bg', focusCr, aaCheck(focusCr),
      focusRingColour.fgRaw, focusRingColour.bgRaw);

    // ── State 4: Hover Next button ──────────────────────────────────────
    console.log('\n--- Team Step (Next hover) ---');
    // Find the Next/submit button
    const nextBtn = page.locator('#registration button').filter({ hasText: /next|submit|register/i }).first();
    if (await nextBtn.count() > 0) {
      await nextBtn.hover();
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${vp.name}-team-next-hover.png`), fullPage: false });
      const hoverColours = await nextBtn.evaluate((el) => {
        const style = getComputedStyle(el);
        function toRgb(c) {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          return [r, g, b];
        }
        return { fg: toRgb(style.color), bg: toRgb(style.backgroundColor), fgRaw: style.color, bgRaw: style.backgroundColor };
      });
      const hoverCr = ratio(hoverColours.fg, hoverColours.bg);
      record(vp.name, 'Team/next-hover', 'Next button text on hover bg', hoverCr, aaCheck(hoverCr),
        hoverColours.fgRaw, hoverColours.bgRaw);
    } else {
      console.log(`  [${vp.name}] SKIP Next button not found`);
    }

    // ── State 5: Error state ────────────────────────────────────────────
    console.log('\n--- Team Step (error state) ---');
    // Click Next without filling in team name to trigger errors
    if (await nextBtn.count() > 0) {
      // Clear team name first
      await page.locator('#registration input[id="team-name"]').fill('');
      await nextBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${vp.name}-team-error.png`), fullPage: false });
      // Error message text in ErrorSummary
      await checkState(page, vp.name, 'Team/error', [
        { label: 'ErrorSummary heading',  sel: '#registration [role="alert"] p' },
        { label: 'Error link text',        sel: '#registration [role="alert"] a' },
        { label: 'Field error message',    sel: '#registration [id="team-name"] ~ *, #registration .text-red-500, #registration [role="alert"]' },
      ]);
    }

    // ── State 6: Stepper pills (steps 2 & 3 — done + upcoming) ─────────
    // Advance to Participants step
    console.log('\n--- Stepper pills (Participants step) ---');
    await page.locator('#registration input[id="team-name"]').fill('Test Team');
    await firstTile.check();
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${vp.name}-stepper-step2.png`), fullPage: false });
    if (vp.width >= 1024) {
      // Done pill (step 1 — now completed)
      const donePillColours = await page.evaluate(() => {
        const pills = document.querySelectorAll('#registration ol li span:first-child');
        if (!pills[0]) return { error: 'no pill' };
        const style = getComputedStyle(pills[0]);
        function toRgb(c) {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          return [r, g, b];
        }
        return { fg: toRgb(style.color), bg: toRgb(style.backgroundColor), fgRaw: style.color, bgRaw: style.backgroundColor };
      });
      if (!donePillColours.error) {
        const cr = ratio(donePillColours.fg, donePillColours.bg);
        record(vp.name, 'Stepper/step2', 'Done pill check icon vs fill', cr, aaCheck(cr),
          donePillColours.fgRaw, donePillColours.bgRaw);
      }
      // Upcoming pill (step 3)
      const upcomingPillColours = await page.evaluate(() => {
        const pills = document.querySelectorAll('#registration ol li span:first-child');
        if (!pills[2]) return { error: 'no upcoming pill' };
        const style = getComputedStyle(pills[2]);
        function toRgb(c) {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          return [r, g, b];
        }
        // For outlined pills, bg comes from the section since pill bg is transparent
        const section = document.querySelector('#registration');
        return { fg: toRgb(style.color), bg: toRgb(getComputedStyle(section).backgroundColor), fgRaw: style.color, bgRaw: 'section-bg' };
      });
      if (!upcomingPillColours.error) {
        const cr = ratio(upcomingPillColours.fg, upcomingPillColours.bg);
        record(vp.name, 'Stepper/step2', 'Upcoming pill "3" vs section bg', cr, aaCheck(cr),
          upcomingPillColours.fgRaw, upcomingPillColours.bgRaw);
      }
    }

    // ── State 7: Review step ────────────────────────────────────────────
    console.log('\n--- Review step ---');
    // Fill all participant fields for first participant (teamSize was set to 2)
    // Then navigate to review
    // Fill participant 1 (leader)
    const fillParticipant = async (prefix, name, email, phone, sem) => {
      const nameInput = page.locator(`#registration input[id="${prefix}-name"]`);
      if (await nameInput.count()) {
        await nameInput.fill(name);
        await page.locator(`#registration input[id="${prefix}-email"]`).fill(email);
        const phoneInput = page.locator(`#registration input[id="${prefix}-phone"]`);
        if (await phoneInput.count()) await phoneInput.fill(phone);
        // Select semester
        const semSelect = page.locator(`#registration select[id="${prefix}-semester"]`);
        if (await semSelect.count()) await semSelect.selectOption({ index: 1 });
      }
    };
    await fillParticipant('p0', 'Alice Leader', 'alice@cec.ac.in', '9876543210', 'S5');

    // Check if there's a p1 (team size 2)
    const p1Name = page.locator('#registration input[id="p1-name"]');
    if (await p1Name.count()) {
      await fillParticipant('p1', 'Bob Member', 'bob@cec.ac.in', '9876543211', 'S3');
    }

    const nextBtn2 = page.locator('#registration button').filter({ hasText: /next|review/i }).first();
    if (await nextBtn2.count()) {
      await nextBtn2.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${vp.name}-review-step.png`), fullPage: false });
    await checkState(page, vp.name, 'Review', [
      { label: 'Review section heading',  sel: '#registration h3, #registration h4' },
      { label: 'Review detail text',      sel: '#registration dl dd' },
      { label: 'Preview notice text',     sel: '#registration [role="note"] p, #registration [data-preview]' },
    ]);

    await context.close();
  }

  await browser.close();

  // ── Report ──────────────────────────────────────────────────────────
  console.log('\n\n══════════════════════════════════════════');
  console.log('  CONTRAST AUDIT REPORT — Phase 1.5');
  console.log('══════════════════════════════════════════');
  const failures = results.filter(r => r.pass === false);
  const passes   = results.filter(r => r.pass === true);
  const skipped  = results.filter(r => r.pass === null);
  console.log(`  Checked : ${results.length}`);
  console.log(`  Pass    : ${passes.length}`);
  console.log(`  Fail    : ${failures.length}`);
  console.log(`  Skipped : ${skipped.length}`);

  if (failures.length) {
    console.log('\n  FAILURES:');
    failures.forEach(f => {
      console.log(`  ✗ [${f.viewport}] ${f.state} | ${f.label}`);
      console.log(`    ratio: ${f.ratio}:1   fg="${f.fgRaw}"  bg="${f.bgRaw}"`);
    });
  } else {
    console.log('\n  ✓ All checks passed — 0 failures');
  }

  // Save JSON report
  const reportPath = path.join(SCREENSHOTS_DIR, 'contrast-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ summary: { total: results.length, pass: passes.length, fail: failures.length, skip: skipped.length }, results }, null, 2));
  console.log(`\n  Full JSON report: ${reportPath}`);
  console.log(`  Screenshots: ${SCREENSHOTS_DIR}`);

  if (failures.length > 0) process.exit(1);
})();
