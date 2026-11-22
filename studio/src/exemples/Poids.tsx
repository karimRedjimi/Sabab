// Pub n° 3 : « Attache ton chameau ». Le hadith en accroche, puis un fil d’or qui traverse l’application.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, interpolateColors, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FONT, GOLD, starPoints } from "../kit";
import voix from "./voix8.json";
import tx from "./textes8.json";

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
export const DUREE_POIDS = FIN + 50;
L.push(FIN);
const mot = (re: RegExp, from = 0) => { const m = MOTS.find((m, i) => i >= from && re.test(m.w.replace(/^[«\u00a0]+/, ""))); if (!m) throw new Error("mot introuvable : " + re); return m.a; };

// ---------- Sous-titres : chaque mot à l’instant où il est dit ----------
const OR = /^(soucis|loyer|dettes|mariage|travail|mère|personne|souci|tristesse|alléger|accueil|prières|matin|journée|soir|Continuer|guide|accomplie|concret|sourcées|du’â|étoile|poids|seul|Sabab)/i;
const SousTitres: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  let pi = -1;
  PAQUETS.forEach((p, i) => { if (p.a <= f) pi = i; });
  if (pi < 0) return null;
  const P = PAQUETS[pi], enter = spring({ frame: f - P.a, fps, config: { damping: 16, stiffness: 260 } });
  const actif = P.mots.filter((m) => MOTS[m].a <= f).pop();
  const fin = MOTS[P.mots[0]].ligne >= 15;
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
  const k = [0, L[4], L[4] + 14, L[13] - 6, L[13] + 10, DUREE_POIDS];
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

// ---------- 1. Les pierres : chaque souci tombe et s’empile ----------
const PIERRES: { mot: RegExp; label: string; w: number; x: number }[] = [
  { mot: /^soucis/, label: "Ce soir", w: 330, x: 540 },
  { mot: /^loyer/, label: "Loyer", w: 380, x: 520 },
  { mot: /^dettes/, label: "Dettes", w: 360, x: 560 },
  { mot: /^mariage/, label: "Mariage", w: 340, x: 525 },
  { mot: /^travail/, label: "Travail", w: 310, x: 555 },
  { mot: /^mère/, label: "Maman", w: 280, x: 535 },
];
const forme = (w: number, h: number, seed: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, r = 1 + (random(`p${seed}${i}`) - 0.5) * 0.18; return [w / 2 + Math.cos(a) * (w / 2) * r, h / 2 + Math.sin(a) * (h / 2) * r]; });
  return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z";
};
const Pierre: React.FC<{ at: number; label: string; w: number; x: number; y: number; i: number; leger?: number }> = ({ at, label, w, x, y, i, leger = 0 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 140, mass: 1.4 } });
  if (f < at) return null;
  const h = 150;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - 1400 * (1 - s), width: w, height: h, transform: `rotate(${(random("r" + i) - 0.5) * 8}deg)` }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", filter: leger ? `drop-shadow(0 0 ${30 * leger}px rgba(233,196,106,0.9))` : "drop-shadow(0 18px 24px rgba(0,0,0,0.55))" }}>
        <defs><linearGradient id={"pg" + i} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={leger ? "#F6E7BC" : "#5a4a55"} /><stop offset="1" stopColor={leger ? GOLD : "#241a21"} /></linearGradient></defs>
        <path d={forme(w, h, i)} fill={`url(#pg${i})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 700, fontSize: 46, color: leger ? PLUM : "rgba(255,255,255,0.88)", letterSpacing: "0.02em" }}>{label}</div>
    </div>
  );
};
const Pierres: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const choc = MOTS.filter((m) => m.ligne <= 1).some((m) => f - m.a >= 4 && f - m.a < 9) ? 6 : 0;
  const lumiere = interpolate(f, [mot(/^alléger/) - 6, mot(/^alléger/) + 14], [0, 1], C);
  const ar = spring({ frame: f - L[3] - 6, fps, config: { damping: 16 } });
  const logo = spring({ frame: f - mot(/^petit/), fps, config: { damping: 11, stiffness: 140 } });
  let y = 1240;
  return (
    <AbsoluteFill style={{ transform: `translate(${Math.sin(f * 2.3) * choc}px, ${Math.cos(f * 1.7) * choc}px)` }}>
      <div style={{ position: "absolute", left: 140, right: 140, top: 1250, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.45)", filter: "blur(12px)" }} />
      {PIERRES.map((p, i) => { const yy = y; y -= 132; return <Pierre key={i} at={mot(p.mot) - 2} label={p.label} w={p.w} x={p.x} y={yy - 150} i={i} leger={lumiere} />; })}
      {/* L’invocation du Prophète ﷺ contre le souci, avec sa source */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 170, textAlign: "center", opacity: ar * (1 - logo), transform: `translateY(${(1 - ar) * 30}px)` }}>
        <div style={{ fontFamily: AR, fontSize: 70, lineHeight: 1.6, color: "#fff", direction: "rtl", textShadow: "0 0 30px rgba(233,196,106,0.6)" }}>{tx.ar.split("،")[0]}…</div>
        <div style={{ fontFamily: FONT, fontSize: 30, color: GOLD, fontWeight: 600, marginTop: 6 }}>{tx.src}</div>
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 900px, rgba(255,236,190,${0.55 * lumiere}), rgba(233,196,106,${0.18 * lumiere}) 30%, transparent 60%)` }} />
      <div style={{ position: "absolute", left: 540 - 110, top: 200, transform: `scale(${logo}) rotate(${(1 - logo) * -140}deg)` }}><StarP size={220} glow={50} /></div>
    </AbsoluteFill>
  );
};

// ---------- 2. L’accueil, en détail ----------
const Accueil: React.FC = () => <Phone src="accueil" from={L[5] - 6} to={L[7] + 2} entree="bas" sortie="gauche"
  focus={[{ at: L[5] + 4, px: 0.5, py: 0.2, s: 1.3, fin: L[6] - 8 }, { at: L[6] - 4, px: 0.5, py: 0.36, s: 1.75 }]}>
  <Pastille at={L[5] + 10} x={280} y={-40} gold>Ta journée, sur l’accueil</Pastille>
  {[0, 1, 2, 3, 4].map((i) => <Check key={i} at={L[6] + 8 + i * 5} x={65 + i * 106} y={430} size={58} />)}
</Phone>;
const Moments: React.FC = () => {
  const iM = MOTS.findIndex((m) => m.ligne === 7 && /^matin/.test(m.w));
  return <Phone src="journee" from={L[7] - 4} to={L[8] + 2} entree="droite" sortie="traverse" focus={[{ at: L[7], px: 0.55, py: 0.52, s: 1.3 }]}>
    <Ligne at={MOTS[iM].a} yc={0.41} label="Matin ✓" />
    <Ligne at={MOTS[iM + 2].a} yc={0.52} label="Journée" />
    <Ligne at={MOTS[iM + 4]?.a ?? MOTS[iM + 2].a + 20} yc={0.62} label="Soir" />
  </Phone>;
};
const Guide: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [L[8] + 10, L[9] - 4], [0, 33], { ...C, easing: Easing.out(Easing.cubic) }));
  return <Phone src="lecture" from={L[8] - 2} to={L[9] + 2} entree="zoom" sortie="droite" focus={[{ at: L[8] + 8, px: 0.5, py: 0.32, s: 1.4 }]}>
    <Pastille at={L[8] + 2} x={280} y={-40} gold>Continuer ›</Pastille>
    <Pastille at={mot(/^invocation$/) } x={300} y={1150}>Invocation 2 sur 6</Pastille>
    <div style={{ position: "absolute", right: -40, top: 640, width: 170, height: 170, borderRadius: "50%", background: "rgba(42,12,34,0.95)", display: "grid", placeItems: "center",
      boxShadow: `0 0 0 6px ${GOLD}, 0 0 50px rgba(233,196,106,0.6)`, fontFamily: FONT, fontWeight: 700, fontSize: 70, color: "#fff" }}>{n}</div>
  </Phone>;
};
const Barre: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const p = interpolate(f, [L[9] + 6, mot(/^accomplie/) + 4], [0.38, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const fin = spring({ frame: f - mot(/^accomplie/) - 4, fps, config: { damping: 10 } });
  return <Phone src="journee" from={L[9] - 4} to={L[10] + 2} entree="bascule" sortie="gauche" focus={[{ at: L[9], px: 0.5, py: 0.22, s: 1.75 }]}>
    {/* La barre de la journée qui se remplit, et le pourcentage */}
    <div style={{ position: "absolute", left: W * 0.118, width: W * 0.76, top: H * 0.213, height: H * 0.016, borderRadius: 99, background: "rgba(0,0,0,0.06)" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#C98A2E,#E9C46A 70%,#FFF1C4)", boxShadow: "0 0 16px rgba(233,196,106,0.9)" }} />
    </div>
    <div style={{ position: "absolute", right: W * 0.06, top: H * 0.152, padding: "4px 14px", borderRadius: 14, background: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#221A22" }}>{Math.round(p * 100)}<span style={{ fontSize: 28 }}>%</span></div>
    <Pastille at={mot(/^accomplie/) + 4} x={280} y={H * 0.33}>Journée accomplie, qu’Allah l’accepte</Pastille>
    <div style={{ position: "absolute", left: W * 0.5 - 60, top: H * 0.25 - 60, transform: `scale(${fin * 1.2})`, opacity: fin }}><StarP size={120} glow={30} /></div>
  </Phone>;
};

// ---------- 3. Le reste de l’application ----------
const Besoin: React.FC = () => <Phone src="geste" from={L[10] - 4} to={L[11] + 2} entree="droite" sortie="bas" focus={[{ at: L[10] + 8, px: 0.5, py: 0.36, s: 1.7 }]}>
  <Pastille at={L[10] + 6} x={280} y={-40} gold>Rembourser ma dette</Pastille>
  <Check at={mot(/^concret/)} x={78} y={445} size={120} />
</Phone>;
const Bibliotheque: React.FC = () => <Phone src="biblio" from={L[11] - 4} to={L[12] + 2} entree="bas" sortie="droite" focus={[{ at: L[11] + 6, px: 0.5, py: 0.5, s: 1.4 }]}>
  <Pastille at={mot(/^souci$/)} x={280} y={-40} gold>Soucis et épreuves · 28 invocations</Pastille>
</Phone>;
const NOEUDS = Array.from({ length: 14 }, (_, i) => ({ x: 130 + random("nx" + i) * 820, y: 200 + random("ny" + i) * 900 }));
const VOEUX = ["Pour son mariage", "Pour sa mère malade", "Pour son travail", "Pour sa dette"];
const Communaute: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[12];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {NOEUDS.map((n, i) => {
          if (!i) return null;
          const m = NOEUDS[(i * 5) % i], p = interpolate(f, [a + 4 + i * 2, a + 14 + i * 2], [0, 1], C);
          return <line key={"l" + i} x1={m.x} y1={m.y} x2={m.x + (n.x - m.x) * p} y2={m.y + (n.y - m.y) * p} stroke={GOLD} strokeOpacity={0.55} strokeWidth={3} />;
        })}
        {NOEUDS.map((n, i) => {
          const s = spring({ frame: f - a - i * 2, fps, config: { damping: 9, stiffness: 200 } });
          return <polygon key={i} points={starPoints(n.x, n.y, 24 * s)} fill={GOLD} style={{ filter: "drop-shadow(0 0 14px rgba(233,196,106,0.95))" }} />;
        })}
      </svg>
      {VOEUX.map((v, i) => <Pastille key={v} at={a + 10 + i * 7} x={Math.min(820, Math.max(260, NOEUDS[i * 3].x))} y={NOEUDS[i * 3].y + 70}>{v}</Pastille>)}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const at = mot(/^toi\./) + i * 3, k = interpolate(f, [at, at + 22], [0, 1], C), n = NOEUDS[i * 2 + 1];
        return <div key={i} style={{ position: "absolute", left: n.x + 20, top: n.y - 40 - k * 80, fontFamily: FONT, fontWeight: 700, fontSize: 44, color: GOLD, opacity: k > 0 ? 1 - k : 0 }}>+1</div>;
      })}
    </AbsoluteFill>
  );
};

const Journal: React.FC = () => {
  const f = useCurrentFrame();
  const a = mot(/^étoile/);
  const p = interpolate(f, [a - 10, a + 10], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  return <Phone src="ciel" from={L[13] - 4} to={L[14] + 2} entree="bascule" sortie="gauche" focus={[{ at: L[13] + 6, px: 0.5, py: 0.58, s: 1.55 }]}>
    <div style={{ position: "absolute", left: interpolate(p, [0, 1], [280, 140]) - 40, top: interpolate(p, [0, 1], [1250, 520]) - 40, opacity: p < 1 ? 1 : 0 }}><StarP size={80} glow={30} /></div>
  </Phone>;
};
const Suivi: React.FC = () => <Phone src="suivi" from={L[14] - 4} to={L[15] + 2} entree="droite" sortie="traverse" focus={[{ at: L[14] + 4, px: 0.42, py: 0.22, s: 1.9 }]}>
  <Pastille at={mot(/^Cycle/)} x={280} y={-40} gold>Cycle 2 · jour 30 sur 30</Pastille>
</Phone>;

// ---------- 4. Les pierres deviennent des marches ----------
const Marches: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[15];
  const st = spring({ frame: f - L[16] + 4, fps, config: { damping: 10, stiffness: 120 } });
  return (
    <AbsoluteFill>
      {PIERRES.map((p, i) => {
        const s = spring({ frame: f - a - i * 5, fps, config: { damping: 14, stiffness: 120 } });
        const x = 170 + i * 140, y = 1180 - i * 110;
        return <div key={i} style={{ position: "absolute", left: x - 90, top: y, width: 200, height: 90, borderRadius: 22, opacity: s, transform: `translateY(${(1 - s) * 200}px)`,
          background: "linear-gradient(180deg,#F6E7BC,#C98A2E)", boxShadow: "0 0 30px rgba(233,196,106,0.6)", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 700, fontSize: 30, color: PLUM }}>{p.label}</div>;
      })}
      <div style={{ position: "absolute", left: 540 - 150, top: 330, transform: `scale(${0.35 + st * 0.65}) rotate(${f * 0.3}deg)`, opacity: interpolate(f, [a + 20, a + 34], [0, 1], C) }}><StarP size={300} glow={60} /></div>
    </AbsoluteFill>
  );
};

// ---------- Le son ----------
const SFX: [string, number, number][] = [
  ...PIERRES.map((p) => ["impact", mot(p.mot) + 4, 0.55] as [string, number, number]),
  ["coeur", L[2], 0.9], ["coeur", L[2] + 30, 0.7], ["riser", L[3], 0.25], ["shimmer", mot(/^alléger/), 0.6], ["impact", mot(/^petit/) + 2, 0.5],
  ["whoosh", L[5] - 6, 0.7], ...[0, 1, 2, 3, 4].map((i) => ["pop", L[6] + 8 + i * 5, 0.5] as [string, number, number]),
  ["whoosh", L[7] - 4, 0.6], ["pop", MOTS.find((m) => m.ligne === 7 && /^matin/.test(m.w))!.a, 0.6],
  ["whoosh", L[8] - 2, 0.6], ["tap", L[8] + 2, 0.7], ["riser", L[9] + 6, 0.3], ["shimmer", mot(/^accomplie/) + 4, 0.7],
  ["whoosh", L[10] - 4, 0.6], ["ding", mot(/^concret/), 0.6], ["whoosh", L[11] - 4, 0.6], ["whoosh", L[12] - 4, 0.6],
  ...[0, 1, 2, 3].map((i) => ["pop", L[12] + 10 + i * 7, 0.4] as [string, number, number]),
  ["whoosh", L[13] - 4, 0.6], ["envol", mot(/^étoile/), 0.6], ["whoosh", L[14] - 4, 0.6], ["riser", L[15], 0.3],
  ["impact", L[16] - 2, 0.9], ["shimmer", L[16], 0.7],
];

export const Poids: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond />
    <Scene from={0} to={L[5] - 2} zin={0}><Pierres /></Scene>
    <Accueil /><Moments /><Guide /><Barre />
    <Besoin /><Bibliotheque />
    <Scene from={L[12] - 4} to={L[13] + 2}><Communaute /></Scene>
    <Journal /><Suivi />
    <Scene from={L[15] - 4} to={DUREE_POIDS + 10} zin={0}><Marches /></Scene>
    <Flash at={mot(/^alléger/) + 4} />
    <Flash at={L[16] - 2} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,5,15,0) 62%, rgba(20,5,15,0.82) 72%, rgba(20,5,15,0.9) 100%)" }} />
    <SousTitres />
    <Sequence from={OFF}><Audio src={staticFile("voix/poids.mp3")} /></Sequence>
    <Audio src={staticFile("sfx/ambiance.wav")} volume={0.1} />
    {SFX.map(([n, at, v], i) => <Sequence key={i} from={Math.max(0, at)}><Audio src={staticFile(`sfx-el/${n}.mp3`)} volume={v * 0.55} /></Sequence>)}
  </AbsoluteFill>
);
