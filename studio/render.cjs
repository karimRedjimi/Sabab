// Rendu Remotion.  node render.cjs <id> still 30,120,400   → images (moitié de taille, FULL=1 pour la taille réelle) dans out/
//                  node render.cjs <id>                    → out/<id>.mp4 (brut, à passer ensuite dans qa/finaliser.sh)
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition, renderStill } = require("@remotion/renderer");
const fs = require("fs"), path = require("path");
// Le Chromium déjà installé dans le conteneur (Playwright) ; sinon Remotion utilise le sien.
const cands = ["/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"];
try { for (const d of fs.readdirSync("/opt/pw-browsers")) if (d.startsWith("chromium_headless_shell")) cands.push(`/opt/pw-browsers/${d}/chrome-headless-shell-linux64/chrome-headless-shell`); } catch {}
const browserExecutable = cands.find((p) => fs.existsSync(p)) || null;
const chromiumOptions = { gl: "swangle" };
(async () => {
  const [id, mode, frame] = process.argv.slice(2);
  fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
  const serveUrl = await bundle({ entryPoint: path.join(__dirname, "src/index.ts"), publicDir: path.join(__dirname, "public") });
  const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
  if (mode === "still") {
    for (const fr of frame.split(",")) await renderStill({ serveUrl, composition, frame: Number(fr), output: path.join(__dirname, `out/${id}-${fr}.png`), browserExecutable, chromiumOptions, scale: process.env.FULL ? 1 : 0.5 });
    console.log("images rendues");
    return;
  }
  await renderMedia({ serveUrl, composition, codec: "h264", crf: 17, outputLocation: path.join(__dirname, `out/${id}.mp4`), browserExecutable, chromiumOptions, concurrency: 4,
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`${Math.round(progress * 100)}% `); } });
  console.log("\nvidéo rendue");
})().catch((e) => { console.error(e); process.exit(1); });
