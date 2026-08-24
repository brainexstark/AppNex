import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, unlinkSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const SOURCE_JPG = "public/icons/784424981_1232688668999992_835342060314426850_n.jpg";
const OUT_DIR = "public/icons";
const BG_HEX = "#0F0F1A";
const BG_RGB = { r: 15, g: 15, b: 26, alpha: 1 };

if (!existsSync(SOURCE_JPG)) {
  console.error("Source icon not found:", SOURCE_JPG);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const sourceBuffer = readFileSync(SOURCE_JPG);

const PWA_SIZES = [
  36, 48, 72, 96, 128, 144, 152, 192, 256, 384, 512,
];

const IOS_SIZES = [
  { size: 120, label: "iPhone (120x120)" },
  { size: 152, label: "iPad (152x152)" },
  { size: 167, label: "iPad Pro (167x167)" },
  { size: 180, label: "iPhone @3x (180x180)" },
];

const FAVICON_SIZES = [16, 32, 48];

console.log("Source:", SOURCE_JPG);
console.log("Output dir:", OUT_DIR);
console.log("Background:", BG_HEX);
console.log("─".repeat(60));

async function resizePng(size, fit = "contain", background = BG_RGB) {
  return sharp(sourceBuffer)
    .resize(size, size, { fit, background, kernel: "lanczos3" })
    .png({ compressionLevel: 9, quality: 100, adaptiveFiltering: true, force: true })
    .toBuffer();
}

async function resizeSquare(size) {
  return sharp(sourceBuffer)
    .resize(size, size, { fit: "cover", kernel: "lanczos3" })
    .png({ compressionLevel: 9, quality: 100, force: true })
    .toBuffer();
}

async function generateAll() {
  const tasks = [];

  for (const size of PWA_SIZES) {
    const out = `${OUT_DIR}/icon-${size}.png`;
    tasks.push(
      resizePng(size).then((buf) => {
        writeFileSync(out, buf);
        console.log(`✓ icon-${size}.png  (PWA / Android ${size}x${size})`);
      })
    );
  }

  for (const { size } of IOS_SIZES) {
    const out = `${OUT_DIR}/apple-touch-icon-${size}.png`;
    tasks.push(
      resizePng(size, "contain", BG_RGB).then((buf) => {
        writeFileSync(out, buf);
        console.log(`✓ apple-touch-icon-${size}.png  (iOS ${size}x${size})`);
      })
    );
  }

  const iosDefault = `${OUT_DIR}/apple-touch-icon.png`;
  tasks.push(
    resizePng(180).then((buf) => {
      writeFileSync(iosDefault, buf);
      console.log(`✓ apple-touch-icon.png  (iOS default 180x180)`);
    })
  );

  const iosPrecomposed = `${OUT_DIR}/apple-touch-icon-precomposed.png`;
  tasks.push(
    resizePng(180).then((buf) => {
      writeFileSync(iosPrecomposed, buf);
      console.log(`✓ apple-touch-icon-precomposed.png`);
    })
  );

  for (const size of FAVICON_SIZES) {
    const out = `${OUT_DIR}/favicon-${size}.png`;
    tasks.push(
      resizePng(size).then((buf) => {
        writeFileSync(out, buf);
        console.log(`✓ favicon-${size}.png  (${size}x${size})`);
      })
    );
  }

  await Promise.all(tasks);

  const mask512 = await sharp(sourceBuffer)
    .resize(410, 410, { fit: "contain", background: BG_RGB, kernel: "lanczos3" })
    .extend({
      top: 51, bottom: 51, left: 51, right: 51,
      background: BG_RGB,
    })
    .resize(512, 512, { fit: "fill", kernel: "lanczos3" })
    .png({ compressionLevel: 9, quality: 100, force: true })
    .toBuffer();
  writeFileSync(`${OUT_DIR}/icon-512-maskable.png`, mask512);
  console.log(`✓ icon-512-maskable.png  (maskable safe zone, 512x512)`);

  if (existsSync(`${OUT_DIR}/icon-512.png`)) {
    copyFileSync(`${OUT_DIR}/icon-512.png`, `${OUT_DIR}/icon-512-any.png`);
    console.log(`✓ icon-512-any.png  (alias, purpose: any)`);
  }

  const favicon32 = `${OUT_DIR}/icon-32.png`;
  if (existsSync(favicon32) && existsSync(`${OUT_DIR}/favicon-32.png`)) {
    copyFileSync(`${OUT_DIR}/favicon-32.png`, `${OUT_DIR}/favicon.png`);
    console.log(`✓ favicon.png  (32x32 default)`);
  }

  const winTile = await resizePng(144);
  writeFileSync(`${OUT_DIR}/mstile-144.png`, winTile);
  console.log(`✓ mstile-144.png  (Windows tile 144x144)`);

  const winTileLarge = await resizePng(310);
  writeFileSync(`${OUT_DIR}/mstile-310.png`, winTileLarge);
  console.log(`✓ mstile-310.png  (Windows tile 310x310)`);

  const winTileSquare = await resizePng(310, "cover");
  writeFileSync(`${OUT_DIR}/mstile-310x310.png`, winTileSquare);
  console.log(`✓ mstile-310x310.png  (Windows tile square 310x310)`);

  const winTileWide = await sharp(sourceBuffer)
    .resize(558, 270, { fit: "cover", kernel: "lanczos3" })
    .png({ compressionLevel: 9, quality: 100, force: true })
    .toBuffer();
  writeFileSync(`${OUT_DIR}/mstile-558x270.png`, winTileWide);
  console.log(`✓ mstile-558x270.png  (Windows wide tile)`);

  const androidAny = await resizePng(512);
  writeFileSync(`${OUT_DIR}/android-chrome-512x512.png`, androidAny);
  console.log(`✓ android-chrome-512x512.png`);

  const android192 = await resizePng(192);
  writeFileSync(`${OUT_DIR}/android-chrome-192x192.png`, android192);
  console.log(`✓ android-chrome-192x192.png`);

  const androidMask = Buffer.from(mask512);
  writeFileSync(`${OUT_DIR}/android-chrome-512x512-maskable.png`, androidMask);
  console.log(`✓ android-chrome-512x512-maskable.png`);

  console.log("\n✅ All icons generated successfully!");
  console.log("─".repeat(60));
  console.log("Sizes produced:");
  console.log("  PWA / Android:  " + PWA_SIZES.map(s => `${s}x${s}`).join(", "));
  console.log("  iOS touch:      " + IOS_SIZES.map(s => `${s.size}x${s.size}`).join(", ") + " + defaults");
  console.log("  Favicon:        " + FAVICON_SIZES.map(s => `${s}x${s}`).join(", "));
  console.log("  Windows tiles:  144, 310, 310x310, 558x270");
  console.log("  Maskable:       512x512 (with safe-zone padding)");
}

generateAll().catch((err) => {
  console.error("Icon generation failed:");
  console.error(err);
  process.exit(1);
});
