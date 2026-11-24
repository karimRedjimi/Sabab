// Le moteur commun des pubs Sabab : minutage calé sur la voix, sous-titres mot à mot, fond, téléphone, pastilles, son.
// Chaque vidéo (src/videos/*.tsx) importe ces briques et n’écrit que ses scènes.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, interpolateColors, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FONT, GOLD, starPoints } from "./kit";

export { FONT, GOLD, starPoints };
export const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const AR = '"Amiri", serif';
export const MIX = '"DM Sans", "Amiri", system-ui, sans-serif';
export const PLUM = "#2A0C22";

// ---------- Minutage : tout suit la voix ----------
export interface Voix { lignes: { w: string; t: number }[][]; fin: number }
export type Mot = { w: string; a: number; ligne: number };
export interface Minutage {
  MOTS: Mot[]; PAQUETS: { a: number; mots: number[] }[];
  /** L[i] : l’image où commence la phrase i ; L[nombre de phrases] = fin de la voix. */
  L: number[]; FIN: number; DUREE: number;
  /** L’image où est dit le premier mot qui correspond, à partir de la phrase `ligne` (0 par défaut). */
  mot: (re: RegExp, ligne?: number) => number;
}
export function minutage(voix: Voix, off = 6, queue = 50): Minutage {
  const MOTS: Mot[] = [], PAQUETS: { a: number; mots: number[] }[] = [];
  const L = voix.lignes.map((l) => off + Math.round(l[0].t * 30));
  voix.lignes.forEach((l, li) => {
    let cur: number[] = [], len = 0;
    l.forEach((m, wi) => {
      const a = off + Math.round(m.t * 30);
      if (!cur.length) PAQUETS.push({ a, mots: cur });
      MOTS.push({ w: m.w, a, ligne: li });
      cur.push(MOTS.length - 1); len += m.w.length + 1;
      const next = l[wi + 1];
      if (/[.?!:…,»]$/.test(m.w) || cur.length >= 4 || (next && len + next.w.length > 22)) { cur = []; len = 0; }
    });
  });
  const FIN = off + Math.round(voix.fin * 30);
  L.push(FIN);
  const mot = (re: RegExp, ligne = 0) => {
    const m = MOTS.find((m) => m.ligne >= ligne && re.test(m.w.replace(/^[«  ]+/, "")));
    if (!m) throw new Error(`mot introuvable : ${re} (à partir de la phrase ${ligne})`);
    return m.a;
  };
  return { MOTS, PAQUETS, L, FIN, DUREE: FIN + queue, mot };
}

// ---------- Sous-titres : chaque mot à l’instant où il est dit ----------
/** `or` : les mots à mettre en or. `grandsDes` : à partir de cette phrase, les sous-titres sont plus grands et plus haut (la conclusion). */
export const SousTitres: React.FC<{ T: Minutage; or: RegExp; grandsDes?: number }> = ({ T, or, grandsDes = 1e9 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  let pi = -1;
  T.PAQUETS.forEach((p, i) => { if (p.a <= f) pi = i; });
  if (pi < 0) return null;
  const P = T.PAQUETS[pi], enter = spring({ frame: f - P.a, fps, config: { damping: 16, stiffness: 260 } });
  const actif = P.mots.filter((m) => T.MOTS[m].a <= f).pop();
  const fin = T.MOTS[P.mots[0]].ligne >= grandsDes;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: fin ? 1210 : 1470, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px",
      transform: `translateY(${(1 - enter) * 40}px) scale(${0.92 + 0.08 * enter})`, opacity: enter }}>
      {P.mots.map((m) => {
        const M = T.MOTS[m], on = M.a <= f, s = spring({ frame: f - M.a, fps, config: { damping: 11, stiffness: 300 } });
        const isA = m === actif, gold = or.test(M.w.replace(/^[« ]+/, ""));
        return (
          <span key={m} style={{ position: "relative", display: "inline-block", fontFamily: /\uFDFA/.test(M.w) ? AR : MIX, fontWeight: 700, fontSize: fin ? 96 : 80, lineHeight: 1.12, letterSpacing: "-0.02em",
            color: isA ? PLUM : gold ? GOLD : "#fff", opacity: on ? 1 : 0, transform: `scale(${on ? 0.6 + 0.4 * s + (isA ? 0.06 : 0) : 0.6}) translateY(${(1 - s) * 30}px)`,
            textShadow: isA ? "none" : "0 3px 0 rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.6)", padding: "0 12px", zIndex: isA ? 2 : 1 }}>
            {isA && <span style={{ position: "absolute", inset: "4px 0 2px", borderRadius: 18, background: gold ? GOLD : "#fff", zIndex: -1, boxShadow: "0 8px 30px rgba(0,0,0,0.35)" }} />}
            {M.w}
          </span>
        );
      })}
    </div>
  );
};
/** Le voile en bas de l’image, sous les sous-titres, pour qu’ils restent lisibles sur n’importe quel fond. */
export const Voile: React.FC = () => <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,5,15,0) 70%, rgba(20,5,15,0.85) 78%, rgba(20,5,15,0.92) 100%)" }} />;

// ---------- Fond : la nuit prune qui s’éclaire, avec des étoiles ----------
const STARS = Array.from({ length: 140 }, (_, i) => ({ x: random("x" + i) * 1080, y: random("y" + i) * 1920, r: 0.8 + random("r" + i) * 2.2, t: random("t" + i) * 6.28 }));
/** `k` : 6 images clés (nuit, prune, lumière, lumière, prune, nuit). Par défaut : s’éclaire au premier tiers, redescend à la fin. */
export const Fond: React.FC<{ T: Minutage; k?: number[] }> = ({ T, k }) => {
  const f = useCurrentFrame();
  const kk = k || [0, T.DUREE * 0.15, T.DUREE * 0.25, T.DUREE * 0.7, T.DUREE * 0.82, T.DUREE];
  const top = interpolateColors(f, kk, ["#0B0A16", "#1E0A22", "#3A1236", "#3A1236", "#1E0A22", "#14050F"]);
  const mid = interpolateColors(f, kk, ["#1A1222", "#3A1236", "#5B1E47", "#5B1E47", "#4E1F52", "#3A1236"]);
  const bot = interpolateColors(f, kk, ["#14101A", "#5B1E47", "#C4562C", "#C4562C", "#2A0C22", "#2A0C22"]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bot} 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {STARS.map((s, i) => <circle key={i} cx={s.x} cy={(s.y - f * 0.6 + 1920) % 1920} r={s.r} fill="#fff" opacity={(0.25 + 0.4 * (0.5 + 0.5 * Math.sin(f / 9 + s.t))) * (s.y < 1200 ? 1 : 0.4)} />)}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 70% at 50% 40%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

export const StarP: React.FC<{ size: number; glow?: number; fill?: string; style?: React.CSSProperties }> = ({ size, glow = 0, fill = GOLD, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 ${glow}px rgba(233,196,106,0.95))` : undefined, ...style }}>
    <polygon points={starPoints(50, 50, 46)} fill={fill} />
  </svg>
);

/** Une scène visible entre deux instants, avec une entrée et une sortie rapides. */
export const Scene: React.FC<{ from: number; to: number; children: React.ReactNode; zin?: number; zout?: number }> = ({ from, to, children, zin = 0.2, zout = 0.25 }) => {
  const f = useCurrentFrame();
  if (f < from - 1 || f > to + 1) return null;
  const i = interpolate(f, [from, from + 7], [0, 1], { ...C, easing: ease }), o = interpolate(f, [to - 7, to], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  return <AbsoluteFill style={{ opacity: i * (1 - o), transform: `scale(${(1 - zin * (1 - i)) * (1 + zout * o)})`, filter: `blur(${(1 - i) * 10 + o * 14}px)` }}>{children}</AbsoluteFill>;
};
export const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(255,246,220,1), rgba(233,196,106,0.6) 35%, rgba(233,196,106,0) 75%)", opacity: interpolate(f, [at - 2, at + 3, at + 22], [0, 1, 0], C) }} />;
};

// ---------- Le téléphone ----------
// Les captures font TOUJOURS 1170 × 2532 (iPhone 390 × 844 à ×3) : le cadre a exactement ce format, rien n’est rogné.
// Le zoom est plafonné à ×1,12 : l’écran reste entier et lisible. Pour montrer un détail, on le SURLIGNE, on ne zoome pas.
export type Entree = "droite" | "gauche" | "bas" | "zoom" | "iris" | "bascule";
export type Sortie = "gauche" | "droite" | "bas" | "traverse" | "recul";
export interface Focus { at: number; px: number; py: number; s?: number; fin?: number }
export const ZOOM_MAX = 1.12;
export const W = 620, H = Math.round((W * 2532) / 1170), PX = 540 - W / 2, PY = 100;
/** `ecran` : chemin dans public/ sans .png (ex. "ecrans/communaute-accueil"). Les enfants sont placés en pixels dans l’écran (0..W, 0..H). */
export const Phone: React.FC<{ ecran: string; from: number; to: number; entree?: Entree; sortie?: Sortie; focus?: Focus[]; children?: React.ReactNode }> = ({ ecran, from, to, entree = "droite", sortie = "gauche", focus = [], children }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  if (f < from - 2 || f > to + 2) return null;
  const s = spring({ frame: f - from, fps, config: { damping: 16, stiffness: 120 } });
  const o = interpolate(f, [to - 9, to], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  let tIn = "", clip: string | undefined, opIn = Math.min(1, s * 1.6), blurIn = 0;
  if (entree === "droite") tIn = `translateX(${(1 - s) * 950}px) rotateY(${(1 - s) * -38}deg) rotateZ(${(1 - s) * 6}deg)`;
  if (entree === "gauche") tIn = `translateX(${(1 - s) * -950}px) rotateY(${(1 - s) * 38}deg) rotateZ(${(1 - s) * -6}deg)`;
  if (entree === "bas") tIn = `translateY(${(1 - s) * 1500}px) rotateX(${(1 - s) * 30}deg)`;
  if (entree === "zoom") { const z = interpolate(f, [from, from + 12], [0, 1], { ...C, easing: ease }); tIn = `scale(${2.2 - 1.2 * z})`; opIn = z; blurIn = (1 - z) * 18; }
  if (entree === "iris") { const z = interpolate(f, [from, from + 14], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }); clip = `circle(${z * 75}% at 50% 45%)`; opIn = 1; }
  if (entree === "bascule") tIn = `rotateX(${(1 - s) * -95}deg)`;
  let tOut = "", opOut = 1, blurOut = 0;
  if (sortie === "gauche") tOut = `translateX(${o * -950}px) rotateY(${o * 38}deg)`;
  if (sortie === "droite") tOut = `translateX(${o * 950}px) rotateY(${o * -38}deg)`;
  if (sortie === "bas") tOut = `translateY(${o * 1500}px) rotateZ(${o * -8}deg)`;
  if (sortie === "traverse") { tOut = `scale(${1 + o * 3})`; opOut = 1 - o; blurOut = o * 20; }
  if (sortie === "recul") { tOut = `scale(${1 - o * 0.5})`; opOut = 1 - o; }
  let z = 1, ox = 0.5, oy = 0.45;
  for (const fc of focus) {
    const k = interpolate(f, [fc.at, fc.at + 14], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }) * (fc.fin ? 1 - interpolate(f, [fc.fin, fc.fin + 12], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }) : 1);
    if (k > 0) { z = 1 + (Math.min(fc.s ?? 1.08, ZOOM_MAX) - 1) * k; ox = fc.px; oy = fc.py; }
  }
  const cx = PX + ox * W, cy = PY + oy * H, dx = ((540 - cx) * (z - 1)) / z;
  const drift = interpolate(f, [from, to], [0, -16], C);
  // Le haut du téléphone (cadre compris) reste toujours visible, même avec un focus bas dans l’écran : jamais rogné.
  let dy = ((700 - cy) * (z - 1)) / z;
  const haut = cy + z * (PY - 16 - 14 + dy - cy);
  if (haut < 16) dy += (16 - haut) / z;
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2200, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${z}) translate(${dx}px, ${dy}px)` }}>
      <div style={{ position: "absolute", left: PX, top: PY + drift, width: W, height: H, transformOrigin: "50% 60%", transform: `${tIn} ${tOut}`, opacity: opIn * opOut, clipPath: clip, filter: blurIn + blurOut ? `blur(${blurIn + blurOut}px)` : undefined }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 72, overflow: "hidden", background: "#000", boxShadow: "0 0 0 12px #160812, 0 0 0 14px rgba(255,255,255,0.18), 0 60px 140px rgba(0,0,0,0.55)" }}>
          <Img src={staticFile(`${ecran}.png`)} style={{ width: "100%", height: "100%", objectFit: "fill" }} />
        </div>
        {children}
      </div>
    </div>
  );
};
/** Surligne une zone de l’écran, donnée en FRACTIONS de la capture (x, y, largeur, hauteur entre 0 et 1, mesurées sur l’image 1170 × 2532). */
export const Surligne: React.FC<{ at: number; x: number; y: number; w: number; h: number; fin?: number }> = ({ at, x, y, w, h, fin }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 200 } }) * (fin ? 1 - interpolate(f, [fin, fin + 8], [0, 1], C) : 1);
  return <div style={{ position: "absolute", left: x * W - 8, top: y * H - 8, width: w * W + 16, height: h * H + 16, borderRadius: 18, opacity: Math.min(1, s * 1.5),
    boxShadow: `0 0 0 ${5 * s}px ${GOLD}, 0 0 ${44 * s}px rgba(233,196,106,0.75)`, transform: `scale(${0.96 + 0.04 * s})` }} />;
};

// ---------- Les positions des textes dans les captures (studio/public/ecrans/manifeste.json) ----------
import MANIFESTE from "../public/ecrans/manifeste.json";
type Zone = { t: string; b: number[] };
/** La zone (x, y, w, h en fractions) du n-ième texte d’un écran qui correspond à `re`. Lève une erreur si introuvable : ne jamais deviner. */
export function zone(ecran: string, re: RegExp, n = 0): { x: number; y: number; w: number; h: number } {
  const nom = ecran.replace(/^ecrans\//, "");
  const zs = ((MANIFESTE as Record<string, { zones: Zone[] }>)[nom]?.zones || []).filter((z) => re.test(z.t));
  const z = zs[n];
  if (!z) throw new Error(`zone introuvable : ${re} (n° ${n}) dans ${nom} — ${zs.length} correspondance(s)`);
  return { x: z.b[0], y: z.b[1], w: z.b[2], h: z.b[3] };
}

export const Pastille: React.FC<{ at: number; x: number; y: number; children: React.ReactNode; gold?: boolean; size?: number }> = ({ at, x, y, children, gold, size = 40 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: Math.min(1, s * 2), whiteSpace: "nowrap",
      padding: "16px 28px", borderRadius: 999, fontFamily: FONT, fontWeight: 700, fontSize: size, color: gold ? PLUM : "#fff",
      background: gold ? GOLD : "rgba(42,12,34,0.92)", boxShadow: gold ? "0 0 40px rgba(233,196,106,0.8)" : "0 0 0 3px rgba(233,196,106,0.7), 0 20px 50px rgba(0,0,0,0.45)" }}>{children}</div>
  );
};
export const Check: React.FC<{ at: number; x: number; y: number; size?: number }> = ({ at, x, y, size = 64 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 8, stiffness: 240 } });
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%", background: GOLD, display: "grid", placeItems: "center",
      transform: `scale(${s})`, boxShadow: "0 0 30px rgba(233,196,106,0.9)" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke={PLUM} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </div>
  );
};
/** La fin : l’étoile et le nom Sabab, avec une phrase dessous. */
export const Logo: React.FC<{ at: number; phrase?: string }> = ({ at, phrase }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", transform: `scale(${s})`, opacity: s }}>
      <StarP size={200} glow={50} />
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 130, color: "#fff", marginTop: 10 }}>Sabab</div>
      {phrase && <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: GOLD, marginTop: 6 }}>{phrase}</div>}
    </div>
  );
};

// ---------- Le son ----------
export type Sfx = [nom: string, image: number, volume: number];
export const SONS = ["alarme", "clavier", "coeur", "ding", "envol", "impact", "message", "pop", "riser", "shimmer", "tap", "tick", "vibration", "whoosh"] as const;
/** La voix (public/voix/<fichier>), l’ambiance très basse, et les bruitages. Le volume des bruitages est déjà réduit pour laisser la voix devant. */
export const Son: React.FC<{ voix: string; sfx: Sfx[]; off?: number }> = ({ voix, sfx, off = 6 }) => (
  <>
    <Sequence from={off}><Audio src={staticFile(`voix/${voix}`)} /></Sequence>
    <Audio src={staticFile("sfx/ambiance.wav")} volume={0.1} />
    {sfx.map(([n, at, v], i) => <Sequence key={i} from={Math.max(0, Math.round(at))}><Audio src={staticFile(`sfx-el/${n}.mp3`)} volume={Math.min(1, v) * 0.5} /></Sequence>)}
  </>
);

/** Le rectangle qui englobe plusieurs zones du manifeste (ex. le titre et la ligne dessous d’une même carte). */
export function englobe(...zs: { x: number; y: number; w: number; h: number }[]) {
  const x = Math.min(...zs.map((z) => z.x)), y = Math.min(...zs.map((z) => z.y));
  return { x, y, w: Math.max(...zs.map((z) => z.x + z.w)) - x, h: Math.max(...zs.map((z) => z.y + z.h)) - y };
}
/** Le n-ième mot de la phrase `ligne` (pour caler un effet sur un mot précis sans ambiguïté). */
export const motDe = (T: Minutage, ligne: number, re: RegExp) => {
  const m = T.MOTS.find((m) => m.ligne === ligne && re.test(m.w.replace(/^[«  ]+/, "")));
  if (!m) throw new Error(`mot introuvable : ${re} dans la phrase ${ligne}`);
  return m.a;
};
