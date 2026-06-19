/**
 * Payye logo generator — "The Pivot".
 *
 * Draws a bold white "P" with an amber focus reticle (two alignment ticks
 * locked onto the stem). It depicts Payye's core mechanic: RSVP reading
 * fixated on the Optimal Recognition Point — the single highlighted pivot
 * the eye locks onto.
 *
 * Pure JS (jimp-compact, already in node_modules) so no installs are needed.
 * The geometry below is the source of truth shared with assets/logo.svg.
 *
 *   node scripts/generate-logo.js
 */
const path = require('path');
const Jimp = require('jimp-compact');

const OUT = path.join(__dirname, '..', 'assets');

// ---- Brand palette ---------------------------------------------------------
const BLUE_TOP = [0x4f, 0x8c, 0xff]; // #4F8CFF  primary
const BLUE_BOT = [0x24, 0x4c, 0xc0]; // #244CC0  deeper indigo for depth
const DARK = [0x0e, 0x11, 0x16]; // #0E1116  app background
const WHITE = [0xf7, 0xfa, 0xff]; // glyph
const AMBER = [0xff, 0xb4, 0x54]; // #FFB454  accent / ORP pivot

// ---- Geometry (fractions of the canvas, 0..1) ------------------------------
// Stem of the P.
const STEM_X = 0.365; // left edge
const STEM_W = 0.118; // width
const STEM_TOP = 0.265;
const STEM_BOT = 0.735;
const STEM_CX = STEM_X + STEM_W / 2;
// Bowl of the P (upper loop), right-half annulus joined to the stem.
const BOWL_CX = STEM_X + STEM_W; // join with stem's right edge
const BOWL_CY = 0.385;
const BOWL_RO = 0.175; // outer radius
const BOWL_T = STEM_W; // ring thickness == stem width
// Amber focus reticle ticks, centred on the stem column.
const TICK_W = 0.052;
const TICK_TOP_A = 0.125;
const TICK_TOP_B = 0.205;
const TICK_BOT_A = 0.795;
const TICK_BOT_B = 0.875;
const TICK_R = TICK_W / 2;

// ---- SDF helpers (operate in 0..1 space) -----------------------------------
function sdRoundRect(px, py, cx, cy, hx, hy, r) {
  const qx = Math.abs(px - cx) - (hx - r);
  const qy = Math.abs(py - cy) - (hy - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

// Signed distance to the white "P" (stem unioned with the bowl's right half).
function sdP(px, py) {
  const stem = sdRoundRect(
    px,
    py,
    STEM_CX,
    (STEM_TOP + STEM_BOT) / 2,
    STEM_W / 2,
    (STEM_BOT - STEM_TOP) / 2,
    STEM_W / 2
  );
  const rMid = BOWL_RO - BOWL_T / 2;
  const ring = Math.abs(Math.hypot(px - BOWL_CX, py - BOWL_CY) - rMid) - BOWL_T / 2;
  const bowl = Math.max(ring, BOWL_CX - px); // keep only the right half
  return Math.min(stem, bowl);
}

// Signed distance to the two amber reticle ticks.
function sdReticle(px, py) {
  const top = sdRoundRect(px, py, STEM_CX, (TICK_TOP_A + TICK_TOP_B) / 2, TICK_W / 2, (TICK_TOP_B - TICK_TOP_A) / 2, TICK_R);
  const bot = sdRoundRect(px, py, STEM_CX, (TICK_BOT_A + TICK_BOT_B) / 2, TICK_W / 2, (TICK_BOT_B - TICK_BOT_A) / 2, TICK_R);
  return Math.min(top, bot);
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// Composite `src` (rgb + alpha 0..1) over `dst` (rgba 0..1 alpha).
function over(dst, src, a) {
  const outA = a + dst[3] * (1 - a);
  if (outA <= 0) return [0, 0, 0, 0];
  const r = (src[0] * a + dst[0] * dst[3] * (1 - a)) / outA;
  const g = (src[1] * a + dst[1] * dst[3] * (1 - a)) / outA;
  const b = (src[2] * a + dst[2] * dst[3] * (1 - a)) / outA;
  return [r, g, b, outA];
}

/**
 * Render one square PNG.
 * opts: { size, scale, bg: 'gradient'|'dark'|'transparent', round, reticle }
 *   scale  — glyph scale about the canvas centre (1 = full geometry above)
 *   round  — corner radius fraction for the tile (only when bg has a tile)
 */
async function render(file, opts) {
  const { size, scale = 1, bg = 'gradient', round = 0, reticle = true } = opts;
  const SS = 4; // 4x4 supersampling for smooth edges
  const img = new Jimp(size, size, 0x00000000);

  const tileR = round * size;
  const cx = 0.5;
  const cy = 0.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let R = 0;
      let G = 0;
      let B = 0;
      let A = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = (x + (sx + 0.5) / SS) / size; // 0..1
          const fy = (y + (sy + 0.5) / SS) / size;

          let px = [0, 0, 0, 0]; // background rgba (0..1)
          if (bg === 'gradient' || bg === 'dark') {
            let inside = 1;
            if (tileR > 0) {
              const d = sdRoundRect(fx * size, fy * size, size / 2, size / 2, size / 2, size / 2, tileR);
              inside = d < 0 ? 1 : 0; // tile mask (already supersampled)
            }
            if (inside) {
              const base = bg === 'dark' ? DARK : mix(BLUE_TOP, BLUE_BOT, fy);
              px = [base[0] / 255, base[1] / 255, base[2] / 255, 1];
            }
          }

          // Map sample into glyph space around centre using `scale`.
          const gx = (fx - cx) / scale + cx;
          const gy = (fy - cy) / scale + cy;
          const edge = 0.6 / size / scale; // ~half a device pixel, for AA

          const dP = sdP(gx, gy);
          if (dP < edge) {
            const cov = Math.min(1, Math.max(0, 0.5 - dP / (2 * edge)));
            px = over(px, [WHITE[0] / 255, WHITE[1] / 255, WHITE[2] / 255], cov);
          }
          if (reticle) {
            const dR = sdReticle(gx, gy);
            if (dR < edge) {
              const cov = Math.min(1, Math.max(0, 0.5 - dR / (2 * edge)));
              px = over(px, [AMBER[0] / 255, AMBER[1] / 255, AMBER[2] / 255], cov);
            }
          }

          R += px[0] * px[3];
          G += px[1] * px[3];
          B += px[2] * px[3];
          A += px[3];
        }
      }
      const n = SS * SS;
      const a = A / n;
      const r = a > 0 ? R / A : 0;
      const g = a > 0 ? G / A : 0;
      const b = a > 0 ? B / A : 0;
      const hex =
        ((Math.round(r * 255) & 0xff) << 24) |
        ((Math.round(g * 255) & 0xff) << 16) |
        ((Math.round(b * 255) & 0xff) << 8) |
        (Math.round(a * 255) & 0xff);
      img.setPixelColor(hex >>> 0, x, y);
    }
  }

  const dest = path.join(OUT, file);
  await img.writeAsync(dest);
  console.log('  wrote', file, `${size}x${size}`);
}

(async () => {
  console.log('Generating Payye logo assets...');
  // App icon — full-bleed blue gradient (iOS/Android mask the corners).
  await render('icon.png', { size: 1024, bg: 'gradient', scale: 1 });
  // Android adaptive foreground — glyph only, inside the safe zone, on transparent.
  await render('adaptive-icon.png', { size: 1024, bg: 'transparent', scale: 0.62 });
  // Splash mark — glyph on transparent, centred on the dark splash background.
  await render('splash-icon.png', { size: 1024, bg: 'transparent', scale: 0.5 });
  // Web favicon — full-bleed tile.
  await render('favicon.png', { size: 48, bg: 'gradient', scale: 1 });
  // Marketing tile — rounded squircle with gradient (handy for README / stores).
  await render('logo.png', { size: 512, bg: 'gradient', scale: 1, round: 0.225 });
  console.log('Done.');
})();
