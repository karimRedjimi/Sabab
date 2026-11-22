// Une fonction à fond : la communauté (invoquer les uns pour les autres, sans nom).
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, interpolateColors, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FONT, GOLD, starPoints } from "../kit";
import voix from "./voix10.json";

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
export const DUREE_COMMU = FIN + 50;
L.push(FIN);
const mot = (re: RegExp, from = 0) => { const m = MOTS.find((m, i) => i >= from && re.test(m.w.replace(/^[«\u00a0]+/, ""))); if (!m) throw new Error("mot introuvable : " + re); return m.a; };

// ---------- Sous-titres : chaque mot à l’instant où il est dit ----------
const OR = /^(dizaines|toi|nom|dette|mariage|maladie|combien|jamais|cinq|même|ange|frère|absence|classement|du’â|communauté|Sabab)/i;
const SousTitres: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  let pi = -1;
  PAQUETS.forEach((p, i) => { if (p.a <= f) pi = i; });
  if (pi < 0) return null;
  const P = PAQUETS[pi], enter = spring({ frame: f - P.a, fps, config: { damping: 16, stiffness: 260 } });
  const actif = P.mots.filter((m) => MOTS[m].a <= f).pop();
  const fin = MOTS[P.mots[0]].ligne >= 9;
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
  const k = [0, L[1] - 8, L[1] + 10, L[6] - 6, L[6] + 14, DUREE_COMMU];
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
const W = 620, H = Math.round((W * 2532) / 1170), PX = 540 - W / 2, PY = 100;
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
          <Img src={staticFile(src.includes("/") ? `${src}.png` : `ecrans3/${src}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
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

// ---------- 1. L’accroche : des dizaines d’étoiles qui convergent vers toi ----------
const N = 40;
const ETOILES = Array.from({ length: N }, (_, i) => { const a = random("a" + i) * Math.PI * 2, r = 230 + random("d" + i) * 330; return { x: 540 + Math.cos(a) * r, y: 640 + Math.sin(a) * r * 1.05, d: Math.floor(random("t" + i) * 50) }; });
const Convergence: React.FC<{ from: number; label?: string }> = ({ from, label = "toi" }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const c = spring({ frame: f - from, fps, config: { damping: 10, stiffness: 160 } });
  const allume = ETOILES.filter((e) => f >= from + 8 + e.d).length;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {ETOILES.map((e, i) => {
          const at = from + 8 + e.d, s = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 200 } });
          const p = interpolate(f, [at + 4, at + 22], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
          // une lueur qui part de chaque étoile vers le centre
          const px = e.x + (540 - e.x) * p, py = e.y + (640 - e.y) * p;
          return <g key={i}>
            <line x1={e.x} y1={e.y} x2={540} y2={640} stroke={GOLD} strokeOpacity={0.18 * s} strokeWidth={2} />
            {p > 0 && p < 1 && <circle cx={px} cy={py} r={6} fill="#FFF1C4" style={{ filter: "drop-shadow(0 0 8px rgba(233,196,106,1))" }} />}
            <polygon points={starPoints(e.x, e.y, 16 * s)} fill={GOLD} style={{ filter: "drop-shadow(0 0 10px rgba(233,196,106,0.9))" }} />
          </g>;
        })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 110, top: 640 - 110, transform: `scale(${c * (1 + allume / N * 0.35)})` }}><StarP size={220} glow={30 + allume} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 618, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 46, color: PLUM, opacity: c }}>{label}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 110, color: "#fff", opacity: allume ? 1 : 0, textShadow: "0 0 40px rgba(233,196,106,0.7)" }}>
        {allume} <span style={{ fontSize: 54, color: GOLD }}>du’â</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Déposer son souhait ----------
const Souhait: React.FC = () => <Phone src="ecrans7/formulaire" from={L[1] - 4} to={L[2] + 2} entree="bas" sortie="gauche"
  focus={[{ at: L[1] + 6, px: 0.5, py: 0.5, s: 1.1 }]}>
  <Pastille at={mot(/^Sans$/)} x={280} y={H * 0.84} gold>Ni nom, ni ville, ni contact</Pastille>
</Phone>;

// ---------- 3. Les domaines qui tombent ----------
const DOMAINES: [RegExp, string][] = [[/^dette/, "Dette"], [/^mariage/, "Mariage"], [/^maladie/, "Maladie"]];
const Domaines: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const ph = spring({ frame: f - mot(/^phrases/), fps, config: { damping: 12 } });
  return (
    <AbsoluteFill>
      {DOMAINES.map(([re, l], i) => {
        const s = spring({ frame: f - mot(re), fps, config: { damping: 9, stiffness: 160 } });
        return <div key={l} style={{ position: "absolute", left: 540, top: 330 + i * 190, transform: `translate(-50%, ${(1 - s) * -700}px) rotate(${(i - 1) * 5 * (1 - ph)}deg) scale(${1 - 0.15 * ph})`, opacity: s,
          padding: "26px 60px", borderRadius: 999, background: "rgba(42,12,34,0.95)", boxShadow: `0 0 0 4px ${GOLD}, 0 0 50px rgba(233,196,106,0.5)`, fontFamily: FONT, fontWeight: 800, fontSize: 76, color: "#fff" }}>{l}</div>;
      })}
      <div style={{ position: "absolute", left: 200, right: 200, top: 920, height: 16, borderRadius: 99, background: "rgba(255,255,255,0.15)", opacity: ph }}>
        <div style={{ width: `${ph * 100}%`, height: "100%", borderRadius: 99, background: GOLD }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. Combien, jamais qui ----------
const PourToi: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [mot(/^invoquent/), mot(/^toi\./) + 12], [0, 23], { ...C, easing: Easing.out(Easing.cubic) }));
  const ring = interpolate(f, [mot(/^invoquent/), mot(/^invoquent/) + 8], [0, 1], C);
  return <Phone src="ecrans7/souhait" from={L[3] - 4} to={L[4] + 2} entree="droite" sortie="traverse" focus={[{ at: L[3] + 4, px: 0.5, py: 0.5, s: 1.12 }]}>
    <div style={{ position: "absolute", left: W * 0.03, width: W * 0.31, top: H * 0.555, height: H * 0.038, borderRadius: 14, opacity: ring, boxShadow: `0 0 0 4px ${GOLD}, 0 0 40px rgba(233,196,106,0.8)` }} />
    <div style={{ position: "absolute", right: -30, top: H * 0.3, width: 200, height: 200, borderRadius: "50%", background: "rgba(42,12,34,0.95)", display: "grid", placeItems: "center", opacity: ring,
      boxShadow: `0 0 0 6px ${GOLD}, 0 0 50px rgba(233,196,106,0.6)`, fontFamily: FONT, fontWeight: 800, fontSize: 84, color: "#fff" }}>{n}</div>
    <Pastille at={mot(/^combien/)} x={W * 0.5} y={H * 0.75} gold>Tu vois combien. Jamais qui.</Pastille>
  </Phone>;
};

// ---------- 5. Une minute pour les autres ----------
const CinqPersonnes: React.FC = () => {
  const f = useCurrentFrame();
  return <Phone src="ecrans7/accueil" from={L[4] - 4} to={L[5] + 2} entree="zoom" sortie="gauche" focus={[{ at: L[4] + 6, px: 0.5, py: 0.42, s: 1.1 }]}>
    {[0, 1, 2, 3, 4].map((i) => {
      const at = mot(/^cinq/) + i * 4, k = interpolate(f, [at, at + 6], [0, 1], C);
      return <div key={i} style={{ position: "absolute", left: W * (0.094 + i * 0.164), top: H * 0.418, width: W * 0.145, height: H * 0.008, borderRadius: 99, background: GOLD, opacity: k, boxShadow: "0 0 12px rgba(233,196,106,0.9)", transform: `scaleX(${k})`, transformOrigin: "left" }} />;
    })}
    <Pastille at={mot(/^minute/)} x={280} y={H * 0.68} gold>Une minute par jour</Pastille>
  </Phone>;
};
const MemeChose: React.FC = () => <Phone src="ecrans7/demande" from={L[5] - 4} to={L[6] + 2} entree="droite" sortie="recul" focus={[{ at: L[5] + 4, px: 0.5, py: 0.45, s: 1.1 }]}>
  <div style={{ position: "absolute", left: W * 0.08, width: W * 0.84, top: H * 0.447, height: H * 0.058, borderRadius: 16, boxShadow: `0 0 0 4px ${GOLD}, 0 0 40px rgba(233,196,106,0.7)`,
    opacity: interpolate(useCurrentFrame(), [mot(/^même/), mot(/^même/) + 6], [0, 1], C) }} />
</Phone>;

// ---------- 6. Le hadith ----------
const H_TXT = "« Il n’est pas un musulman qui invoque pour son frère en son absence sans qu’un ange ne dise : et pour toi de même. »";
const Hadith: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[6], fps, config: { damping: 14, stiffness: 120 } });
  const debut = MOTS.findIndex((m) => m.ligne === 6 && /Il/.test(m.w));
  const mots = H_TXT.split(" ");
  const ange = spring({ frame: f - mot(/^ange/), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 60, top: 170, transform: `scale(${ange}) rotate(${f}deg)` }}><StarP size={120} glow={40} fill="#fff" /></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 320, padding: "56px 44px", borderRadius: 44, background: "rgba(42,12,34,0.88)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        opacity: s, transform: `translateY(${(1 - s) * 120}px)`, fontFamily: FONT, fontSize: 64, lineHeight: 1.38, fontWeight: 700, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
        {mots.map((w, i) => { const m = MOTS[debut + Math.max(0, i - 1)]; const on = m && f >= m.a; const fin = i >= mots.length - 4;
          return <span key={i} style={{ color: on ? (fin ? GOLD : "#fff") : undefined }}>{w} </span>; })}
        <div style={{ marginTop: 26, fontSize: 34, color: GOLD, fontWeight: 700 }}>Muslim (n° 2733)</div>
      </div>
    </AbsoluteFill>
  );
};
const EtPourToi: React.FC = () => <Phone src="ecrans7/fin" from={L[7] - 4} to={L[8] + 2} entree="bascule" sortie="traverse" focus={[{ at: L[7] + 4, px: 0.5, py: 0.45, s: 1.1 }]}>
  <Pastille at={mot(/^Et$/, MOTS.findIndex((m) => m.ligne === 7))} x={280} y={H * 0.565} gold>Et pour toi de même</Pastille>
</Phone>;

// ---------- 7. Sans nom, sans classement : la constellation de la communauté ----------
const NOEUDS = Array.from({ length: 18 }, (_, i) => ({ x: 120 + random("nx" + i) * 840, y: 220 + random("ny" + i) * 860 }));
const Reseau: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[8];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {NOEUDS.map((n, i) => {
          if (!i) return null;
          const m = NOEUDS[(i * 7) % i], p = interpolate(f, [a + 4 + i * 2, a + 16 + i * 2], [0, 1], C);
          return <line key={"l" + i} x1={m.x} y1={m.y} x2={m.x + (n.x - m.x) * p} y2={m.y + (n.y - m.y) * p} stroke={GOLD} strokeOpacity={0.55} strokeWidth={3} />;
        })}
        {NOEUDS.map((n, i) => { const s = spring({ frame: f - a - i * 2, fps, config: { damping: 9, stiffness: 200 } });
          return <polygon key={i} points={starPoints(n.x, n.y, 22 * s)} fill={GOLD} style={{ filter: "drop-shadow(0 0 14px rgba(233,196,106,0.95))" }} />; })}
      </svg>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const at = mot(/^Juste/) + i * 4, k = interpolate(f, [at, at + 22], [0, 1], C), n = NOEUDS[i * 2 + 1];
        return <div key={i} style={{ position: "absolute", left: n.x + 18, top: n.y - 40 - k * 80, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: GOLD, opacity: k > 0 ? 1 - k : 0 }}>+1</div>;
      })}
      <Pastille at={mot(/^nom,/)} x={330} y={1150}>Sans nom</Pastille>
      <Pastille at={mot(/^classement/)} x={720} y={1150}>Sans classement</Pastille>
    </AbsoluteFill>
  );
};
const Fin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const logo = spring({ frame: f - L[9], fps, config: { damping: 11, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", transform: `scale(${logo})`, opacity: logo }}>
        <StarP size={200} glow={50} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 130, color: "#fff", marginTop: 10 }}>Sabab</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: GOLD, marginTop: 6 }}>Invoquer les uns pour les autres</div>
      </div>
    </AbsoluteFill>
  );
};

const SFX: [string, number, number][] = [
  ["riser", 0, 0.35], ...[0, 1, 2, 3, 4, 5].map((i) => ["pop", 14 + i * 8, 0.3] as [string, number, number]), ["shimmer", 60, 0.6],
  ["whoosh", L[1] - 4, 0.7], ["clavier", L[1] + 8, 0.4], ["ding", mot(/^Sans$/), 0.6],
  ["whoosh", L[2] - 4, 0.6], ...DOMAINES.map(([re]) => ["impact", mot(re) + 3, 0.5] as [string, number, number]), ["ding", mot(/^phrases/), 0.5],
  ["whoosh", L[3] - 4, 0.6], ["tick", mot(/^invoquent/), 0.5], ["coeur", mot(/^toi\./, MOTS.findIndex((m) => m.ligne === 3)), 0.7], ["pop", mot(/^combien/), 0.6],
  ["whoosh", L[4] - 4, 0.6], ...[0, 1, 2, 3, 4].map((i) => ["pop", mot(/^cinq/) + i * 4, 0.45] as [string, number, number]),
  ["whoosh", L[5] - 4, 0.6], ["ding", mot(/^même/), 0.6],
  ["riser", L[6] - 10, 0.3], ["shimmer", mot(/^ange/), 0.6], ["shimmer", mot(/^même/, MOTS.findIndex((m) => m.ligne === 6)), 0.5],
  ["whoosh", L[7] - 4, 0.6], ["ding", mot(/^Et$/, MOTS.findIndex((m) => m.ligne === 7)), 0.6],
  ["whoosh", L[8] - 4, 0.6], ["pop", mot(/^nom,/), 0.5], ["pop", mot(/^classement/), 0.5], ...[0, 1, 2, 3].map((i) => ["tick", mot(/^Juste/) + i * 8, 0.3] as [string, number, number]),
  ["impact", L[9], 0.8], ["shimmer", L[9] + 2, 0.7],
];

export const Commu: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond />
    <Scene from={0} to={L[1] - 2} zin={0}><Convergence from={4} /></Scene>
    <Souhait />
    <Scene from={L[2] - 4} to={L[3] - 2}><Domaines /></Scene>
    <PourToi /><CinqPersonnes /><MemeChose />
    <Scene from={L[6] - 4} to={L[7] - 2}><Hadith /></Scene>
    <EtPourToi />
    <Scene from={L[8] - 4} to={L[9] - 2}><Reseau /></Scene>
    <Scene from={L[9] - 4} to={DUREE_COMMU + 10} zin={0}><Fin /></Scene>
    <Flash at={L[6]} />
    <Flash at={L[9]} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,5,15,0) 62%, rgba(20,5,15,0.82) 72%, rgba(20,5,15,0.9) 100%)" }} />
    <SousTitres />
    <Sequence from={OFF}><Audio src={staticFile("voix/commu.mp3")} /></Sequence>
    <Audio src={staticFile("sfx/ambiance.wav")} volume={0.1} />
    {SFX.map(([n, at, v], i) => <Sequence key={i} from={Math.max(0, at)}><Audio src={staticFile(`sfx-el/${n}.mp3`)} volume={v * 0.55} /></Sequence>)}
  </AbsoluteFill>
);
