import { continueRender, delayRender, staticFile } from "remotion";
// Amiri : sous-ensemble arabe + sous-ensemble latin (parenthèses, guillemets, chiffres). Sans le latin, les parenthèses
// d’un texte arabe tombent sur une autre police et ne sont plus inversées : « (ثلاثا) » s’affichait « )ثلاثا) ».
const AR_RANGE = "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC";
const LATIN_RANGE = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const RANGES: Record<string, string> = { "amiri-arabic": AR_RANGE, "amiri-latin": LATIN_RANGE };
const faces: [string, string, string][] = [
  ["DM Sans", "400", "dm-sans-latin-400-normal.woff2"], ["DM Sans", "500", "dm-sans-latin-500-normal.woff2"],
  ["DM Sans", "600", "dm-sans-latin-600-normal.woff2"], ["DM Sans", "700", "dm-sans-latin-700-normal.woff2"],
  ["Amiri", "400", "amiri-arabic-400-normal.woff2"], ["Amiri", "700", "amiri-arabic-700-normal.woff2"],
  ["Amiri", "400", "amiri-latin-400-normal.woff2"], ["Amiri", "700", "amiri-latin-700-normal.woff2"],
  ["Sora", "600", "sora-latin-600-normal.woff2"], ["Sora", "700", "sora-latin-700-normal.woff2"], ["Sora", "800", "sora-latin-800-normal.woff2"],
];
if (typeof document !== "undefined") {
  const h = delayRender("polices");
  Promise.all(faces.map(([f, w, file]) => new FontFace(f, `url(${staticFile(file)}) format("woff2")`, { weight: w, ...(RANGES[file.replace(/-\d+-normal\.woff2$/, "")] ? { unicodeRange: RANGES[file.replace(/-\d+-normal\.woff2$/, "")] } : {}) }).load().then((ff) => document.fonts.add(ff))))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}
