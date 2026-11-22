// « Une fonction à fond » : le journal du soir et le ciel (aucun texte religieux cité).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, H, W, minutage, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Son, Logo, zone, starPoints, type Sfx } from "../moteur";
import voix from "../../public/voix/fonction.json";

const T = minutage(voix);
const { L, mot } = T;

// ---------- 1. L’accroche : le carnet du soir, chaque ligne s’envole en étoile ----------
const LIGNES = ["Ma famille", "La santé", "Un bon repas"];
const Carnet: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, top: 520, width: 740, height: 620, borderRadius: 36, background: "#FBF4EA", transform: `rotate(-3deg) translateY(${(1 - s) * 500}px)`, opacity: s, boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", left: 60, top: 50, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: "#B0703A", letterSpacing: "0.1em" }}>CE SOIR, MERCI POUR…</div>
        {LIGNES.map((t, i) => {
          const a = 14 + i * 22, n = Math.max(0, Math.min(t.length, Math.floor((f - a) / 1.6)));
          const envol = interpolate(f, [a + 26, a + 50], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
          return <div key={i} style={{ position: "absolute", left: 60, right: 60, top: 150 + i * 140, height: 110, borderBottom: "3px solid rgba(42,12,34,0.12)" }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 66, color: PLUM, opacity: 1 - envol }}>{t.slice(0, n)}</span>
          </div>;
        })}
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {LIGNES.map((_, i) => {
          const a = 14 + i * 22, p = interpolate(f, [a + 26, a + 60], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
          if (p <= 0) return null;
          const x = 360 + i * 160 + p * (i - 1) * 120, y = 700 + i * 140 - p * (520 + i * 40);
          return <polygon key={i} points={starPoints(x, y, 18 + 26 * p)} fill={GOLD} style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.95))" }} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 2. La journée : « Clôturer ta journée · 3 questions · 30 secondes » ----------
const EJ = "ecrans/journee";
const Journee: React.FC = () => (
  <Phone ecran={EJ} from={L[1] - 4} to={L[2] + 2} entree="droite" sortie="gauche">
    <Surligne at={mot(/^clôt/, 1)} {...zone(EJ, /^Clôturer ta journée 3 questions/)} />
    <Pastille at={mot(/^trente/, 1)} x={W * 0.5} y={H * 0.88} gold>3 questions · 30 secondes</Pastille>
  </Phone>
);

// ---------- 3. Le bienfait du jour ----------
const EB = "ecrans/journal";
const Bienfait: React.FC = () => {
  const c1 = mot(/^famille/, 3), c2 = mot(/^santé/, 3), c3 = mot(/^repas/, 3), ec = mot(/écris/, 3);
  return (
    <Phone ecran={EB} from={L[2] - 4} to={L[4] + 2} entree="bascule" sortie="bas">
      <Surligne at={L[2] + 6} fin={c1 - 4} {...zone(EB, /^Pour quoi remercies-tu Allah/)} />
      <Surligne at={c1} fin={c2 - 2} {...zone(EB, /^Ma famille$/, 1)} />
      <Surligne at={c2} fin={c3 - 2} {...zone(EB, /^La santé$/)} />
      <Surligne at={c3} fin={ec - 4} {...zone(EB, /^Un bon repas$/)} />
      <Surligne at={ec} {...zone(EB, /^Ma famille$/, 0)} />
    </Phone>
  );
};

// ---------- 4. Le geste concret ----------
const EG = "ecrans/geste";
const Geste: React.FC = () => (
  <Phone ecran={EG} from={L[4] - 4} to={L[6] + 2} entree="gauche" sortie="traverse">
    <Surligne at={mot(/^pas$/, 4)} fin={mot(/^petite/, 5) - 6} {...zone(EG, /^Un pas vers ton besoin/)} />
    <Surligne at={mot(/^petite/, 5)} {...zone(EG, /^LE GESTE DU JOUR/)} />
    <Pastille at={mot(/imprévu/, 5)} x={W * 0.5} y={H * 0.55} gold>Le geste du jour, pour ton besoin</Pastille>
  </Phone>
);

// ---------- 5. Le bienfait devient une étoile (scène graphique) ----------
const Etoile: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[6], b = mot(/^étoile/, 6);
  const pill = spring({ frame: f - a, fps, config: { damping: 12, stiffness: 180 } });
  const morph = interpolate(f, [b - 8, b + 6], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const monte = interpolate(f, [b + 6, b + 30], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const ciel = Array.from({ length: 10 }, (_, i) => ({ x: 160 + random("cx" + i) * 760, y: 200 + random("cy" + i) * 380 }));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {ciel.map((c, i) => <polygon key={i} points={starPoints(c.x, c.y, 16 + (i % 3) * 5)} fill={GOLD} opacity={0.75} style={{ filter: "drop-shadow(0 0 10px rgba(233,196,106,0.9))" }} />)}
        {ciel.slice(1).map((c, i) => <line key={i} x1={ciel[i].x} y1={ciel[i].y} x2={c.x} y2={c.y} stroke={GOLD} strokeOpacity={0.25} strokeWidth={2} />)}
      </svg>
      <div style={{ position: "absolute", left: 540, top: 1000, transform: `translate(-50%, -50%) scale(${pill * (1 - morph)})`, opacity: 1 - morph, padding: "26px 60px", borderRadius: 99, background: "#FBF4EA", fontFamily: FONT, fontWeight: 800, fontSize: 72, color: PLUM, whiteSpace: "nowrap" }}>Ma famille</div>
      <div style={{ position: "absolute", left: 540 - 70, top: 1000 - 70 - monte * 560, transform: `scale(${morph * (1 - 0.4 * monte)})` }}><StarP size={140} glow={40} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 60, color: "#fff", opacity: monte }}>+1 étoile dans ton ciel</div>
    </AbsoluteFill>
  );
};

// ---------- 6. Le ciel qui se remplit ----------
const EC = "ecrans/ciel";
const Ciel: React.FC = () => (
  <Phone ecran={EC} from={L[7] - 4} to={L[8] + 2} entree="zoom" sortie="recul">
    <Surligne at={mot(/^remplit/, 7)} {...zone(EC, /^Ta journée est close 11 étoiles/)} />
    <Pastille at={mot(/^remplit/, 7) + 6} x={W * 0.5} y={H * 0.44} gold>11 bienfaits, 11 étoiles</Pastille>
  </Phone>
);

const SFX: Sfx[] = [
  ["whoosh", 2, 0.5], ["clavier", 14, 0.35], ...[0, 1, 2].map((i) => ["shimmer", 40 + i * 22, 0.35] as Sfx),
  ["whoosh", L[1] - 4, 0.6], ["ding", mot(/^clôt/, 1), 0.5], ["pop", mot(/^trente/, 1), 0.5],
  ["whoosh", L[2] - 4, 0.6], ["tick", L[2] + 6, 0.4], ["tap", mot(/^famille/, 3), 0.5], ["tap", mot(/^santé/, 3), 0.5], ["tap", mot(/^repas/, 3), 0.5], ["clavier", mot(/écris/, 3), 0.35],
  ["whoosh", L[4] - 4, 0.6], ["tick", mot(/^pas$/, 4), 0.4], ["ding", mot(/^petite/, 5), 0.5], ["pop", mot(/imprévu/, 5), 0.5],
  ["whoosh", L[6] - 4, 0.5], ["pop", L[6], 0.5], ["envol", mot(/^étoile/, 6) + 2, 0.5], ["shimmer", mot(/^étoile/, 6) + 10, 0.5],
  ["whoosh", L[7] - 4, 0.6], ["ding", mot(/^remplit/, 7), 0.5],
  ["impact", L[8], 0.7], ["shimmer", L[8] + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[6] - 6, L[6] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Carnet /></Scene>
    <Journee /><Bienfait /><Geste />
    <Scene from={L[6] - 4} to={L[7] - 2}><Etoile /></Scene>
    <Ciel />
    <Scene from={L[8] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[8]} phrase="Ta journée, une étoile à la fois" /></Scene>
    <Flash at={L[8]} />
    <Voile />
    <SousTitres T={T} or={/^(trace|donné|trois|trente|remercies|famille|santé|repas|concret|besoin|étoile|ciel|Sabab)/i} grandsDes={8} />
    <Son voix="fonction.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "fonction", component: Video, duree: T.DUREE };
