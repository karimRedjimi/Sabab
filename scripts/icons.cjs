// Génère les icônes PNG de la PWA à partir des SVG (node scripts/icons.cjs).
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const root = path.join(__dirname, "..");
  const out = [["public/icon.svg", 192, "icon-192.png"], ["public/icon.svg", 512, "icon-512.png"], ["public/icon.svg", 180, "apple-touch-icon.png"], ["scripts/icon-maskable.svg", 512, "icon-maskable-512.png"]];
  for (const [src, s, name] of out) {
    const svg = fs.readFileSync(path.join(root, src), "utf8");
    await p.setViewportSize({ width: s, height: s });
    await p.setContent(`<html><body style="margin:0">${svg.replace("<svg ", `<svg width="${s}" height="${s}" `)}</body></html>`);
    await p.screenshot({ path: path.join(root, "public/icons", name), omitBackground: true });
  }
  await b.close();
})();
