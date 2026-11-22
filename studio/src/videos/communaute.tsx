// Pub « Une fonction à fond : la communauté ». Sert de MODÈLE : les vidéos de la nuit suivent cette structure.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Son, starPoints, type Sfx } from "../moteur";
import voix from "../../public/voix/communaute.json";

const T = minutage(voix);
const { MOTS, L, mot } = T;
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
const Souhait: React.FC = () => <Phone ecran="ecrans/communaute-formulaire" from={L[1] - 4} to={L[2] + 2} entree="bas" sortie="gauche"
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
  return <Phone ecran="ecrans/communaute-souhait" from={L[3] - 4} to={L[4] + 2} entree="droite" sortie="traverse" focus={[{ at: L[3] + 4, px: 0.5, py: 0.5, s: 1.12 }]}>
    <div style={{ position: "absolute", left: W * 0.03, width: W * 0.31, top: H * 0.555, height: H * 0.038, borderRadius: 14, opacity: ring, boxShadow: `0 0 0 4px ${GOLD}, 0 0 40px rgba(233,196,106,0.8)` }} />
    <div style={{ position: "absolute", right: -30, top: H * 0.3, width: 200, height: 200, borderRadius: "50%", background: "rgba(42,12,34,0.95)", display: "grid", placeItems: "center", opacity: ring,
      boxShadow: `0 0 0 6px ${GOLD}, 0 0 50px rgba(233,196,106,0.6)`, fontFamily: FONT, fontWeight: 800, fontSize: 84, color: "#fff" }}>{n}</div>
    <Pastille at={mot(/^combien/)} x={W * 0.5} y={H * 0.75} gold>Tu vois combien. Jamais qui.</Pastille>
  </Phone>;
};

// ---------- 5. Une minute pour les autres ----------
const CinqPersonnes: React.FC = () => {
  const f = useCurrentFrame();
  return <Phone ecran="ecrans/communaute-accueil" from={L[4] - 4} to={L[5] + 2} entree="zoom" sortie="gauche" focus={[{ at: L[4] + 6, px: 0.5, py: 0.42, s: 1.1 }]}>
    {[0, 1, 2, 3, 4].map((i) => {
      const at = mot(/^cinq/) + i * 4, k = interpolate(f, [at, at + 6], [0, 1], C);
      return <div key={i} style={{ position: "absolute", left: W * (0.094 + i * 0.164), top: H * 0.418, width: W * 0.145, height: H * 0.008, borderRadius: 99, background: GOLD, opacity: k, boxShadow: "0 0 12px rgba(233,196,106,0.9)", transform: `scaleX(${k})`, transformOrigin: "left" }} />;
    })}
    <Pastille at={mot(/^minute/)} x={280} y={H * 0.68} gold>Une minute par jour</Pastille>
  </Phone>;
};
const MemeChose: React.FC = () => <Phone ecran="ecrans/communaute-demande" from={L[5] - 4} to={L[6] + 2} entree="droite" sortie="recul" focus={[{ at: L[5] + 4, px: 0.5, py: 0.45, s: 1.1 }]}>
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
const EtPourToi: React.FC = () => <Phone ecran="ecrans/communaute-fin" from={L[7] - 4} to={L[8] + 2} entree="bascule" sortie="traverse" focus={[{ at: L[7] + 4, px: 0.5, py: 0.45, s: 1.1 }]}>
  <Pastille at={mot(/^Et$/, 7)} x={280} y={H * 0.565} gold>Et pour toi de même</Pastille>
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

const SFX: Sfx[] = [
  ["riser", 0, 0.35], ...[0, 1, 2, 3, 4, 5].map((i) => ["pop", 14 + i * 8, 0.3] as Sfx), ["shimmer", 60, 0.6],
  ["whoosh", L[1] - 4, 0.7], ["clavier", L[1] + 8, 0.4], ["ding", mot(/^Sans$/), 0.6],
  ["whoosh", L[2] - 4, 0.6], ...DOMAINES.map(([re]) => ["impact", mot(re) + 3, 0.5] as Sfx), ["ding", mot(/^phrases/), 0.5],
  ["whoosh", L[3] - 4, 0.6], ["tick", mot(/^invoquent/), 0.5], ["coeur", mot(/^toi\./, 3), 0.7], ["pop", mot(/^combien/), 0.6],
  ["whoosh", L[4] - 4, 0.6], ...[0, 1, 2, 3, 4].map((i) => ["pop", mot(/^cinq/) + i * 4, 0.45] as Sfx),
  ["whoosh", L[5] - 4, 0.6], ["ding", mot(/^même/), 0.6],
  ["riser", L[6] - 10, 0.3], ["shimmer", mot(/^ange/), 0.6], ["shimmer", mot(/^même/, 6), 0.5],
  ["whoosh", L[7] - 4, 0.6], ["ding", mot(/^Et$/, 7), 0.6],
  ["whoosh", L[8] - 4, 0.6], ["pop", mot(/^nom,/), 0.5], ["pop", mot(/^classement/), 0.5], ...[0, 1, 2, 3].map((i) => ["tick", mot(/^Juste/) + i * 8, 0.3] as Sfx),
  ["impact", L[9], 0.8], ["shimmer", L[9] + 2, 0.7],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[6] - 6, L[6] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Convergence from={4} /></Scene>
    <Souhait />
    <Scene from={L[2] - 4} to={L[3] - 2}><Domaines /></Scene>
    <PourToi /><CinqPersonnes /><MemeChose />
    <Scene from={L[6] - 4} to={L[7] - 2}><Hadith /></Scene>
    <EtPourToi />
    <Scene from={L[8] - 4} to={L[9] - 2}><Reseau /></Scene>
    <Scene from={L[9] - 4} to={T.DUREE + 10} zin={0}><Fin /></Scene>
    <Flash at={L[6]} />
    <Flash at={L[9]} />
    <Voile />
    <SousTitres T={T} or={/^(dizaines|toi|nom|dette|mariage|maladie|combien|jamais|cinq|même|ange|frère|absence|classement|du’â|communauté|Sabab)/i} grandsDes={9} />
    <Son voix="communaute.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "communaute", component: Video, duree: T.DUREE };
