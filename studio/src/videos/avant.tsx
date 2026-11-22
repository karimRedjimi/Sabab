// « Avant / Maintenant » : les prières en retard (aucun texte religieux cité).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, H, W, minutage, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Son, Logo, zone, englobe, type Sfx } from "../moteur";
import voix from "../../public/voix/avant.json";

const T = minutage(voix);
const { L, mot } = T;
const GRIS = "#9A8F99";

// ---------- 1. L’accroche : l’horloge qui file du ‘Asr au Maghreb ----------
const Horloge: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - 1, fps, config: { damping: 12, stiffness: 160 } });
  const p = interpolate(f, [mot(/^coup/) - 10, mot(/^Maghreb/) + 4], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const min = 14 * 60 + 42 + p * (17 * 60 + 3 - (14 * 60 + 42));
  const hh = Math.floor(min / 60), mm = Math.floor(min % 60);
  const aM = (min % 60) * 6, aH = ((min / 60) % 12) * 30;
  const fin = f >= mot(/^Maghreb/);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 300, top: 300, width: 600, height: 600, borderRadius: "50%", background: "#FBF4EA", transform: `scale(${s}) rotate(${fin ? Math.sin(f) * 2 : 0}deg)`, boxShadow: `0 0 0 16px ${fin ? "#E07A5F" : GOLD}, 0 40px 100px rgba(0,0,0,0.5)` }}>
        <svg width={600} height={600} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={300 + Math.sin(a) * 250} y1={300 - Math.cos(a) * 250} x2={300 + Math.sin(a) * 275} y2={300 - Math.cos(a) * 275} stroke={PLUM} strokeWidth={10} strokeLinecap="round" />; })}
          <line x1={300} y1={300} x2={300 + Math.sin((aH * Math.PI) / 180) * 150} y2={300 - Math.cos((aH * Math.PI) / 180) * 150} stroke={PLUM} strokeWidth={20} strokeLinecap="round" />
          <line x1={300} y1={300} x2={300 + Math.sin((aM * Math.PI) / 180) * 225} y2={300 - Math.cos((aM * Math.PI) / 180) * 225} stroke="#C4562C" strokeWidth={12} strokeLinecap="round" />
          <circle cx={300} cy={300} r={20} fill={PLUM} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 990, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 130, color: fin ? "#F4A58A" : "#fff", opacity: s }}>
        {String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 56, color: GOLD, opacity: s }}>{fin ? "Maghreb" : "ʿAsr"}</div>
    </AbsoluteFill>
  );
};

// ---------- 2. AVANT : les alarmes qui s’empilent, le poids sur le cœur (en gris) ----------
const NOTIFS = ["Alarme · 14:45", "Alarme · 15:30", "Alarme · 16:10", "Rappel · ʿAsr ?", "Alarme · 16:50"];
const Avant: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[1];
  const tag = spring({ frame: f - a, fps, config: { damping: 10, stiffness: 200 } });
  const retard = spring({ frame: f - mot(/^retard/, 1), fps, config: { damping: 8, stiffness: 220 } });
  const poids = spring({ frame: f - mot(/^poids/, 1), fps, config: { damping: 14, stiffness: 90 } });
  return (
    <AbsoluteFill style={{ filter: "saturate(0.35)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", transform: `scale(${tag})` }}>
        <span style={{ display: "inline-block", padding: "14px 54px", borderRadius: 99, background: GRIS, color: "#2A2228", fontFamily: FONT, fontWeight: 800, fontSize: 64, letterSpacing: "0.1em" }}>AVANT</span>
      </div>
      {NOTIFS.map((t, i) => {
        const at = mot(/^alarmes/, 1) - 6 + i * 6, s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 200 } });
        const sh = f > at && f < at + 12 ? Math.sin(f * 2.5) * 8 : 0;
        return <div key={i} style={{ position: "absolute", left: 110 + (i % 2) * 40, right: 150 - (i % 2) * 40, top: 320 + i * 120, padding: "26px 36px", borderRadius: 30, background: "rgba(255,255,255,0.9)",
          fontFamily: FONT, fontWeight: 700, fontSize: 44, color: "#3A3038", transform: `translateY(${(1 - s) * -300}px) translateX(${sh}px) rotate(${(i - 2) * 1.5}deg)`, opacity: s * (1 - poids * 0.8), boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>🔔 {t}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", transform: `scale(${retard}) rotate(-10deg)`, opacity: retard * (1 - poids) }}>
        <span style={{ display: "inline-block", padding: "16px 50px", border: "10px solid #E07A5F", borderRadius: 20, color: "#E07A5F", fontFamily: FONT, fontWeight: 800, fontSize: 96, background: "rgba(20,10,16,0.6)" }}>EN RETARD</span>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: poids, transform: "translateY(170px)" }}>
        <path transform="translate(380 720) scale(13.3)" d="M12 21s-8-5.2-10.4-10C-0.2 6.6 3.4 1.5 7.6 2.6 9.6 3.1 11 4.6 12 6c1-1.4 2.4-2.9 4.4-3.4 4.2-1.1 7.8 4 6 8.4C20 15.8 12 21 12 21z" fill="#6E5A68" />
        <rect x={430} y={420 + poids * 200} width={220} height={150} rx={20} fill="#4A3C46" />
        <text x={540} y={515 + poids * 200} textAnchor="middle" fontFamily="DM Sans" fontWeight={800} fontSize={60} fill="#B9AEB6">kg</text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 3. MAINTENANT : le mot qui éclaire tout ----------
const Maintenant: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[2] + 4, fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
      <span style={{ transform: `scale(${s})`, padding: "20px 60px", borderRadius: 99, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 90, letterSpacing: "0.08em", boxShadow: "0 0 90px rgba(233,196,106,0.8)", marginTop: -300 }}>MAINTENANT</span>
    </AbsoluteFill>
  );
};

// ---------- 4. L’accueil : la prochaine prière, et la question douce ----------
const EA = "ecrans/accueil";
const ZP = englobe(zone(EA, /^Prochaine prière : Maghreb$/), zone(EA, /^dans 1 h 58$/));
const ZQ = englobe(zone(EA, /^Tu as prié le ʿAsr \?$/), zone(EA, /^Oui, priée$/), zone(EA, /^Pas encore$/));
const Accueil: React.FC = () => (
  <Phone ecran={EA} from={L[2] + 14} to={L[4] + 2} entree="iris" sortie="gauche">
    <Surligne at={mot(/^prochaine/, 2)} fin={L[3] - 4} {...ZP} />
    <Pastille at={mot(/^reste/, 2)} x={W * 0.5} y={H * 0.235} gold>Maghreb dans 1 h 58</Pastille>
    <Surligne at={L[3] + 4} {...ZQ} />
  </Phone>
);

// ---------- 5. Les rappels, seulement si on les choisit ----------
const ER = "ecrans/rappels";
const Rappels: React.FC = () => (
  <Phone ecran={ER} from={L[4] - 4} to={L[5] + 2} entree="droite" sortie="bas">
    <Surligne at={mot(/^rappel/, 4)} fin={mot(/^choisis/, 4) - 6} {...englobe(zone(ER, /^Avant la prière$/), zone(ER, /^Fajr$/), zone(ER, /^Maghreb$/), zone(ER, /^ʿIchâ$/))} />
    <Surligne at={mot(/^choisis/, 4)} {...zone(ER, /^10 min avant$/)} />
  </Phone>
);

// ---------- 6. Le suivi : prière par prière ----------
const ES = "ecrans/suivi";
const Suivi: React.FC = () => (
  <Phone ecran={ES} from={L[5] - 4} to={L[6] + 2} entree="bas" sortie="recul">
    <Surligne at={mot(/^semaine/, 5)} {...englobe(zone(ES, /^Tes prières$/), zone(ES, /^32 sur 32$/), zone(ES, /^ʿIchâ$/), zone(ES, /^\/ 6$/, 2))} />
    <Pastille at={mot(/^juger/, 5)} x={W * 0.5} y={H * 0.45} gold>Sans note. Sans jugement.</Pastille>
  </Phone>
);

const SFX: Sfx[] = [
  ["pop", 1, 0.5], ["tick", 12, 0.4], ["riser", mot(/^coup/) - 10, 0.3], ["alarme", mot(/^Maghreb/), 0.35],
  ["whoosh", L[1] - 4, 0.5], ...NOTIFS.map((_, i) => ["vibration", mot(/^alarmes/, 1) - 6 + i * 6, 0.35] as Sfx), ["impact", mot(/^retard/, 1), 0.5], ["coeur", mot(/^poids/, 1) + 4, 0.5],
  ["whoosh", L[2] - 6, 0.6], ["shimmer", L[2] - 2, 0.6], ["ding", mot(/^prochaine/, 2), 0.4], ["pop", mot(/^reste/, 2), 0.5], ["tick", L[3] + 4, 0.5],
  ["whoosh", L[4] - 4, 0.6], ["ding", mot(/^rappel/, 4), 0.4], ["tap", mot(/^choisis/, 4), 0.5],
  ["whoosh", L[5] - 4, 0.6], ["tick", mot(/^semaine/, 5), 0.4], ["pop", mot(/^juger/, 5), 0.5],
  ["impact", L[6], 0.7], ["shimmer", L[6] + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2], L[5], L[6], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Horloge /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Avant /></Scene>
    <Scene from={L[2] - 4} to={L[2] + 18}><Maintenant /></Scene>
    <Accueil /><Rappels /><Suivi />
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[6]} phrase="Une prière à la fois" /></Scene>
    <Flash at={L[2] - 2} />
    <Flash at={L[6]} />
    <Voile />
    <SousTitres T={T} or={/^(‘Asr|Maghreb|Avant|retard|cœur|Maintenant|prochaine|douce|choisis|semaine|juger|Sabab)/i} grandsDes={6} />
    <Son voix="avant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "avant", component: Video, duree: T.DUREE };
