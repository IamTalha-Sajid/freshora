// Generates public/brand/* and app/icon.png, app/apple-icon.png from the source PNGs in /public.
// Run: node scripts/build-brand-assets.js
const sharp = require("sharp");
const fs = require("fs");

const LOGO = "public/Freshora_logo-removebg-preview.png";
const ICON = "public/Freshora_icon-removebg-preview.png";
const clear = { r: 0, g: 0, b: 0, alpha: 0 };

(async () => {
  fs.mkdirSync("public/brand", { recursive: true });

  // Logo: trim transparent padding, keep a small margin.
  const logo = await sharp(LOGO).trim().extend({ top: 8, bottom: 8, left: 8, right: 8, background: clear }).png().toBuffer();
  await sharp(logo).resize({ width: 960 }).png().toFile("public/brand/logo.png");

  // Dark-mode logo: recolor the dark navy letters to near-white; the teal/mint mark and letters stay.
  const { data, info } = await sharp("public/brand/logo.png").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const markEnd = Math.round(info.width * 0.29); // the F mark sits left of this; only the wordmark is recolored
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    if (((i / 4) % info.width) < markEnd) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum < 90 && b >= r && Math.abs(g - b) < 60) {
      data[i] = 230;
      data[i + 1] = 244;
      data[i + 2] = 242;
    }
  }
  await sharp(data, { raw: info }).png().toFile("public/brand/logo-dark.png");

  // Icon: trim, then a square 512 canvas with padding.
  const icon = await sharp(ICON).trim().toBuffer();
  const square = await sharp(icon)
    .resize(432, 432, { fit: "contain", background: clear })
    .extend({ top: 40, bottom: 40, left: 40, right: 40, background: clear })
    .png()
    .toBuffer();
  await sharp(square).toFile("public/brand/icon.png");
  await sharp(square).resize(512, 512).toFile("app/icon.png");
  await sharp(square).resize(180, 180).flatten({ background: "#ffffff" }).png().toFile("app/apple-icon.png");

  const m = await sharp("public/brand/logo.png").metadata();
  console.log("done; logo", m.width, "x", m.height);
})();
