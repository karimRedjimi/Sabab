// « Le saviez-vous ? » : la du’â que le Prophète ﷺ faisait le plus souvent.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, interpolateColors, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FONT, GOLD, starPoints } from "../kit";
import voix from "./voix9.json";
import tx from "./textes9.json";

const C = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const AR = '"Amiri", serif';
const MIX = '"DM Sans", "Amiri", system-ui, sans-serif';
const PLUM = "#2A0C22";
const OFF = 6;

// ---------- Minutage : tout suit la voix ----------
type Mot = { w: string; a: number; ligne: number };
const MOTS: Mot[] = [];
const PAQUETS: { a: number; mots: number[] }[] = [];
const L: number[] = voix.lignes.map((l) => OFF + Math.round(l[0].t * 30));
voix.lignes.forEach((l, li) => {
  let cur: number[] = [], len = 0;
  l.forEach((m, wi) => {
    const a = OFF + Math.round(m.t * 30);
    if (!cur.length) PAQUETS.push({ a, mots: cur });
    MOTS.push({ w: m.w, a, ligne: li });
    cur.push(MOTS.length - 1); len += m.w.length + 1;
    const next = l[wi + 1];
    if (/[.?!:…,»]$/.test(m.w) || cur.length >= 4 || (next && len + next.w.length > 22)) { cur = []; len = 0; }
  });
});
const FIN = OFF + Math.round(voix.fin * 30);
export const DUREE_SAVIEZ = FIN + 50;
L.push(FIN);
const mot = (re: RegExp, from = 0) => { const m = MOTS.find((m, i) => i >= from && re.test(m.w.replace(/^[«\u00a0]+/, ""))); if (!m) throw new Error("mot introuvable : " + re); return m.a; };

// ---------- Sous-titres : chaque mot à l’instant où il est dit ----------
const OR = /^(souvent|seule|phrase|Anas|fréquente|ici-bas|l’au-delà|Feu|tout|prosternation|Sabab|sourcées|Enregistre)/i;
const SousTitres: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  let pi = -1;
  PAQUETS.forEach((p, i) => { if (p.a <= f) pi = i; });
  if (pi < 0) return null;
  const P = PAQUETS[pi], enter = spring({ frame: f - P.a, fps, config: { damping: 16, stiffness: 260 } });
  const actif = P.mots.filter((m) => MOTS[m].a <= f).pop();
  const fin = MOTS[P.mots[0]].ligne >= 7;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: fin ? 1210 : 1350, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px",
      transform: `translateY(${(1 - enter) * 40}px) scale(${0.92 + 0.08 * enter})`, opacity: enter }}>
      {P.mots.map((m) => {
        const M = MOTS[m], on = M.a <= f, s = spring({ frame: f - M.a, fps, config: { damping: 11, stiffness: 300 } });
        const isA = m === actif, gold = OR.test(M.w.replace(/^[« ]+/, ""));
        return (
          <span key={m} style={{ position: "relative", display: "inline-block", fontFamily: MIX, fontWeight: 700, fontSize: fin ? 96 : 80, lineHeight: 1.12, letterSpacing: "-0.02em",
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

// ---------- Fond : du désert au crépuscule, puis la nuit ----------
const STARS = Array.from({ length: 140 }, (_, i) => ({ x: random("x" + i) * 1080, y: random("y" + i) * 1920, r: 0.8 + random("r" + i) * 2.2, t: random("t" + i) * 6.28 }));
const Fond: React.FC = () => {
  const f = useCurrentFrame();
  // De la nuit bleue à l’aube, la journée en prune, puis le crépuscule et la nuit
  const k = [0, L[3] - 8, L[3] + 10, L[6] - 6, L[6] + 10, DUREE_SAVIEZ];
  const top = interpolateColors(f, k, ["#0B0A16", "#1E0A22", "#3A1236", "#3A1236", "#1E0A22", "#14050F"]);
  const mid = interpolateColors(f, k, ["#1A1222", "#3A1236", "#5B1E47", "#5B1E47", "#4E1F52", "#3A1236"]);
  const bot = interpolateColors(f, k, ["#14101A", "#5B1E47", "#C4562C", "#C4562C", "#2A0C22", "#2A0C22"]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bot} 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {STARS.map((s, i) => <circle key={i} cx={s.x} cy={(s.y - f * 0.6 + 1920) % 1920} r={s.r} fill="#fff" opacity={(0.25 + 0.4 * (0.5 + 0.5 * Math.sin(f / 9 + s.t))) * (s.y < 1200 ? 1 : 0.4)} />)}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 70% at 50% 40%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

const StarP: React.FC<{ size: number; glow?: number; fill?: string; style?: React.CSSProperties }> = ({ size, glow = 0, fill = GOLD, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 ${glow}px rgba(233,196,106,0.95))` : undefined, ...style }}>
    <polygon points={starPoints(50, 50, 46)} fill={fill} />
  </svg>
);

/** Une scène visible entre deux instants, avec une entrée et une sortie rapides. */
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode; zin?: number; zout?: number }> = ({ from, to, children, zin = 0.2, zout = 0.25 }) => {
  const f = useCurrentFrame();
  if (f < from - 1 || f > to + 1) return null;
  const i = interpolate(f, [from, from + 7], [0, 1], { ...C, easing: ease }), o = interpolate(f, [to - 7, to], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  return <AbsoluteFill style={{ opacity: i * (1 - o), transform: `scale(${(1 - zin * (1 - i)) * (1 + zout * o)})`, filter: `blur(${(1 - i) * 10 + o * 14}px)` }}>{children}</AbsoluteFill>;
};
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(255,246,220,1), rgba(233,196,106,0.6) 35%, rgba(233,196,106,0) 75%)", opacity: interpolate(f, [at - 2, at + 3, at + 22], [0, 1, 0], C) }} />;
};

// ---------- Le téléphone : plusieurs entrées, plusieurs sorties, et un zoom sur le détail ----------
type Entree = "droite" | "gauche" | "bas" | "zoom" | "iris" | "bascule";
type Sortie = "gauche" | "droite" | "bas" | "traverse" | "recul";
interface Focus { at: number; px: number; py: number; s: number; fin?: number }
const W = 560, H = Math.round((W * 2532) / 1170), PX = 540 - W / 2, PY = 130;
const Phone: React.FC<{ src: string; from: number; to: number; entree?: Entree; sortie?: Sortie; focus?: Focus[]; children?: React.ReactNode }> = ({ src, from, to, entree = "droite", sortie = "gauche", focus = [], children }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  if (f < from - 2 || f > to + 2) return null;
  const s = spring({ frame: f - from, fps, config: { damping: 16, stiffness: 120 } });
  const o = interpolate(f, [to - 9, to], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  // Entrée
  let tIn = "", clip: string | undefined, opIn = Math.min(1, s * 1.6), blurIn = 0;
  if (entree === "droite") tIn = `translateX(${(1 - s) * 950}px) rotateY(${(1 - s) * -38}deg) rotateZ(${(1 - s) * 6}deg)`;
  if (entree === "gauche") tIn = `translateX(${(1 - s) * -950}px) rotateY(${(1 - s) * 38}deg) rotateZ(${(1 - s) * -6}deg)`;
  if (entree === "bas") tIn = `translateY(${(1 - s) * 1500}px) rotateX(${(1 - s) * 30}deg)`;
  if (entree === "zoom") { const z = interpolate(f, [from, from + 12], [0, 1], { ...C, easing: ease }); tIn = `scale(${2.6 - 1.6 * z})`; opIn = z; blurIn = (1 - z) * 18; }
  if (entree === "iris") { const z = interpolate(f, [from, from + 14], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }); clip = `circle(${z * 75}% at 50% 45%)`; opIn = 1; }
  if (entree === "bascule") tIn = `rotateX(${(1 - s) * -95}deg)`;
  // Sortie
  let tOut = "", opOut = 1, blurOut = 0;
  if (sortie === "gauche") tOut = `translateX(${o * -950}px) rotateY(${o * 38}deg)`;
  if (sortie === "droite") tOut = `translateX(${o * 950}px) rotateY(${o * -38}deg)`;
  if (sortie === "bas") tOut = `translateY(${o * 1500}px) rotateZ(${o * -8}deg)`;
  if (sortie === "traverse") { tOut = `scale(${1 + o * 3})`; opOut = 1 - o; blurOut = o * 20; }
  if (sortie === "recul") { tOut = `scale(${1 - o * 0.5})`; opOut = 1 - o; }
  // Zoom sur un détail de l’écran (px, py : position relative dans l’écran)
  let z = 1, ox = 0.5, oy = 0.45;
  for (const fc of focus) {
    const k = interpolate(f, [fc.at, fc.at + 14], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }) * (fc.fin ? 1 - interpolate(f, [fc.fin, fc.fin + 12], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }) : 1);
    if (k > 0) { z = 1 + (fc.s - 1) * k; ox = fc.px; oy = fc.py; }
  }
  // La caméra : le point visé se rapproche du centre de l’image
  const cx = (PX + ox * W), cy = (PY + oy * H), dx = (540 - cx) * (z - 1) / z, dy = (640 - cy) * (z - 1) / z;
  const drift = interpolate(f, [from, to], [0, -24], C);
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2200, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${z}) translate(${dx}px, ${dy}px)` }}>
      <div style={{ position: "absolute", left: PX, top: PY + drift, width: W, height: H, transformOrigin: "50% 60%", transform: `${tIn} ${tOut}`, opacity: opIn * opOut, clipPath: clip, filter: blurIn + blurOut ? `blur(${blurIn + blurOut}px)` : undefined }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 72, overflow: "hidden", background: "#000", boxShadow: "0 0 0 12px #160812, 0 0 0 14px rgba(255,255,255,0.18), 0 60px 140px rgba(0,0,0,0.55)" }}>
          <Img src={staticFile(`ecrans3/${src}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
        {children}
      </div>
    </div>
  );
};

const Pastille: React.FC<{ at: number; x: number; y: number; children: React.ReactNode; gold?: boolean }> = ({ at, x, y, children, gold }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: Math.min(1, s * 2), whiteSpace: "nowrap",
      padding: "16px 28px", borderRadius: 999, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: gold ? PLUM : "#fff",
      background: gold ? GOLD : "rgba(42,12,34,0.92)", boxShadow: gold ? "0 0 40px rgba(233,196,106,0.8)" : "0 0 0 3px rgba(233,196,106,0.7), 0 20px 50px rgba(0,0,0,0.45)" }}>{children}</div>
  );
};
const Check: React.FC<{ at: number; x: number; y: number; size?: number }> = ({ at, x, y, size = 64 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 8, stiffness: 240 } });
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%", background: GOLD, display: "grid", placeItems: "center",
      transform: `scale(${s})`, boxShadow: "0 0 30px rgba(233,196,106,0.9)" }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke={PLUM} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </div>
  );
};

const Ligne: React.FC<{ at: number; yc: number; label: string }> = ({ at, yc, label }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 200 } });
  return (<>
    <div style={{ position: "absolute", left: W * 0.135, width: W * 0.83, top: (yc - 0.042) * H, height: 0.084 * H, borderRadius: 30, opacity: Math.min(1, s * 1.5),
      boxShadow: `0 0 0 ${5 * s}px ${GOLD}, 0 0 ${50 * s}px rgba(233,196,106,0.75)`, transform: `scale(${0.96 + 0.04 * s})` }} />
    <Check at={at + 2} x={W * 0.1} y={yc * H} size={46} />
    <div style={{ position: "absolute", right: -30, top: (yc - 0.06) * H, transform: `scale(${s})`, opacity: s, padding: "8px 18px", borderRadius: 99, background: GOLD, color: PLUM,
      fontFamily: FONT, fontWeight: 700, fontSize: 30, boxShadow: "0 0 24px rgba(233,196,106,0.8)" }}>{label}</div>
  </>);
};

// ---------- 1. L’accroche : « Le saviez-vous ? » ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 9, stiffness: 180 } });
  const q = spring({ frame: f - 10, fps, config: { damping: 6, stiffness: 160 } });
  const pulse = 1 + 0.04 * Math.sin(f / 5);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", transform: `scale(${s * pulse})` }}>
        <div style={{ display: "inline-block", padding: "18px 40px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 64, letterSpacing: "0.04em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>LE SAVIEZ-VOUS</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 520, lineHeight: 1, color: "#fff",
        transform: `scale(${q}) rotate(${(1 - q) * -40 + Math.sin(f / 8) * 4}deg)`, textShadow: "0 0 60px rgba(233,196,106,0.8)" }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Une seule phrase : un fil d’or qui se trace ----------
const UnePhrase: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const p = interpolate(f, [L[1], mot(/^phrase/) + 6], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const n = spring({ frame: f - mot(/^seule/), fps, config: { damping: 8, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 460, color: GOLD, transform: `scale(${n})`, textShadow: "0 0 80px rgba(233,196,106,0.7)" }}>1</div>
      <div style={{ position: "absolute", left: 140, top: 900, width: 800 * p, height: 10, borderRadius: 99, background: "linear-gradient(90deg,#C98A2E,#E9C46A,#FFF1C4)", boxShadow: "0 0 30px rgba(233,196,106,0.9)" }} />
      <div style={{ position: "absolute", left: 140 + 800 * p - 30, top: 875, opacity: p > 0 && p < 1 ? 1 : 0 }}><StarP size={60} glow={24} /></div>
    </AbsoluteFill>
  );
};

// ---------- 3. Le rapporteur et la source ----------
const Anas: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 140 } });
  const src = spring({ frame: f - mot(/^fréquente/), fps, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, right: 120, top: 330, padding: "60px 50px", borderRadius: 48, background: "rgba(42,12,34,0.85)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 200}px) rotateX(${(1 - s) * 40}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 38, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.1em" }}>RAPPORTÉ PAR</div>
        <div style={{ fontFamily: FONT, fontSize: 120, color: "#fff", fontWeight: 800, margin: "10px 0 20px" }}>Anas</div>
        <div style={{ fontFamily: FONT, fontSize: 40, color: "rgba(255,255,255,0.85)", lineHeight: 1.35 }}>serviteur du Prophète ﷺ</div>
      </div>
      <Pastille at={mot(/^fréquente/)} x={540} y={840} gold>Al-Bukhârî (n° 6389)</Pastille>
      <div style={{ position: "absolute", left: 540 - 50, top: 230, transform: `scale(${src})` }}><StarP size={100} glow={30} /></div>
    </AbsoluteFill>
  );
};

// ---------- 4. La du’â, en trois parts qui s’allument avec la traduction ----------
const PARTS = tx.ar.split(/ (?=وَ)/); // texte arabe inchangé, seulement découpé à l’affichage
const LaDua: React.FC<{ seuils: number[]; ph?: boolean }> = ({ seuils, ph = true }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 50, right: 50, top: 210, textAlign: "center", direction: "rtl" }}>
        {PARTS.map((p, i) => {
          const s = spring({ frame: f - seuils[i], fps, config: { damping: 14, stiffness: 160 } });
          const actif = f >= seuils[i] && (i === PARTS.length - 1 || f < seuils[i + 1]);
          return <div key={i} style={{ fontFamily: AR, fontSize: 92, lineHeight: 1.55, color: actif ? GOLD : "#fff", opacity: 0.12 + 0.88 * s, transform: `scale(${0.9 + 0.1 * s})`,
            textShadow: actif ? "0 0 40px rgba(233,196,106,0.8)" : "0 0 20px rgba(0,0,0,0.4)" }}>{p}</div>;
        })}
      </div>
      {ph && <div style={{ position: "absolute", left: 80, right: 80, top: 800, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 36, lineHeight: 1.4, color: "rgba(255,255,255,0.8)",
        opacity: interpolate(f, [seuils[0] + 10, seuils[0] + 25], [0, 1], C) }}>{tx.ph}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 30, color: GOLD,
        opacity: interpolate(f, [seuils[0] + 20, seuils[0] + 35], [0, 1], C) }}>{tx.src}</div>
    </AbsoluteFill>
  );
};

// ---------- 5. Ce monde, et l’autre : deux astres qui se rejoignent ----------
const DeuxMondes: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - mot(/^monde/), fps, config: { damping: 12, stiffness: 140 } });
  const b = spring({ frame: f - mot(/^l’autre/), fps, config: { damping: 12, stiffness: 140 } });
  const t = spring({ frame: f - mot(/^tout/), fps, config: { damping: 8, stiffness: 200 } });
  const join = interpolate(f, [mot(/^l’autre/) + 10, L[5] - 4], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const astre = (x: number, k: number, c1: string, c2: string, label: string) => (
    <div style={{ position: "absolute", left: x - 170, top: 520, width: 340, height: 340, borderRadius: "50%", transform: `scale(${k})`, opacity: k,
      background: `radial-gradient(circle at 35% 30%, ${c1}, ${c2})`, boxShadow: `0 0 90px ${c1}`, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 44, color: PLUM }}>{label}</div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 150, color: "#fff", transform: `scale(${t})`, textShadow: "0 0 50px rgba(233,196,106,0.7)" }}>TOUT</div>
      {astre(310 + 120 * join, a, "#FFE3A3", "#C98A2E", "Ici-bas")}
      {astre(770 - 120 * join, b, "#F3E9FF", "#8E6BB8", "L’au-delà")}
      <div style={{ position: "absolute", left: 540 - 60, top: 630, transform: `scale(${join})`, opacity: join }}><StarP size={120} glow={40} fill="#fff" /></div>
    </AbsoluteFill>
  );
};

// ---------- 6. Dans ta prosternation ----------
const Sujud: React.FC = () => {
  const f = useCurrentFrame();
  const r = interpolate(f, [L[5], L[6]], [0, 1], C);
  return (
    <AbsoluteFill>
      <LaDua seuils={[L[5] - 4, L[5], L[5] + 4]} ph={false} />
      {[0, 1, 2].map((i) => {
        const k = ((r * 2 + i / 3) % 1);
        return <div key={i} style={{ position: "absolute", left: 540 - 400 * k, top: 650 - 400 * k, width: 800 * k, height: 800 * k, borderRadius: "50%", border: `4px solid ${GOLD}`, opacity: (1 - k) * 0.6 }} />;
      })}
      <Pastille at={mot(/^prosternation/)} x={540} y={900} gold>{tx.moment}</Pastille>
    </AbsoluteFill>
  );
};

// ---------- 7. Dans Sabab ----------
const Biblio: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [mot(/^centaines/), mot(/^sourcées/) + 6], [1, 300], { ...C, easing: Easing.out(Easing.cubic) }));
  return <Phone src="biblio" from={L[6] - 4} to={L[7] + 2} entree="bas" sortie="traverse" focus={[{ at: L[6] + 6, px: 0.5, py: 0.55, s: 1.15 }]}>
    <Pastille at={mot(/^Sabab/) + 2} x={280} y={90} gold>« Le bien des deux mondes »</Pastille>
    <div style={{ position: "absolute", right: -50, top: 560, width: 210, height: 210, borderRadius: "50%", background: "rgba(42,12,34,0.95)", display: "grid", placeItems: "center",
      boxShadow: `0 0 0 6px ${GOLD}, 0 0 50px rgba(233,196,106,0.6)`, fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", opacity: f >= mot(/^centaines/) ? 1 : 0 }}>{n}{n >= 300 ? "+" : ""}</div>
    <Pastille at={mot(/^sourcées/)} x={280} y={1120}>Chaque source citée ✓</Pastille>
  </Phone>;
};

// ---------- 8. Enregistre : le signet, puis l’étoile Sabab ----------
const Fin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[7], fps, config: { damping: 8, stiffness: 180 } });
  const logo = spring({ frame: f - mot(/^l’oublier/), fps, config: { damping: 11, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 130, top: 280, transform: `scale(${s * (1 - 0.6 * logo)}) translateY(${-logo * 150}px)` }}>
        <svg width={260} height={320} viewBox="0 0 24 30"><path d="M3 2h18v26l-9-6-9 6z" fill={GOLD} style={{ filter: "drop-shadow(0 0 2px rgba(233,196,106,0.9))" }} /></svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", transform: `scale(${logo})`, opacity: logo }}>
        <StarP size={180} glow={50} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 120, color: "#fff", marginTop: 10 }}>Sabab</div>
      </div>
    </AbsoluteFill>
  );
};

const SFX: [string, number, number][] = [
  ["impact", 2, 0.8], ["shimmer", 10, 0.5], ["whoosh", L[1] - 4, 0.6], ["riser", L[1], 0.3], ["ding", mot(/^seule/), 0.7],
  ["whoosh", L[2] - 4, 0.6], ["pop", mot(/^fréquente/), 0.7], ["riser", L[3] - 10, 0.3], ["shimmer", L[3], 0.6],
  ["ding", mot(/^une/, MOTS.findIndex((m) => m.ligne === 3) + 5), 0.4], ["ding", mot(/^et$/, MOTS.findIndex((m) => m.ligne === 3)), 0.4],
  ["whoosh", L[4] - 4, 0.6], ["impact", mot(/^tout/), 0.7], ["pop", mot(/^monde/), 0.6], ["pop", mot(/^l’autre/), 0.6], ["shimmer", mot(/^l’autre/) + 12, 0.6],
  ["whoosh", L[5] - 4, 0.5], ["coeur", L[5] + 4, 0.7], ["ding", mot(/^prosternation/), 0.6],
  ["whoosh", L[6] - 4, 0.7], ["tick", mot(/^centaines/), 0.5], ["ding", mot(/^sourcées/), 0.6],
  ["whoosh", L[7] - 4, 0.6], ["pop", L[7] + 2, 0.8], ["impact", mot(/^l’oublier/), 0.8], ["shimmer", mot(/^l’oublier/) + 2, 0.7],
];

export const Saviez: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><UnePhrase /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Anas /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><LaDua seuils={[L[3], mot(/^une/, MOTS.findIndex((m) => m.ligne === 3) + 5), mot(/^et$/, MOTS.findIndex((m) => m.ligne === 3))]} /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><DeuxMondes /></Scene>
    <Scene from={L[5] - 4} to={L[6] - 2}><Sujud /></Scene>
    <Biblio />
    <Scene from={L[7] - 4} to={DUREE_SAVIEZ + 10} zin={0}><Fin /></Scene>
    <Flash at={L[3]} />
    <Flash at={mot(/^l’oublier/)} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,5,15,0) 62%, rgba(20,5,15,0.82) 72%, rgba(20,5,15,0.9) 100%)" }} />
    <SousTitres />
    <Sequence from={OFF}><Audio src={staticFile("voix/saviez.mp3")} /></Sequence>
    <Audio src={staticFile("sfx/ambiance.wav")} volume={0.1} />
    {SFX.map(([n, at, v], i) => <Sequence key={i} from={Math.max(0, at)}><Audio src={staticFile(`sfx-el/${n}.mp3`)} volume={v * 0.55} /></Sequence>)}
  </AbsoluteFill>
);
