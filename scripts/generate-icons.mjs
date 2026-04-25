/**
 * Generates PNG icons from the base64 PNG embedded in icon.svg
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const svgContent = readFileSync("public/icon.svg", "utf8");

// Extract base64 PNG from the SVG <image> tag
const match = svgContent.match(/href="data:image\/png;base64,([^"]+)"/);
if (!match) {
  console.error("No base64 PNG found in SVG");
  process.exit(1);
}

const base64Data = match[1];
const pngBuffer = Buffer.from(base64Data, "base64");

mkdirSync("public/icons", { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  for (const size of sizes) {
    const outPath = `public/icons/icon-${size}.png`;
    await sharp(pngBuffer)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`✓ Generated ${outPath}`);
  }

  // Maskable icon (with padding for safe zone)
  await sharp(pngBuffer)
    .resize(410, 410, { fit: "contain", background: { r: 15, g: 15, b: 26, alpha: 1 } })
    .extend({ top: 51, bottom: 51, left: 51, right: 51, background: { r: 15, g: 15, b: 26, alpha: 1 } })
    .resize(512, 512)
    .png()
    .toFile("public/icons/icon-512-maskable.png");
  console.log("✓ Generated public/icons/icon-512-maskable.png");

  // favicon 32x32
  await sharp(pngBuffer)
    .resize(32, 32)
    .png()
    .toFile("public/icons/icon-32.png");
  console.log("✓ Generated public/icons/icon-32.png");

  console.log("\n✅ All icons generated successfully!");
}

generate().catch(console.error);
