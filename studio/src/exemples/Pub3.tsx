// Pub n° 3 : « Attache ton chameau ». Le hadith en accroche, puis un fil d’or qui traverse l’application.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, interpolateColors, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FONT, GOLD, starPoints } from "../kit";
import voix from "./voix3.json";

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
export const DUREE_PUB3 = FIN + 50;
L.push(FIN);
const mot = (re: RegExp, from = 0) => { const m = MOTS.find((m, i) => i >= from && re.test(m.w.replace(/^[«\u00a0]+/, ""))); if (!m) throw new Error("mot introuvable : " + re); return m.a; };

// ---------- Sous-titres : chaque mot à l’instant où il est dit ----------
const OR = /^(«?journée|étape|prières|invocations|sourcées|besoin|geste|concret|inconnus|verset|étoile|suivi|chameau|Allah|Sabab|Attache)/i;
const SousTitres: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  let pi = -1;
  PAQUETS.forEach((p, i) => { if (p.a <= f) pi = i; });
  if (pi < 0) return null;
  const P = PAQUETS[pi], enter = spring({ frame: f - P.a, fps, config: { damping: 16, stiffness: 260 } });
  const actif = P.mots.filter((m) => MOTS[m].a <= f).pop();
  const fin = MOTS[P.mots[0]].ligne >= 12;
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
  const k = [0, L[3], L[3] + 14, L[12] - 6, L[12] + 10, DUREE_PUB3];
  const top = interpolateColors(f, k, ["#1E0A22", "#2A0C22", "#3A1236", "#3A1236", "#1E0A22", "#14050F"]);
  const mid = interpolateColors(f, k, ["#6E2A55", "#7A2E5E", "#5B1E47", "#5B1E47", "#6E2A55", "#3A1236"]);
  const bot = interpolateColors(f, k, ["#D9733C", "#C4562C", "#2A0C22", "#2A0C22", "#C4562C", "#2A0C22"]);
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

// ---------- 1. Le désert : la question, puis la réponse ----------
const CHAMEAU = "M20 120 L24 82 Q22 64 34 58 Q50 30 70 44 Q84 30 100 46 Q112 56 122 54 L140 40 Q146 28 150 22 Q154 16 162 18 L171 22 Q175 27 168 29 L160 31 Q154 44 150 58 Q146 70 136 74 L133 120 L127 120 L126 84 Q110 88 96 85 L93 120 L87 120 L84 85 Q60 87 48 81 L45 120 L39 120 L36 88 Q30 94 28 120 Z";
const Desert: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const rep = L[2], noeud = mot(/^Attache-la/), knot = interpolate(f, [noeud - 4, noeud + 22], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const arab = spring({ frame: f - noeud - 6, fps, config: { damping: 16 } });
  const tire = interpolate(f, [L[3] - 10, L[3] + 4], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  const lune = spring({ frame: f - 4, fps, config: { damping: 20 } });
  const zoom = interpolate(f, [0, rep], [1.08, 1], { ...C, easing: ease });
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      {/* Lune et dunes */}
      <div style={{ position: "absolute", left: 700, top: 220, width: 150, height: 150, borderRadius: "50%", boxShadow: "-34px 18px 0 0 #F6E7BC", transform: `rotate(-22deg) translateY(${(1 - lune) * 80}px)`, opacity: lune, filter: "drop-shadow(0 0 40px rgba(246,231,188,0.6))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M0 1010 Q260 900 520 990 T1080 960 V1920 H0Z" fill="#7A2E3E" opacity={0.55} />
        <path d="M0 1120 Q300 1010 600 1090 T1080 1060 V1920 H0Z" fill="#3E1228" />
        <path d="M0 1230 Q240 1160 540 1210 T1080 1190 V1920 H0Z" fill="#1A0614" />
        {/* Le chameau et le piquet */}
        <g transform="translate(240 760) scale(2.6)">
          <path d={CHAMEAU} fill="#12040D" />
        </g>
        <rect x={820} y={930} width={16} height={190} rx={6} fill="#12040D" transform={`rotate(${tire * -4} 828 1120)`} />
        {/* La corde : du cou du chameau jusqu’au piquet, puis un nœud */}
        <path d="M640 840 Q760 960 828 1000" fill="none" stroke={GOLD} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${knot} 1`}
          style={{ filter: "drop-shadow(0 0 12px rgba(233,196,106,0.9))" }} />
        <ellipse cx={828} cy={1004} rx={26} ry={12} fill="none" stroke={GOLD} strokeWidth={7} pathLength={1} strokeDasharray={`${Math.max(0, knot * 2 - 1)} 1`}
          style={{ filter: "drop-shadow(0 0 12px rgba(233,196,106,0.9))" }} />
      </svg>
      {/* La réponse en arabe, avec sa source */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: arab, transform: `translateY(${(1 - arab) * 40}px)` }}>
        <div style={{ fontFamily: AR, fontSize: 132, color: "#fff", direction: "rtl", textShadow: "0 0 40px rgba(233,196,106,0.7)" }}>اعْقِلْهَا وَتَوَكَّلْ</div>
        <div style={{ fontFamily: FONT, fontSize: 34, color: GOLD, fontWeight: 600, marginTop: 6 }}>At-Tirmidhî, n° 2517</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Le fil d’or qui file vers l’application ----------
const Fil: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[3] - 4;
  const p = interpolate(f, [a, a + 18], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const logo = spring({ frame: f - a - 14, fps, config: { damping: 11, stiffness: 140 } });
  const x = interpolate(p, [0, 1], [828, 540]), y = interpolate(p, [0, 1], [1004, 640]);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M828 1004 Q 900 700 ${x} ${y}`} fill="none" stroke={GOLD} strokeWidth={6} strokeLinecap="round" opacity={1 - logo} style={{ filter: "drop-shadow(0 0 14px rgba(233,196,106,1))" }} />
      </svg>
      <div style={{ position: "absolute", left: 540 - 150, top: 640 - 150, transform: `scale(${logo}) rotate(${(1 - logo) * -140}deg)` }}><StarP size={300} glow={50} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 150, letterSpacing: "-0.05em", color: "#fff", opacity: logo, transform: `translateY(${(1 - logo) * 40}px)` }}>Sabab</div>
    </AbsoluteFill>
  );
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

// ---------- 2. Le socle de la journée : la barre, puis chaque moment qui s’allume ----------
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
const Journee: React.FC = () => {
  const iM = MOTS.findIndex((m) => m.ligne === 4 && /^matin/.test(m.w));
  const tM = MOTS[iM].a, tJ = MOTS[iM + 1].a, tS = MOTS[iM + 2].a;
  return <Phone src="journee" from={L[4] - 6} to={L[5] + 2} entree="bas" sortie="droite"
    focus={[{ at: L[4] + 2, px: 0.5, py: 0.22, s: 1.7, fin: tM - 12 }, { at: tM - 10, px: 0.55, py: 0.52, s: 1.3 }]}>
    <Ligne at={tM} yc={0.41} label="Matin ✓" />
    <Ligne at={tJ} yc={0.52} label="Journée" />
    <Ligne at={tS} yc={0.62} label="Soir" />
  </Phone>;
};

// ---------- 3 à 9. L’application, une fonction après l’autre ----------
const Prieres: React.FC = () => <Phone src="accueil" from={L[5] - 4} to={L[6] + 2} entree="droite" sortie="traverse" focus={[{ at: L[5] + 4, px: 0.5, py: 0.36, s: 1.75 }]}>
  {[0, 1, 2, 3, 4].map((i) => <Check key={i} at={L[5] + 10 + i * 5} x={65 + i * 106} y={430} size={58} />)}
  <Pastille at={L[5] + 34} x={280} y={-40} gold>5 sur 5</Pastille>
</Phone>;
const Invocations: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [L[6] + 6, L[7] - 4], [0, 33], { ...C, easing: Easing.out(Easing.cubic) }));
  return <Phone src="lecture" from={L[6] - 2} to={L[7] + 2} entree="zoom" sortie="gauche" focus={[{ at: L[6] + 10, px: 0.5, py: 0.3, s: 1.45, fin: mot(/^sourcées/) - 10 }]}>
    <Pastille at={mot(/^sourcées/) - 2} x={-10} y={330}>Coran</Pastille>
    <Pastille at={mot(/^sourcées/) + 2} x={560} y={520}>Muslim</Pastille>
    <Pastille at={mot(/^sourcées/) + 6} x={20} y={760}>Al-Bukhârî</Pastille>
    <div style={{ position: "absolute", right: -40, top: 640, width: 170, height: 170, borderRadius: "50%", background: "rgba(42,12,34,0.95)", display: "grid", placeItems: "center",
      boxShadow: `0 0 0 6px ${GOLD}, 0 0 50px rgba(233,196,106,0.6)`, fontFamily: FONT, fontWeight: 700, fontSize: 70, color: "#fff" }}>{n}</div>
  </Phone>;
};
const Besoin: React.FC = () => <Phone src="geste" from={L[7] - 4} to={L[8] + 2} entree="droite" sortie="bas" focus={[{ at: L[7] + 8, px: 0.5, py: 0.36, s: 1.7 }]}>
  <Check at={mot(/^concret/)} x={78} y={445} size={120} />
  <Pastille at={L[7] + 8} x={280} y={-40} gold>Jour 12 · Ta dette</Pastille>
</Phone>;

const NOEUDS = Array.from({ length: 14 }, (_, i) => ({ x: 130 + random("nx" + i) * 820, y: 200 + random("ny" + i) * 900 }));
const VOEUX = ["Pour son mariage", "Pour sa mère malade", "Pour son travail", "Pour sa dette"];
const Communaute: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[8];
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
const Verset: React.FC = () => {
  const f = useCurrentFrame();
  return <Phone src="verset" from={L[9] - 4} to={L[10] + 2} entree="iris" sortie="recul" focus={[{ at: L[9] + 6, px: 0.5, py: 0.6, s: 1.5, fin: L[9] + 50 }]}>
    {[0, 1, 2].map((i) => {
      const k = ((f - L[9]) / 26 + i / 3) % 1;
      return <div key={i} style={{ position: "absolute", left: 280 - 300 * k, top: 560 - 300 * k, width: 600 * k, height: 600 * k, borderRadius: "50%", border: `4px solid ${GOLD}`, opacity: f > L[9] ? (1 - k) * 0.7 : 0 }} />;
    })}
    <div style={{ position: "absolute", left: 60, right: 60, top: 1080, height: 90, display: "flex", alignItems: "center", gap: 8 }}>
      {Array.from({ length: 26 }, (_, i) => <i key={i} style={{ flex: 1, height: `${20 + 80 * Math.abs(Math.sin(f / 3.5 + i * 0.6))}%`, borderRadius: 4, background: GOLD, boxShadow: "0 0 12px rgba(233,196,106,0.8)" }} />)}
    </div>
  </Phone>;
};
const Journal: React.FC = () => {
  const f = useCurrentFrame();
  const a = mot(/^étoile/);
  const p = interpolate(f, [a - 10, a + 10], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  return <Phone src="ciel" from={L[10] - 4} to={L[11] + 2} entree="bascule" sortie="gauche" focus={[{ at: L[10] + 6, px: 0.5, py: 0.58, s: 1.55 }]}>
    <div style={{ position: "absolute", left: interpolate(p, [0, 1], [280, 140]) - 40, top: interpolate(p, [0, 1], [1250, 520]) - 40, opacity: p < 1 ? 1 : 0 }}><StarP size={80} glow={30} /></div>
  </Phone>;
};
const Suivi: React.FC = () => {
  const f = useCurrentFrame();
  const a = L[11];
  const R = [[120, 0.92, GOLD], [92, 0.74, "#F3A9CF"], [64, 0.86, "#9FD3F2"]] as const;
  return <Phone src="suivi" from={a - 4} to={L[12] + 2} entree="droite" sortie="traverse" focus={[{ at: a + 4, px: 0.42, py: 0.22, s: 1.9, fin: a + 40 }, { at: a + 52, px: 0.5, py: 0.75, s: 1.6 }]}>
    <Pastille at={mot(/^progresse/)} x={280} y={-40} gold>▲ Fajr : 6 sur 7</Pastille>
  </Phone>;
};

// ---------- 9. La boucle se referme : le nœud devient l’étoile ----------
const Final: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[12];
  const knot = interpolate(f, [a, a + 22], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const st = spring({ frame: f - L[13] + 4, fps, config: { damping: 10, stiffness: 120 } });
  const rays = interpolate(f, [L[13] - 4, L[13] + 30], [0, 1], { ...C, easing: ease });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M540 640 C 540 470, 250 470, 250 640 C 250 810, 540 810, 540 640 C 540 470, 830 470, 830 640 C 830 810, 540 810, 540 640" fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={`${knot} 1`}
          opacity={1 - st} style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,1))" }} />
        {Array.from({ length: 36 }, (_, i) => {
          const an = (i / 36) * Math.PI * 2, r1 = 190 + rays * 150, r2 = r1 + 30 + rays * (220 + (i % 3) * 90);
          return <line key={i} x1={540 + r1 * Math.cos(an)} y1={640 + r1 * Math.sin(an)} x2={540 + r2 * Math.cos(an)} y2={640 + r2 * Math.sin(an)} stroke={GOLD} strokeWidth={4} strokeLinecap="round" strokeOpacity={f > L[13] - 4 ? 0.7 * (1 - rays) : 0} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 150, top: 640 - 150, transform: `scale(${st}) rotate(${(1 - st) * -120 + f * 0.3}deg)` }}><StarP size={300} glow={60} /></div>
    </AbsoluteFill>
  );
};

// ---------- Le son ----------
const SFX: [string, number, number][] = [
  ["riser", L[1], 0.35], ["impact", mot(/^Attache-la/), 0.9], ["shimmer", mot(/^Attache-la/) + 4, 0.5],
  ["whoosh", L[3] - 4, 0.8], ["impact", L[3] + 10, 0.7], ["shimmer", L[3] + 12, 0.5],
  ["whoosh", L[4] - 6, 0.7], ...[0, 1, 2].map((i) => ["pop", MOTS[MOTS.findIndex((m) => m.ligne === 4 && /^matin/.test(m.w)) + i].a, 0.6] as [string, number, number]),
  ["whoosh", L[5] - 6, 0.7], ...[0, 1, 2, 3, 4].map((i) => ["pop", L[5] + 10 + i * 5, 0.5] as [string, number, number]),
  ["whoosh", L[6] - 6, 0.7], ["tick", mot(/^sourcées/) - 2, 0.6], ["tick", mot(/^sourcées/) + 2, 0.6], ["tick", mot(/^sourcées/) + 6, 0.6],
  ["whoosh", L[7] - 6, 0.7], ["ding", mot(/^concret/), 0.6],
  ["whoosh", L[8] - 6, 0.7], ...[0, 1, 2, 3].map((i) => ["pop", L[8] + 10 + i * 7, 0.4] as [string, number, number]),
  ["whoosh", L[9] - 6, 0.7], ["whoosh", L[10] - 6, 0.7], ["shimmer", mot(/^étoile/), 0.6],
  ["whoosh", L[11] - 6, 0.7], ["riser", L[11] + 10, 0.3],
  ["impact", L[12], 0.8], ["impact", L[13] - 2, 1], ["shimmer", L[13], 0.7],
];

export const Pub3: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond />
    <Scene from={0} to={L[3] + 4} zin={0}><Desert /></Scene>
    <Scene from={L[3] - 6} to={L[5] + 2} zin={0}><Fil /></Scene>
    <Journee /><Prieres /><Invocations /><Besoin />
    <Scene from={L[8] - 4} to={L[9] + 2}><Communaute /></Scene>
    <Verset /><Journal /><Suivi />
    <Scene from={L[12] - 4} to={DUREE_PUB3 + 10} zin={0}><Final /></Scene>
    <Flash at={L[3] + 10} />
    <Flash at={L[13] - 2} />
    {/* Un voile sombre sous les sous-titres : ils restent lisibles même quand un écran est zoomé */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,5,15,0) 62%, rgba(20,5,15,0.82) 72%, rgba(20,5,15,0.9) 100%)" }} />
    <SousTitres />
    <Sequence from={OFF}><Audio src={staticFile("voix/pub3-guillaume.mp3")} /></Sequence>
    <Audio src={staticFile("sfx/ambiance.wav")} volume={0.1} />
    {SFX.map(([n, at, v], i) => <Sequence key={i} from={Math.max(0, at)}><Audio src={staticFile(`sfx-el/${n}.mp3`)} volume={v * 0.55} /></Sequence>)}
  </AbsoluteFill>
);
