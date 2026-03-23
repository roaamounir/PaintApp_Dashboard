/** تحويل HEX إلى RGB و LAB تقريبي للعرض في المحول (فرونت إند) */
export function hexToRgb(hex) {
  hex = String(hex).replace(/^#/, "").trim();
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const n = parseInt(hex, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** تحويل RGB (0–255) إلى HEX */
export function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(Number(v)) || 0));
  const rr = clamp(r), gg = clamp(g), bb = clamp(b);
  return (rr << 16 | gg << 8 | bb).toString(16).padStart(6, "0").toUpperCase();
}

/** تحويل CMYK (0–100) إلى HEX */
export function cmykToHex(c, m, y, k) {
  const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0)) / 100;
  const cc = clamp(c), mm = clamp(m), yy = clamp(y), kk = clamp(k);
  const r = Math.round(255 * (1 - cc) * (1 - kk));
  const g = Math.round(255 * (1 - mm) * (1 - kk));
  const b = Math.round(255 * (1 - yy) * (1 - kk));
  return rgbToHex(r, g, b);
}

/** تحويل HSL (h 0–360, s 0–100, l 0–100) إلى HEX */
export function hslToHex(h, s, l) {
  const hh = ((Number(h) || 0) % 360) / 360;
  const ss = Math.max(0, Math.min(100, Number(s) || 0)) / 100;
  const ll = Math.max(0, Math.min(100, Number(l) || 0)) / 100;
  let r, g, b;
  if (ss === 0) {
    r = g = b = ll;
  } else {
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
    const p = 2 * ll - q;
    r = hue2rgb(p, q, hh + 1 / 3);
    g = hue2rgb(p, q, hh);
    b = hue2rgb(p, q, hh - 1 / 3);
  }
  return rgbToHex(r * 255, g * 255, b * 255);
}
function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/** تحويل HSV (h 0–360, s 0–100, v 0–100) إلى HEX */
export function hsvToHex(h, s, v) {
  const hh = ((Number(h) || 0) % 360) / 60;
  const ss = Math.max(0, Math.min(100, Number(s) || 0)) / 100;
  const vv = Math.max(0, Math.min(100, Number(v) || 0)) / 100;
  const c = vv * ss;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = vv - c;
  let r = 0, g = 0, b = 0;
  if (hh >= 0 && hh < 1) { r = c; g = x; b = 0; }
  else if (hh >= 1 && hh < 2) { r = x; g = c; b = 0; }
  else if (hh >= 2 && hh < 3) { r = 0; g = c; b = x; }
  else if (hh >= 3 && hh < 4) { r = 0; g = x; b = c; }
  else if (hh >= 4 && hh < 5) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/** RGB 0–1 إلى XYZ ثم إلى LAB (L 0–100, a b تقريباً -100..100) */
function rgbToLab(r, g, b) {
  const lin = (x) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  const lr = lin(r), lg = lin(g), lb = lin(b);
  let x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  let y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  let z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;
  x *= 100; y *= 100; z *= 100;
  const f = (t) => (t > 0.008856 ? Math.pow(t, 1 / 3) : t / 7.787 + 16 / 116);
  const L = 116 * f(y / 100) - 16;
  const a = 500 * (f(x / 95.047) - f(y / 100));
  const b_ = 200 * (f(y / 100) - f(z / 108.883));
  return { l: L, a, b: b_ };
}

/** تحويل LAB (L 0–100, a b تقريباً -128..127) إلى HEX */
export function labToHex(L, a, b) {
  const l = Math.max(0, Math.min(100, Number(L) || 0));
  const aa = Number(a) || 0;
  const bb = Number(b) || 0;
  const finv = (t) => (t > 0.206893034422 ? t * t * t : (t - 16 / 116) / 7.787);
  const y = (l + 16) / 116;
  const x = aa / 500 + y;
  const z = y - bb / 200;
  const X = 95.047 * finv(x);
  const Y = 100 * finv(y);
  const Z = 108.883 * finv(z);
  let r = X / 100 * 3.2404542 - Y / 100 * 1.5371385 - Z / 100 * 0.4985314;
  let g = -X / 100 * 0.9692660 + Y / 100 * 1.8760108 + Z / 100 * 0.0415560;
  let bl = X / 100 * 0.0556434 - Y / 100 * 0.2040259 + Z / 100 * 1.0572252;
  const gamma = (t) => (t <= 0.0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055);
  r = Math.round(Math.max(0, Math.min(1, gamma(r))) * 255);
  g = Math.round(Math.max(0, Math.min(1, gamma(g))) * 255);
  bl = Math.round(Math.max(0, Math.min(1, gamma(bl))) * 255);
  return rgbToHex(r, g, bl);
}

export function hexToAllFormats(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const hexNorm = String(hex).replace(/^#/, "").trim();
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  const hDeg = h * 360;
  const sPct = s * 100;
  const lPct = l * 100;
  const v = max;
  const sV = max === 0 ? 0 : (max - min) / max;
  const hsv = { h: Math.round(hDeg), s: Math.round(sV * 100), v: Math.round(v * 100) };
  const lab = rgbToLab(r, g, b);
  const labRounded = { l: Math.round(lab.l * 10) / 10, a: Math.round(lab.a * 10) / 10, b: Math.round(lab.b * 10) / 10 };
  let c = 1 - r, m = 1 - g, y = 1 - b, k = Math.min(c, m, y);
  if (k >= 1) c = m = y = 0; else { c = (c - k) / (1 - k); m = (m - k) / (1 - k); y = (y - k) / (1 - k); }
  return {
    hex: "#" + hexNorm,
    rgb: { r: rgb.r, g: rgb.g, b: rgb.b },
    cmyk: { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) },
    hsl: { h: Math.round(hDeg), s: Math.round(sPct), l: Math.round(lPct) },
    hsv,
    lab: labRounded,
  };
}

export function isValidHex(hex) {
  return hexToRgb(hex) != null;
}
