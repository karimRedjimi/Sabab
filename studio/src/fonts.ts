import { continueRender, delayRender, staticFile } from "remotion";
const faces: [string, string, string][] = [
  ["DM Sans", "400", "dm-sans-latin-400-normal.woff2"], ["DM Sans", "500", "dm-sans-latin-500-normal.woff2"],
  ["DM Sans", "600", "dm-sans-latin-600-normal.woff2"], ["DM Sans", "700", "dm-sans-latin-700-normal.woff2"],
  ["Amiri", "400", "amiri-arabic-400-normal.woff2"], ["Amiri", "700", "amiri-arabic-700-normal.woff2"],
  ["Sora", "600", "sora-latin-600-normal.woff2"], ["Sora", "700", "sora-latin-700-normal.woff2"], ["Sora", "800", "sora-latin-800-normal.woff2"],
];
if (typeof document !== "undefined") {
  const h = delayRender("polices");
  Promise.all(faces.map(([f, w, file]) => new FontFace(f, `url(${staticFile(file)}) format("woff2")`, { weight: w }).load().then((ff) => document.fonts.add(ff))))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}
