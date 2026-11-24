// « Le moment du calendrier » : ce mercredi, la prosternation, moment favorable à chaque prière (textes.ts · MOMENTS_FAVORABLES.sujud, Muslim n° 482).
// Textes religieux : public/voix/moment.textes.json (copiés par programme depuis content/textes.ts). Thème du mercredi : DAYS[3] (programme.ts), visible dans l’écran « journee ».
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/moment.json";
import tx from "../../public/voix/moment.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const S = tx.sujud;
const LABEL = S.label.charAt(0).toUpperCase() + S.label.slice(1);
const LIEN = mot(/^lien/, 5);
const PRIERES = ["Fajr", "Dhuhr", "ʿAsr", "Maghreb", "ʿIchâ"];

// ---------- 1. L’accroche : la page du calendrier, puis les cinq prières ----------
const Calendrier: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const p = spring({ frame: f - 2, fps, config: { damping: 12, stiffness: 120 } });
  const pr = mot(/^chaque/);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 240, right: 240, top: 220, borderRadius: 40, overflow: "hidden", background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        transform: `perspective(1400px) rotateX(${(1 - p) * -100}deg)`, transformOrigin: "50% 0%", opacity: Math.min(1, p * 2) }}>
        <div style={{ background: GOLD, padding: "22px 0", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: PLUM, letterSpacing: "0.08em" }}>MERCREDI</div>
        <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 230, lineHeight: 1.1, color: PLUM }}>25</div>
        <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 46, color: "#7A4A6A", paddingBottom: 30 }}>novembre</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 920, display: "flex", justifyContent: "space-between" }}>
        {PRIERES.map((n, i) => {
          const s = spring({ frame: f - pr - i * 4, fps, config: { damping: 10, stiffness: 200 } });
          return <div key={n} style={{ width: 170, textAlign: "center", transform: `scale(${s})`, opacity: s }}>
            <div style={{ width: 80, height: 80, margin: "0 auto", borderRadius: "50%", background: "radial-gradient(circle,#FFF1C4,#E9C46A)", boxShadow: "0 0 40px rgba(233,196,106,0.7)" }} />
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 42, color: "#fff", marginTop: 14 }}>{n}</div>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Pendant la prosternation : le tapis, le point lumineux, la source ----------
const Tapis: React.FC<{ lueur: number }> = ({ lueur }) => (
  <svg width={360} height={560} viewBox="0 0 90 140" style={{ position: "absolute", left: 540 - 180, top: 300 }}>
    <rect x={4} y={4} width={82} height={132} rx={6} fill="#5B1E47" stroke={GOLD} strokeWidth={2.5} />
    <path d="M18 40 V26 Q18 12 45 8 Q72 12 72 26 V40" fill="none" stroke={GOLD} strokeWidth={2} />
    <rect x={12} y={48} width={66} height={80} rx={3} fill="none" stroke="rgba(233,196,106,0.5)" strokeWidth={1.5} />
    <circle cx={45} cy={30} r={6 + 8 * lueur} fill="#FFF1C4" opacity={0.3 + 0.7 * lueur} style={{ filter: `drop-shadow(0 0 ${8 * lueur}px #E9C46A)` }} />
  </svg>
);
const Prosternation: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t = spring({ frame: f - L[1], fps, config: { damping: 13, stiffness: 120 } });
  const lueur = interpolate(f, [mot(/^prosternation/, 1), mot(/^prosternation/, 1) + 20], [0, 1], C);
  const src = spring({ frame: f - mot(/^Muslim/, 1), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ transform: `translateY(${(1 - t) * 300}px)`, opacity: t }}><Tapis lueur={lueur} /></div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 930, padding: "36px 40px", borderRadius: 40, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, textAlign: "center", opacity: lueur, transform: `scale(${0.9 + 0.1 * lueur})` }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 62, color: "#fff" }}>{LABEL}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: GOLD, marginTop: 10, opacity: src }}>Source : {S.source}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. Le front au sol : tes demandes descendent vers la lumière ----------
const Demandes: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const d = mot(/^demandes/, 2);
  return (
    <AbsoluteFill>
      <Tapis lueur={1} />
      {[0, 1, 2, 3, 4].map((i) => {
        const k = interpolate(f, [d - 20 + i * 5, d + 20 + i * 5], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
        const x0 = 140 + i * 200, y0 = 1080;
        return <div key={i} style={{ position: "absolute", left: x0 + (540 - x0) * k - 30, top: y0 + (420 - y0) * k - 30, transform: `scale(${(1 - 0.6 * k) * spring({ frame: f - L[2] - i * 3, fps, config: { damping: 12, stiffness: 180 } })})`, opacity: 1 - 0.7 * k }}><StarP size={60} glow={20} /></div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", opacity: interpolate(f, [d, d + 10], [0, 1], C) }}>tes <span style={{ color: GOLD }}>demandes</span></div>
    </AbsoluteFill>
  );
};

// ---------- 4. Le thème du mercredi, sur la page du jour ----------
const EJ = "ecrans/journee";
const ZTH = zone(EJ, /^Thème du mercredi/);
const Theme: React.FC = () => <Phone ecran={EJ} from={L[3] - 4} to={L[4] - 2} entree="droite" sortie="gauche">
  <Surligne at={mot(/^thème/, 3)} {...ZTH} />
</Phone>;

// ---------- 5. Les moments favorables, avec leurs sources ----------
const EM = "ecrans/moments";
const ZMF = zone(EM, /^Moment favorable · à l’appel/), ZSU = englobe(zone(EM, new RegExp("^" + LABEL + "$")), zone(EM, /^À chaque prière$/));
const Moments: React.FC = () => <Phone ecran={EM} from={L[4] - 4} to={LIEN - 2} entree="bas" sortie="recul">
  <Surligne at={mot(/^moments/, 4)} {...ZMF} fin={mot(/^favorables/, 4) + 8} />
  <Surligne at={mot(/^favorables/, 4) + 10} {...ZSU} fin={mot(/^sources/, 4) - 4} />
  <Surligne at={mot(/^sources/, 4)} {...ZSU} />
  <Pastille at={mot(/^sources/, 4)} x={W * 0.5} y={H * 0.255} gold>Source : {S.source}</Pastille>
</Phone>;

const SFX: Sfx[] = [
  ["whoosh", 2, 0.5], ["pop", 14, 0.4], ...PRIERES.map((_, i) => ["tick", mot(/^chaque/) + 4 + i * 4, 0.35] as Sfx),
  ["shimmer", L[1] - 4, 0.5],
  ["whoosh", L[2] - 6, 0.3], ["shimmer", mot(/^demandes/, 2) + 10, 0.4],
  ["whoosh", L[3] - 16, 0.5], ["tick", mot(/^thème/, 3) + 4, 0.4],
  ["whoosh", L[4] - 18, 0.4], ["tick", mot(/^moments/, 4) + 4, 0.4], ["tick", mot(/^favorables/, 4) + 14, 0.4], ["ding", mot(/^sources/, 4) + 6, 0.4],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 6, L[1] + 14, L[4] - 6, L[5] + 10, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Calendrier /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2} zout={0}><Prosternation /></Scene>
    <Scene from={L[2] - 2} to={L[3] - 2} zin={0}><Demandes /></Scene>
    <Theme />
    <Moments />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Chaque jour a ses moments" /></Scene>
    <Flash at={L[1]} />
    <Voile />
    <SousTitres T={T} or={/^(mercredi|prière|prosternation|Muslim|front|demandes|thème|angoisse|favorables|sources|Sabab)/i} grandsDes={99} />
    <Son voix="moment.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "moment", component: Video, duree: T.DUREE };
