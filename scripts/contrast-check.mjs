/**
 * contrast-check.mjs — Phase 1.5 Registration contrast audit (ESM)
 * Run from project root: node contrast-check.mjs
 *
 * Covers (at 390 and 1440 wide):
 *   Team step default, selected tile, focused tile, Next hover, error state,
 *   Stepper done/upcoming pills (desktop), Participants step, Review step.
 * Pass threshold: WCAG AA ≥ 4.5:1.
 */
import { chromium } from 'playwright';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL   = 'http://localhost:5173';
const SS_DIR     = path.join(__dirname, 'contrast-screenshots');
const CHROMIUM   = 'C:\\Users\\O M E N\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';

const VIEWPORTS  = [
  { name: '390',  width: 390,  height: 844  },
  { name: '1440', width: 1440, height: 900  },
];

fs.mkdirSync(SS_DIR, { recursive: true });

/* ── Colour math ─────────────────────────────────────────────────── */
function lin(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function lum([r, g, b]) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
function cr(fg, bg)     { const a = lum(fg), b2 = lum(bg); return (Math.max(a,b2)+.05)/(Math.min(a,b2)+.05); }
const AA = 4.5;

/* ── In-page canvas resolver (injected as string) ───────────────── */
// Resolves any CSS colour string (hex/rgb/oklch/color-mix/CSS var) → [r,g,b]
// by painting it onto a 1×1 canvas and reading back the sRGB pixel.
const HELPER = /* js */`
function px(colStr) {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const x = c.getContext('2d');
  x.fillStyle = String(colStr).trim();
  x.fillRect(0,0,1,1);
  const d = x.getImageData(0,0,1,1).data;
  return [d[0],d[1],d[2]];
}
function bgOf(el) {
  let e = el;
  while (e && e !== document.documentElement) {
    const bg = getComputedStyle(e).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)') return bg;
    e = e.parentElement;
  }
  return 'rgb(242,235,221)'; // cream body fallback
}
`;

/* ── Result store ────────────────────────────────────────────────── */
const rows = [];

function pass(vp, state, label, ratio, fgRaw, bgRaw) {
  rows.push({ vp, state, label, ratio: +ratio.toFixed(2), ok: ratio >= AA, fgRaw, bgRaw });
  const mark = ratio >= AA ? '✓' : '✗ FAIL';
  console.log(`  [${vp}] ${state} | ${label}: ${ratio.toFixed(2)}:1 ${mark}`);
  if (ratio < AA) console.log(`         fg: ${fgRaw}   bg: ${bgRaw}`);
}

function skip(vp, state, label, note) {
  rows.push({ vp, state, label, ratio: null, ok: null, note });
  console.log(`  [${vp}] ${state} | ${label}: SKIP (${note})`);
}

/* ── Helper: measure a CSS selector's fg+bg ─────────────────────── */
async function measure(page, vp, state, label, sel) {
  const r = await page.evaluate(([s, h]) => {
    eval(h); // eslint-disable-line no-eval
    const el = document.querySelector(s);
    if (!el) return null;
    const style = getComputedStyle(el);
    return { fg: px(style.color), bg: px(bgOf(el)), fgRaw: style.color, bgRaw: bgOf(el) };
  }, [sel, HELPER]);

  if (!r) { skip(vp, state, label, `selector not found: ${sel}`); return; }
  pass(vp, state, label, cr(r.fg, r.bg), r.fgRaw, r.bgRaw);
}

/* ── Helper: scroll to section ───────────────────────────────────── */
async function scrollTo(page, id) {
  await page.evaluate(id => document.getElementById(id)
    ?.scrollIntoView({ behavior: 'instant', block: 'start' }), id);
  await page.waitForTimeout(400);
}

/* ── Helper: select a radio via JS (sr-only radios block pointer) ── */
async function jsCheck(page, name, index = 0) {
  await page.evaluate(([n, i]) => {
    const inputs = [...document.querySelectorAll(`#registration input[name="${n}"]`)];
    if (!inputs[i]) return;
    inputs[i].checked = true;
    inputs[i].dispatchEvent(new Event('change', { bubbles: true }));
  }, [name, index]);
  await page.waitForTimeout(200);
}

/* ── Helper: focus a radio via JS ───────────────────────────────── */
async function jsFocus(page, name, index = 0) {
  await page.evaluate(([n, i]) => {
    const inputs = [...document.querySelectorAll(`#registration input[name="${n}"]`)];
    inputs[i]?.focus();
  }, [name, index]);
  await page.waitForTimeout(200);
}

/* ── Helper: screenshot ─────────────────────────────────────────── */
function ss(page, vp, name) {
  return page.screenshot({ path: path.join(SS_DIR, `${vp}-${name}.png`) });
}

/* ══════════════════════════════════════════════════════════════════
   Per-viewport run
   ══════════════════════════════════════════════════════════════════ */
async function runViewport(browser, vp) {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  VIEWPORT ${vp.name}px`);
  console.log('═'.repeat(55));

  const ctx  = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    console.error('  ✗ Could not reach dev server at', BASE_URL);
    await ctx.close(); return;
  }

  await scrollTo(page, 'registration');

  /* ── 1. Team step — default ─────────────────────────────────── */
  console.log('\n  ─ Team / default ─');
  await ss(page, vp.name, '1-team-default');

  await measure(page, vp.name, 'Team/default', 'Legend "Team size"',     '#registration fieldset legend');
  await measure(page, vp.name, 'Team/default', 'Team name label',        '#registration label[for="team-name"]');
  await measure(page, vp.name, 'Team/default', 'Unselected tile number', '#registration fieldset label span');
  // Stepper: mobile shows <p> text, desktop shows <ol> labels
  await measure(page, vp.name, 'Team/default', 'Stepper text',
    vp.width >= 1024
      ? '#registration ol li:first-child span:last-child'
      : '#registration [aria-label] p');

  /* ── 2. Selected tile ───────────────────────────────────────── */
  console.log('\n  ─ Team / selected tile ─');
  await jsCheck(page, 'team-size', 0);
  await ss(page, vp.name, '2-team-tile-selected');

  const tileSel = await page.evaluate(h => {
    eval(h); // eslint-disable-line no-eval
    const inp  = document.querySelector('#registration input[name="team-size"]:checked');
    if (!inp) return null;
    const span = inp.nextElementSibling;
    if (!span) return null;
    const style = getComputedStyle(span);
    return { fg: px(style.color), bg: px(style.backgroundColor), fgRaw: style.color, bgRaw: style.backgroundColor };
  }, HELPER);

  if (!tileSel) skip(vp.name, 'Team/tile-selected', 'Number on selected tile', 'no checked radio or span');
  else pass(vp.name, 'Team/tile-selected', 'Number on selected tile',
    cr(tileSel.fg, tileSel.bg), tileSel.fgRaw, tileSel.bgRaw);

  /* ── 3. Focused tile ────────────────────────────────────────── */
  console.log('\n  ─ Team / tile focused ─');
  await jsFocus(page, 'team-size', 0);
  await ss(page, vp.name, '3-team-tile-focused');

  const focRing = await page.evaluate(h => {
    eval(h); // eslint-disable-line no-eval
    const section = document.querySelector('#registration');
    const style   = getComputedStyle(section);
    const ring    = (style.getPropertyValue('--focus-ring') || '').trim() || '#F2EBDD';
    const secBg   = style.backgroundColor;
    return { fg: px(ring), bg: px(secBg), fgRaw: ring, bgRaw: secBg };
  }, HELPER);
  pass(vp.name, 'Team/tile-focused', 'Focus ring vs section bg',
    cr(focRing.fg, focRing.bg), focRing.fgRaw, focRing.bgRaw);

  /* ── 4. Next button — hover ─────────────────────────────────── */
  console.log('\n  ─ Team / Next button hover ─');
  await page.locator('#registration input[id="team-name"]').fill('Test Team');
  const nextLoc = page.locator('#registration button').filter({ hasText: /next/i }).first();
  if (await nextLoc.count()) {
    await nextLoc.hover();
    await page.waitForTimeout(300);
    await ss(page, vp.name, '4-team-next-hover');

    const hov = await nextLoc.evaluate((el, h) => {
      eval(h); // eslint-disable-line no-eval
      const style = getComputedStyle(el);
      return { fg: px(style.color), bg: px(style.backgroundColor), fgRaw: style.color, bgRaw: style.backgroundColor };
    }, HELPER);
    pass(vp.name, 'Team/next-hover', 'Next button text on hover bg',
      cr(hov.fg, hov.bg), hov.fgRaw, hov.bgRaw);
  } else {
    skip(vp.name, 'Team/next-hover', 'Next button text on hover bg', 'button not found');
  }

  /* ── 5. Error state ─────────────────────────────────────────── */
  console.log('\n  ─ Team / error state ─');
  await page.locator('#registration input[id="team-name"]').fill('');
  if (await nextLoc.count()) await nextLoc.click();
  await page.waitForTimeout(400);
  await ss(page, vp.name, '5-team-error');

  await measure(page, vp.name, 'Team/error', 'ErrorSummary heading', '#registration [role="alert"] p');
  await measure(page, vp.name, 'Team/error', 'ErrorSummary link',    '#registration [role="alert"] a');

  /* ── 6. Advance to Participants (Stepper pills) ─────────────── */
  console.log('\n  ─ Stepper pills (advancing to step 2) ─');
  await page.locator('#registration input[id="team-name"]').fill('Test Team');
  await jsCheck(page, 'team-size', 0);
  if (await nextLoc.count()) await nextLoc.click();
  await page.waitForTimeout(400);
  await ss(page, vp.name, '6-step2-stepper');

  if (vp.width >= 1024) {
    // Done pill (step 1 — now ✓)
    const done = await page.evaluate(h => {
      eval(h); // eslint-disable-line no-eval
      const pill = document.querySelector('#registration ol li:nth-child(1) span:first-child');
      if (!pill) return null;
      const style = getComputedStyle(pill);
      return { fg: px(style.color), bg: px(style.backgroundColor), fgRaw: style.color, bgRaw: style.backgroundColor };
    }, HELPER);
    if (!done) skip(vp.name, 'Stepper/done',     'Check icon on done pill',  'pill not found');
    else pass(vp.name, 'Stepper/done',    'Check icon on done pill',
      cr(done.fg, done.bg), done.fgRaw, done.bgRaw);

    // Current pill (step 2 — orange)
    const cur = await page.evaluate(h => {
      eval(h); // eslint-disable-line no-eval
      const pill = document.querySelector('#registration ol li:nth-child(2) span:first-child');
      if (!pill) return null;
      const style = getComputedStyle(pill);
      return { fg: px(style.color), bg: px(style.backgroundColor), fgRaw: style.color, bgRaw: style.backgroundColor };
    }, HELPER);
    if (!cur) skip(vp.name, 'Stepper/current',   'Current pill "2"',  'pill not found');
    else pass(vp.name, 'Stepper/current',  'Current pill "2" on orange',
      cr(cur.fg, cur.bg), cur.fgRaw, cur.bgRaw);

    // Upcoming pill (step 3 — outlined, transparent bg → measure against section bg)
    const upcoming = await page.evaluate(h => {
      eval(h); // eslint-disable-line no-eval
      const pill    = document.querySelector('#registration ol li:nth-child(3) span:first-child');
      const section = document.querySelector('#registration');
      if (!pill) return null;
      const style = getComputedStyle(pill);
      // Pill bg is transparent; real bg is section bg
      return { fg: px(style.color), bg: px(getComputedStyle(section).backgroundColor),
               fgRaw: style.color, bgRaw: 'section-bg' };
    }, HELPER);
    if (!upcoming) skip(vp.name, 'Stepper/upcoming', 'Upcoming pill "3"', 'pill not found');
    else pass(vp.name, 'Stepper/upcoming', 'Upcoming pill "3" vs section bg',
      cr(upcoming.fg, upcoming.bg), upcoming.fgRaw, upcoming.bgRaw);
  }

  /* ── 7. Participants step ───────────────────────────────────── */
  console.log('\n  ─ Participants step ─');
  await ss(page, vp.name, '7-participants');
  await measure(page, vp.name, 'Participants', 'Participant heading', '#registration h3');
  await measure(page, vp.name, 'Participants', 'Field label',         '#registration label[for="p0-name"]');

  /* ── 8. Advance to Review ───────────────────────────────────── */
  console.log('\n  ─ Review step ─');
  // Fill participant 0
  const fill = async (id, val) => {
    const loc = page.locator(`#registration [id="${id}"]`);
    if (await loc.count()) {
      if ((await loc.getAttribute('tagName') || await loc.evaluate(e => e.tagName)) === 'SELECT') {
        await loc.selectOption({ index: 1 });
      } else {
        await loc.fill(val);
      }
    }
  };
  await fill('p0-name',     'Alice Leader');
  await fill('p0-email',    'alice@cec.ac.in');
  await fill('p0-phone',    '9876543210');
  // semester select
  const sem0 = page.locator('#registration select[id="p0-semester"]');
  if (await sem0.count()) await sem0.selectOption({ index: 1 });

  // Fill participant 1 if visible (teamSize = min = 2 or 1 tile selected)
  const p1name = page.locator('#registration input[id="p1-name"]');
  if (await p1name.count()) {
    await p1name.fill('Bob Member');
    await page.locator('#registration input[id="p1-email"]').fill('bob@cec.ac.in');
    const p1ph = page.locator('#registration input[id="p1-phone"]');
    if (await p1ph.count()) await p1ph.fill('9876543211');
    const p1sem = page.locator('#registration select[id="p1-semester"]');
    if (await p1sem.count()) await p1sem.selectOption({ index: 1 });
  }

  const nextLoc2 = page.locator('#registration button').filter({ hasText: /next|review/i }).first();
  if (await nextLoc2.count()) {
    await nextLoc2.click();
    await page.waitForTimeout(500);
  }
  await ss(page, vp.name, '8-review');
  await measure(page, vp.name, 'Review', 'Review heading', '#registration h3');
  await measure(page, vp.name, 'Review', 'Review dt',      '#registration dl dt');
  await measure(page, vp.name, 'Review', 'Review dd',      '#registration dl dd');
  // Preview notice
  await measure(page, vp.name, 'Review', 'Preview notice', '#registration [role="note"], #registration [data-preview]');

  await ctx.close();
}

/* ══════════════════════════════════════════════════════════════════
   Main
   ══════════════════════════════════════════════════════════════════ */
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
  });

  for (const vp of VIEWPORTS) {
    await runViewport(browser, vp);
  }

  await browser.close();

  /* Final report */
  console.log(`\n\n${'═'.repeat(55)}`);
  console.log('  CONTRAST AUDIT — FINAL REPORT  (WCAG AA ≥ 4.5:1)');
  console.log('═'.repeat(55));

  const fails   = rows.filter(r => r.ok === false);
  const passes  = rows.filter(r => r.ok === true);
  const skipped = rows.filter(r => r.ok === null);

  console.log(`  Checked : ${rows.length}`);
  console.log(`  ✓ Pass  : ${passes.length}`);
  console.log(`  ✗ Fail  : ${fails.length}`);
  console.log(`  — Skip  : ${skipped.length}`);

  if (fails.length) {
    console.log('\n  FAILURES:');
    fails.forEach(f =>
      console.log(`    ✗ [${f.vp}] ${f.state} | ${f.label}  ratio=${f.ratio}:1\n      fg="${f.fgRaw}"  bg="${f.bgRaw}"`)
    );
  } else {
    console.log('\n  ✓ All checks passed — 0 failures');
  }

  const report = { summary: { total: rows.length, pass: passes.length, fail: fails.length, skip: skipped.length }, rows };
  const rPath  = path.join(SS_DIR, 'contrast-report.json');
  fs.writeFileSync(rPath, JSON.stringify(report, null, 2));
  console.log(`\n  Screenshots : ${SS_DIR}`);
  console.log(`  JSON report : ${rPath}`);

  process.exit(fails.length > 0 ? 1 : 0);
})();
