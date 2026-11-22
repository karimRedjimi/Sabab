// « Le saviez-vous ? » : l’invocation après le Fajr (programme.ts · fajr, Ibn Mâjah n° 925).
// Textes religieux : public/voix/saviez.textes.json, copiés par programme depuis content/ (voix/textes.ts).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { AR, C, FONT, GOLD, PLUM, H, W, minutage, motDe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Son, zone, englobe, type Sfx } from "../moteur";
import voix from "../../public/voix/saviez.json";
import tx from "../../public/voix/saviez.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;

// ---------- 1. L’accroche : l’aube se lève, « Le saviez-vous ? » ----------
const Aube: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pill = spring({ frame: f - 2, fps, config: { damping: 9, stiffness: 180 } });
  const sol = interpolate(f, [0, L[1]], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const fajr = spring({ frame: f - mot(/^Fajr/), fps, config: { damping: 10, stiffness: 160 } });
  const cy = 1060 - 330 * sol;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, height: 440, background: `linear-gradient(180deg, rgba(233,150,90,${0.15 + 0.35 * sol}), rgba(42,12,34,0))` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 14 }, (_, i) => { const a = Math.PI + (i + 0.5) * (Math.PI / 14); return (
          <line key={i} x1={540 + Math.cos(a) * 200} y1={cy + Math.sin(a) * 200} x2={540 + Math.cos(a) * (260 + 160 * sol)} y2={cy + Math.sin(a) * (260 + 160 * sol)} stroke={GOLD} strokeWidth={8} strokeLinecap="round" opacity={0.25 + 0.5 * sol} />); })}
        <circle cx={540} cy={cy} r={170} fill="url(#sol)" />
        <defs><radialGradient id="sol"><stop offset="0%" stopColor="#FFF1C4" /><stop offset="70%" stopColor={GOLD} /><stop offset="100%" stopColor="#C98A2E" /></radialGradient></defs>
        <rect x={0} y={1000} width={1080} height={440} fill="#1A0714" />
        <line x1={0} y1={1000} x2={1080} y2={1000} stroke={GOLD} strokeWidth={4} opacity={0.7} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", transform: `scale(${pill})` }}>
        <span style={{ display: "inline-block", padding: "18px 44px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 62, letterSpacing: "0.04em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>LE SAVIEZ-VOUS ?</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 120, color: "#fff", opacity: fajr, transform: `translateY(${(1 - fajr) * 60}px)`, letterSpacing: "0.06em" }}>APRÈS LE FAJR</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Une phrase, trois demandes ----------
const Trois: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const un = spring({ frame: f - L[1] + 2, fps, config: { damping: 8, stiffness: 200 } });
  const t0 = mot(/^trois/, 1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", transform: `scale(${un})`, opacity: un }}>
        <div style={{ display: "inline-block", padding: "40px 70px", borderRadius: 40, background: "rgba(42,12,34,0.9)", boxShadow: `0 0 0 4px ${GOLD}, 0 0 60px rgba(233,196,106,0.5)`, fontFamily: FONT, fontWeight: 800, fontSize: 84, color: "#fff" }}>
          <span style={{ color: GOLD }}>1</span> phrase
        </div>
      </div>
      {[0, 1, 2].map((i) => {
        const s = spring({ frame: f - t0 - i * 5, fps, config: { damping: 10, stiffness: 180 } });
        return <div key={i} style={{ position: "absolute", left: 110 + i * 300, top: 640, width: 260, height: 300, borderRadius: 36, background: "rgba(255,255,255,0.08)", border: `4px solid ${GOLD}`,
          transform: `translateY(${(1 - s) * 400}px) rotate(${(i - 1) * 6 * (1 - s)}deg)`, opacity: s, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 150, color: GOLD,
          boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>{i + 1}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 64, color: "#fff", opacity: interpolate(f, [t0 + 10, t0 + 20], [0, 1], C) }}>demandes</div>
    </AbsoluteFill>
  );
};

// ---------- 3. L’invocation : le texte arabe (inchangé, seulement coupé aux virgules), qui s’allume avec la traduction ----------
const PARTS = D.ar.split(/(?<=،) /);
const Dua: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const seuils = [motDe(T, 2, /^science/), motDe(T, 3, /^subsistance/), motDe(T, 3, /^œuvres/)];
  const s0 = spring({ frame: f - L[2] + 4, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", opacity: s0 }}><StarP size={80} glow={30} /></div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 290, textAlign: "center", direction: "rtl" }}>
        {PARTS.map((p, i) => {
          const s = spring({ frame: f - seuils[i] + 6, fps, config: { damping: 14, stiffness: 160 } });
          const actif = f >= seuils[i] - 6 && (i === PARTS.length - 1 || f < seuils[i + 1] - 6);
          return <div key={i} style={{ fontFamily: AR, fontSize: 96, lineHeight: 1.6, color: actif ? GOLD : "#fff", opacity: 0.18 + 0.82 * Math.max(s, i === 0 ? s0 * 0.4 : 0), transform: `scale(${0.92 + 0.08 * s})`,
            textShadow: actif ? "0 0 40px rgba(233,196,106,0.8)" : "0 0 20px rgba(0,0,0,0.4)" }}>{p}</div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 830, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 40, lineHeight: 1.45, color: "rgba(255,255,255,0.85)", opacity: interpolate(f, [L[2] + 6, L[2] + 20], [0, 1], C) }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", opacity: interpolate(f, [L[2] + 14, L[2] + 28], [0, 1], C) }}>
        <span style={{ display: "inline-block", padding: "12px 30px", borderRadius: 99, border: `3px solid ${GOLD}`, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: GOLD }}>{D.src}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. La source : le livre qui s’ouvre ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[4], fps, config: { damping: 13, stiffness: 140 } });
  const ouvre = interpolate(f, [L[4] + 4, L[4] + 22], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const badge = spring({ frame: f - mot(/^authentifiée/, 4), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540, top: 330, perspective: 1400, transform: `translateX(-50%) scale(${s})` }}>
        <div style={{ position: "relative", width: 560, height: 360 }}>
          <div style={{ position: "absolute", right: 280, top: 0, width: 280, height: 360, borderRadius: "24px 0 0 24px", background: "#F6EBDD", transformOrigin: "right center", transform: `rotateY(${(1 - ouvre) * 90}deg)`, boxShadow: "inset -20px 0 40px rgba(0,0,0,0.15)" }}>
            {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ margin: "44px 36px 0", height: 10, borderRadius: 6, background: "rgba(42,12,34,0.18)", marginTop: i ? 26 : 60 }} />)}
          </div>
          <div style={{ position: "absolute", left: 280, top: 0, width: 280, height: 360, borderRadius: "0 24px 24px 0", background: "#FBF4EA", boxShadow: "inset 20px 0 40px rgba(0,0,0,0.12)", display: "grid", placeItems: "center" }}>
            <StarP size={110} glow={16} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 780, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 70, lineHeight: 1.25, color: "#fff", opacity: s }}>{D.src}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", transform: `scale(${badge})`, opacity: badge }}>
        <span style={{ display: "inline-block", padding: "14px 40px", borderRadius: 99, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44 }}>Sahîh</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Dans l’appli : « Apprendre par cœur » ----------
const E = "ecrans/apprendre";
const ZF = englobe(zone(E, /^Invocation après le Fajr$/), zone(E, /^À réviser aujourd’hui$/, 0));
const Apprendre: React.FC = () => (
  <Phone ecran={E} from={L[5] - 4} to={L[6] + 2} entree="bas" sortie="recul">
    <Surligne at={mot(/apprends/, 5)} {...ZF} />
    <Pastille at={mot(/^chaque/, 5)} x={W * 0.5} y={H * 0.45}>Un peu plus masquée à chaque révision</Pastille>
  </Phone>
);

// ---------- 6. Enregistre : le signet, puis l’étoile Sabab ----------
const Fin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - mot(/^Enregistre/, 6), fps, config: { damping: 8, stiffness: 180 } });
  const logo = spring({ frame: f - mot(/^l’oublier/, 6) - 4, fps, config: { damping: 11, stiffness: 140 } });
  const sparks = Array.from({ length: 12 }, (_, i) => ({ a: (i / 12) * Math.PI * 2, d: 140 + random("sp" + i) * 120 }));
  const k = interpolate(f, [mot(/^Enregistre/, 6) + 4, mot(/^Enregistre/, 6) + 24], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 120, top: 300, transform: `scale(${s * (1 - 0.55 * logo)}) translateY(${-logo * 160}px)` }}>
        <svg width={240} height={300} viewBox="0 0 24 30"><path d="M3 2h18v26l-9-6-9 6z" fill={GOLD} /></svg>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {sparks.map((p, i) => <circle key={i} cx={540 + Math.cos(p.a) * p.d * k} cy={450 + Math.sin(p.a) * p.d * k} r={7} fill={GOLD} opacity={k > 0 && k < 1 ? 1 - k : 0} />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", transform: `scale(${logo})`, opacity: logo }}>
        <StarP size={180} glow={50} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 120, color: "#fff", marginTop: 10 }}>Sabab</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 42, color: GOLD, marginTop: 4 }}>Des invocations sourcées</div>
      </div>
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["riser", 0, 0.35], ["impact", 3, 0.6], ["shimmer", mot(/^Fajr/) - 2, 0.5],
  ["whoosh", L[1] - 4, 0.6], ["ding", mot(/^seule/, 1), 0.6], ...[0, 1, 2].map((i) => ["pop", mot(/^trois/, 1) + i * 5, 0.5] as Sfx),
  ["whoosh", L[2] - 6, 0.5], ["shimmer", L[2] - 2, 0.5], ["shimmer", motDe(T, 3, /^subsistance/) - 6, 0.3],
  ["whoosh", L[4] - 4, 0.6], ["pop", L[4] + 6, 0.5], ["ding", mot(/^authentifiée/, 4), 0.5],
  ["whoosh", L[5] - 4, 0.6], ["tick", mot(/apprends/, 5), 0.5], ["pop", mot(/^chaque/, 5), 0.5],
  ["whoosh", L[6] - 4, 0.5], ["pop", mot(/^Enregistre/, 6), 0.6], ["impact", mot(/^l’oublier/, 6) - 4, 0.7], ["shimmer", mot(/^l’oublier/, 6) - 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[2], L[5] - 6, L[6], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Aube /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Trois /></Scene>
    <Scene from={L[2] - 4} to={L[4] - 2}><Dua /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Source /></Scene>
    <Apprendre />
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Fin /></Scene>
    <Flash at={mot(/^l’oublier/, 6) - 4} />
    <Voile />
    <SousTitres T={T} or={/^(Prophète|Fajr|seule|trois|science|subsistance|œuvres|Ibn|Mâjah|cœur|Sabab|Enregistre)/i} grandsDes={6} />
    <Son voix="saviez.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "saviez", component: Video, duree: T.DUREE };
