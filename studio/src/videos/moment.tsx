// « Le moment du calendrier » : ce jeudi soir commence le temps de la sourate Al-Kahf (programme.ts · kahf ; Al-Hâkim et Al-Bayhaqî, authentifié par Al-Albânî),
// et le thème du jeudi dans Sabab (la patience et la constance).
// Textes religieux : public/voix/moment.textes.json (copiés par programme depuis content/programme.ts · kahf).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/moment.json";
import tx from "../../public/voix/moment.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const K = tx.kahf;
const LIEN = mot(/^lien/, 5);

// Un livre ouvert, qui s’éclaire (l = 0 à 1).
const Livre: React.FC<{ size: number; l: number }> = ({ size, l }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 120 90" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${10 + 50 * l}px rgba(233,196,106,${0.4 + 0.6 * l}))` }}>
    <path d="M60 18 C44 8 22 8 6 14 V80 C22 74 44 74 60 84 C76 74 98 74 114 80 V14 C98 8 76 8 60 18z" fill={l > 0.5 ? "#FFF1C4" : "rgba(42,12,34,0.92)"} stroke={GOLD} strokeWidth={3} strokeLinejoin="round" />
    <path d="M60 18 V84" stroke={GOLD} strokeWidth={3} />
  </svg>
);

// ---------- 1. L’accroche : « CE JEUDI », le soleil qui se couche, la sourate ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pill = spring({ frame: f - 2, fps, config: { damping: 9, stiffness: 180 } });
  const sol = interpolate(f, [mot(/^coucher/) - 6, mot(/^soleil/) + 20], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const b = spring({ frame: f - mot(/^sourate/), fps, config: { damping: 11, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", transform: `scale(${pill})` }}>
        <span style={{ display: "inline-block", padding: "18px 44px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 64, letterSpacing: "0.06em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>CE JEUDI SOIR</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, height: 500, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 540 - 150, top: 80 + sol * 330, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,#FFF1C4,#E9C46A 55%,#E07A5F)", boxShadow: "0 0 120px rgba(233,140,90,0.8)" }} />
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 916, height: 6, borderRadius: 3, background: "rgba(255,241,196,0.7)" }} />
      <div style={{ position: "absolute", left: 540 - 120, top: 1000, transform: `scale(${b})`, opacity: b }}><Livre size={240} l={0} /></div>
    </AbsoluteFill>
  );
};

// ---------- 2. Al-Kahf : du coucher du soleil du jeudi à celui du vendredi ----------
const Fenetre: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t = spring({ frame: f - L[1], fps, config: { damping: 13, stiffness: 140 } });
  const p = interpolate(f, [mot(/^jeudi/, 1), mot(/^vendredi/, 1) + 6], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const borne = (x: number, s: number, j: string) => (
    <div style={{ position: "absolute", left: x - 140, top: 790, width: 280, textAlign: "center", opacity: s, transform: `scale(${s})` }}>
      <div style={{ width: 40, height: 40, margin: "0 auto", borderRadius: "50%", background: GOLD, boxShadow: "0 0 30px rgba(233,196,106,0.8)" }} />
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 54, color: "#fff", marginTop: 26 }}>{j}</div>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: GOLD }}>au Maghreb</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", opacity: t, transform: `translateY(${(1 - t) * 40}px)` }}>
        <Livre size={200} l={0.3} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, color: "#fff", marginTop: 20 }}>{K.title}</div>
      </div>
      <div style={{ position: "absolute", left: 200, right: 200, top: 806, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)" }} />
      <div style={{ position: "absolute", left: 200, width: 680 * p, top: 806, height: 8, borderRadius: 4, background: GOLD, boxShadow: "0 0 20px rgba(233,196,106,0.8)" }} />
      {borne(200, spring({ frame: f - mot(/^jeudi/, 1), fps, config: { damping: 10, stiffness: 180 } }), "jeudi")}
      {borne(880, spring({ frame: f - mot(/^vendredi/, 1), fps, config: { damping: 10, stiffness: 180 } }), "vendredi")}
      <div style={{ position: "absolute", left: 110, right: 110, top: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 40, lineHeight: 1.4, color: "rgba(255,255,255,0.85)", opacity: interpolate(f, [mot(/^vendredi/, 1), mot(/^vendredi/, 1) + 12], [0, 1], C) }}>{K.desc}</div>
    </AbsoluteFill>
  );
};

// ---------- 3. La lumière, d’un vendredi au suivant ----------
const JOURS = ["V", "S", "D", "L", "M", "M", "J", "V"];
const Lumiere: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const l = interpolate(f, [mot(/^éclairé/, 2) - 4, mot(/^lumière/, 2) + 10], [0, 1], C);
  const s = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 130 } });
  const sem = interpolate(f, [mot(/^jusqu’au/, 2), mot(/^suivant/, 2) + 10], [0, JOURS.length], C);
  return (
    <AbsoluteFill>
      <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 200, opacity: l }}>
        {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2 + f / 90; return <line key={i} x1={540 + Math.cos(a) * 170} y1={360 + Math.sin(a) * 140} x2={540 + Math.cos(a) * (300 + 30 * Math.sin(f / 8 + i))} y2={360 + Math.sin(a) * (260 + 30 * Math.sin(f / 8 + i))} stroke={GOLD} strokeWidth={6} strokeLinecap="round" opacity={0.6} />; })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 150, top: 450, transform: `scale(${s})`, opacity: s }}><Livre size={300} l={l} /></div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1040, display: "flex", justifyContent: "space-between" }}>
        {JOURS.map((j, i) => {
          const on = sem > i;
          return <div key={i} style={{ width: 86, height: 86, borderRadius: "50%", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 38,
            background: on ? GOLD : "rgba(255,255,255,0.12)", color: on ? PLUM : "rgba(255,255,255,0.6)", boxShadow: on ? "0 0 20px rgba(233,196,106,0.7)" : "none" }}>{j}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 140 } });
  const g = spring({ frame: f - mot(/^authentifié/, 3), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, right: 90, top: 520, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 200}px)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 34, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.12em" }}>SOURCE</div>
        <div style={{ fontFamily: FONT, fontSize: 54, color: "#fff", fontWeight: 800, lineHeight: 1.3, marginTop: 20 }}>{K.src}</div>
      </div>
      <div style={{ position: "absolute", left: 540 - 50, top: 380, transform: `scale(${g}) rotate(${f}deg)` }}><StarP size={100} glow={30} /></div>
    </AbsoluteFill>
  );
};

// ---------- 5. Dans Sabab : jeudi 26 novembre, puis le thème du jeudi ----------
const EA = "ecrans/accueil", EJ = "ecrans/journee";
const ZJ = zone(EA, /^Jeudi 26 novembre$/), ZM = zone(EA, /^17:00 Maghreb$/), ZT = zone(EJ, /^Thème du jeudi/);
const THEME = mot(/^thème/, 4);
const Accueil: React.FC = () => <Phone ecran={EA} from={L[4] - 4} to={THEME - 2} entree="iris" sortie="gauche">
  <Surligne at={mot(/^jeudi/, 4)} {...ZJ} />
  <Surligne at={mot(/^Sabab/, 4) + 2} {...ZM} />
</Phone>;
const Theme: React.FC = () => <Phone ecran={EJ} from={THEME - 4} to={LIEN - 2} entree="droite" sortie="recul" focus={[{ at: THEME + 6, px: 0.5, py: 0.6, s: 1.08 }]}>
  <Surligne at={THEME + 4} {...ZT} />
</Phone>;

const SFX: Sfx[] = [
  ["impact", 2, 0.5], ["shimmer", mot(/^coucher/) - 4, 0.3], ["pop", mot(/^sourate/) + 10, 0.4],
  ["whoosh", L[1] - 16, 0.4], ["tick", mot(/^jeudi/, 1) + 8, 0.35], ["tick", mot(/^vendredi/, 1) + 10, 0.35],
  ["shimmer", L[2] - 4, 0.4],
  ["whoosh", L[3] - 16, 0.4], ["ding", mot(/^authentifié/, 3) + 12, 0.35],
  ["whoosh", L[4] - 16, 0.45], ["tick", mot(/^jeudi/, 4) + 8, 0.35], ["whoosh", THEME - 14, 0.35], ["tick", THEME + 14, 0.35],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[2] + 10, L[4] - 6, L[5] - 10, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Fenetre /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Lumiere /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Source /></Scene>
    <Accueil />
    <Theme />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Chaque jour a ses moments" /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(jeudi|soleil|sourate|Al-Kahf|vendredi|lumière|Al-Hâkim|Al-Bayhaqî|Sabab|patience|constance)/i} grandsDes={99} />
    <Son voix="moment.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "moment", component: Video, duree: T.DUREE };
