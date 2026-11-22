// « Apaisant » : remplir sa journée moment par moment (aucun texte religieux). Rythme lent, sons doux, pas de flash.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, minutage, SousTitres, Voile, Fond, StarP, Scene, Phone, Surligne, Son, Logo, Check, zone, englobe, type Sfx } from "../moteur";
import voix from "../../public/voix/apaisant.json";

const T = minutage(voix, 6, 80);
const { L, mot } = T;
const doux = { damping: 22, stiffness: 70 };

// ---------- 1. Le matin : cinq petits points qui s’allument, un à un ----------
const POINTS = 5;
const Matin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: doux });
  const t = (i: number) => 24 + i * 18;
  const fini = t(POINTS - 1) + 14;
  const sol = interpolate(f, [0, L[1]], [0, 1], { ...C, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 400, top: 760 - 400 - sol * 60, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,180,110,0.35), rgba(244,180,110,0) 60%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 64, color: "#fff", opacity: s, letterSpacing: "0.12em" }}>LE MATIN</div>
      <div style={{ position: "absolute", left: 540 - 180, top: 470, width: 360, height: 360, borderRadius: "50%", border: "6px solid rgba(255,255,255,0.15)", opacity: s }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={650} r={180} fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" strokeDasharray={2 * Math.PI * 180}
          strokeDashoffset={2 * Math.PI * 180 * (1 - interpolate(f, [t(0), fini], [0, 1], C))} transform="rotate(-90 540 650)" />
      </svg>
      {Array.from({ length: POINTS }, (_, i) => {
        const k = spring({ frame: f - t(i), fps, config: { damping: 14, stiffness: 120 } });
        return <div key={i} style={{ position: "absolute", left: 540 - 2 * 90 + i * 90 - 22, top: 950, width: 44, height: 44, borderRadius: "50%", background: k > 0.05 ? GOLD : "rgba(255,255,255,0.18)",
          transform: `scale(${0.7 + 0.3 * k})`, boxShadow: k > 0.05 ? `0 0 ${24 * k}px rgba(233,196,106,0.9)` : "none" }} />;
      })}
      <Check at={fini} x={540} y={650} size={130} />
    </AbsoluteFill>
  );
};

// ---------- 2. Dans la journée : l’écran de l’appli, le moment suivant ----------
const EJ = "ecrans/journee";
const Journee: React.FC = () => (
  <Phone ecran={EJ} from={L[1] - 6} to={L[2] + 2} entree="bas" sortie="recul">
    <Surligne at={mot(/^journée/, 1)} fin={mot(/^autre/, 1) - 4} {...zone(EJ, /^Dans la journée 1 sur 4/)} />
    <Surligne at={mot(/^autre/, 1)} {...englobe(zone(EJ, /^Ta journée$/), zone(EJ, /^46$/), zone(EJ, /^6 sur 13 · encore 7$/))} />
  </Phone>
);

// ---------- 3. Le soir : la barre se remplit, la respiration ----------
const Soir: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[2], fps, config: doux });
  const p = interpolate(f, [mot(/^remplit/, 2) - 10, mot(/^respires/, 2) + 10], [0.46, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const souffle = 1 + 0.12 * Math.sin(((f - mot(/^respires/, 2)) / 40) * Math.PI * 2) * interpolate(f, [mot(/^respires/, 2) - 10, mot(/^respires/, 2) + 10], [0, 1], C);
  const etapes = ["Matin", "Journée", "Soir"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 220, top: 430 - 220, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(233,196,106,0.35), rgba(233,196,106,0) 65%)", transform: `scale(${souffle * s})` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: s }}>
        <path d={`M ${540 + 30} ${430 - 110} A 110 110 0 1 0 ${540 + 30} ${430 + 110} A 80 110 0 1 1 ${540 + 30} ${430 - 110} Z`} fill="#FFF1C4" style={{ filter: "drop-shadow(0 0 30px rgba(255,241,196,0.7))" }} />
      </svg>
      <div style={{ position: "absolute", left: 140, right: 140, top: 820, opacity: s }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,0.85)", marginBottom: 22 }}>
          {etapes.map((e, i) => <span key={e} style={{ color: p >= (i + 1) / 3 - 0.02 ? GOLD : undefined }}>{e}</span>)}
        </div>
        <div style={{ height: 30, borderRadius: 99, background: "rgba(255,255,255,0.14)" }}>
          <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#C98A2E,#E9C46A,#FFF1C4)", boxShadow: "0 0 24px rgba(233,196,106,0.8)" }} />
        </div>
        <div style={{ textAlign: "right", fontFamily: FONT, fontWeight: 800, fontSize: 90, color: "#fff", marginTop: 20 }}>{Math.round(p * 100)} %</div>
      </div>
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["shimmer", 4, 0.35], ...Array.from({ length: POINTS }, (_, i) => ["tick", 24 + i * 18, 0.35] as Sfx), ["pop", 24 + (POINTS - 1) * 18 + 14, 0.4],
  ["shimmer", L[1] - 6, 0.3], ["pop", mot(/^journée/, 1), 0.35], ["pop", mot(/^autre/, 1), 0.35],
  ["shimmer", L[2] - 4, 0.3], ["tick", mot(/^remplit/, 2), 0.3], ["shimmer", mot(/^respires/, 2), 0.4],
  ["shimmer", L[3], 0.5], ["shimmer", T.FIN + 20, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[1] + 20, L[2], L[3], T.DUREE]} />
    <Scene from={0} to={L[1] - 4} zin={0} zout={0.05}><Matin /></Scene>
    <Journee />
    <Scene from={L[2] - 4} to={L[3] - 2} zout={0.05}><Soir /></Scene>
    <Scene from={L[3] - 6} to={T.DUREE + 10} zin={0.05}><Logo at={L[3]} phrase="Une journée à la fois" /></Scene>
    <Voile />
    <SousTitres T={T} or={/^(matin|doucement|journée|invocation|soir|respires|Sabab)/i} grandsDes={3} />
    <Son voix="apaisant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "apaisant", component: Video, duree: T.DUREE };
