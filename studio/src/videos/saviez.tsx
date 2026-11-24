// « Le saviez-vous ? » : la du’â que le Prophète ﷺ a enseignée à sa fille Fâtima (programme.ts · hayy).
// Textes religieux : public/voix/saviez.textes.json (copiés par programme depuis content/programme.ts · hayy).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, H, W, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/saviez.json";
import tx from "../../public/voix/saviez.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const FIN = mot(/^l’oublier/, 6);

// ---------- 1. L’accroche : deux étoiles reliées par un fil de lumière ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pill = spring({ frame: f - 2, fps, config: { damping: 9, stiffness: 180 } });
  const a = spring({ frame: f - mot(/^Prophète/), fps, config: { damping: 10, stiffness: 160 } });
  const fil = interpolate(f, [mot(/^enseigné/), mot(/^fille/)], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const b = spring({ frame: f - mot(/^fille/), fps, config: { damping: 9, stiffness: 180 } });
  const q = spring({ frame: f - mot(/^connais/), fps, config: { damping: 7, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", transform: `scale(${pill})` }}>
        <div style={{ display: "inline-block", padding: "18px 40px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 60, letterSpacing: "0.04em", boxShadow: "0 0 70px rgba(233,196,106,0.7)" }}>LE SAVIEZ-VOUS ?</div>
      </div>
      <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 420 }}>
        <path d="M 260 330 Q 540 80 820 330" fill="none" stroke="#FFF1C4" strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${fil} 1`} style={{ filter: "drop-shadow(0 0 14px rgba(233,196,106,0.9))" }} />
      </svg>
      <div style={{ position: "absolute", left: 260 - 110, top: 420 + 330 - 110, transform: `scale(${a})` }}><StarP size={220} glow={50} /></div>
      <div style={{ position: "absolute", left: 820 - 80, top: 420 + 330 - 80, transform: `scale(${b})` }}><StarP size={160} glow={40} /></div>
      <div style={{ position: "absolute", left: 60, width: 400, top: 1000, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", opacity: a }}>Le Prophète <span style={{ fontFamily: AR }}>ﷺ</span></div>
      <div style={{ position: "absolute", right: 60, width: 400, top: 1000, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: GOLD, opacity: b }}>sa fille Fâtima</div>
      <div style={{ position: "absolute", left: 540 - 70, top: 520, width: 140, height: 140, borderRadius: "50%", background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 4px ${GOLD}`, display: "grid", placeItems: "center",
        fontFamily: FONT, fontWeight: 800, fontSize: 96, color: GOLD, transform: `scale(${q}) rotate(${(1 - q) * -30}deg)` }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Matin et soir : le soleil, puis la lune ----------
const MatinSoir: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - mot(/^matin/, 1), fps, config: { damping: 12, stiffness: 150 } });
  const m = spring({ frame: f - mot(/^soir/, 1), fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, top: 560, width: 300, textAlign: "center", transform: `translateY(${(1 - s) * 120}px)`, opacity: s }}>
        <div style={{ width: 220, height: 220, margin: "0 auto", borderRadius: "50%", background: "radial-gradient(circle,#FFF1C4,#E9C46A 60%,#E07A5F)", boxShadow: "0 0 90px rgba(233,196,106,0.8)" }} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", marginTop: 30 }}>le matin</div>
      </div>
      <div style={{ position: "absolute", right: 170, top: 560, width: 300, textAlign: "center", transform: `translateY(${(1 - m) * 120}px)`, opacity: m }}>
        <svg width={220} height={220} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 0 30px rgba(233,196,106,0.7))" }}><path d="M62 8a42 42 0 1 0 30 62A34 34 0 1 1 62 8z" fill={GOLD} /></svg>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", marginTop: 30 }}>le soir</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. L’invocation : l’arabe entier et la phonétique (la traduction est dite et sous-titrée) ----------
const Oeil: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 200 } });
  const k = interpolate(f, [at + 6, at + 10, at + 14], [1, 0.08, 1], C);
  return (
    <svg width={200} height={120} viewBox="0 0 100 60" style={{ position: "absolute", left: 540 - 100, top: 1110, transform: `scale(${s})`, opacity: s }}>
      <g transform={`translate(0 30) scale(1 ${k}) translate(0 -30)`}>
        <path d="M5 30 Q50 -6 95 30 Q50 66 5 30z" fill="none" stroke={GOLD} strokeWidth={4} />
        <circle cx={50} cy={30} r={11} fill={GOLD} />
      </g>
    </svg>
  );
};
const Invocation: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 130 } });
  const ph = interpolate(f, [L[2] + 14, L[2] + 30], [0, 1], C);
  const lueur = interpolate(f, [mot(/^miséricorde/, 2), mot(/^miséricorde/, 2) + 20], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "10px 30px", borderRadius: 999, border: `3px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 36, letterSpacing: "0.1em", opacity: a }}>{D.title.toUpperCase()}</span>
      </div>
      <div dir="rtl" lang="ar" style={{ position: "absolute", left: 60, right: 60, top: 330, textAlign: "center", fontFamily: AR, fontSize: 80, lineHeight: 1.75, color: "#fff", opacity: a,
        transform: `translateY(${(1 - a) * 40}px)`, textShadow: `0 0 ${20 + 30 * lueur}px rgba(233,196,106,${0.3 + 0.4 * lueur})` }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 820, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 44, lineHeight: 1.5, color: "rgba(255,255,255,0.85)", opacity: ph }}>{D.ph}</div>
      <Oeil at={mot(/^temps/, 2)} />
    </AbsoluteFill>
  );
};

// ---------- 4. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 140 } });
  const g = spring({ frame: f - mot(/^Al-Hâkim/, 3), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, right: 90, top: 560, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `perspective(1600px) rotateY(${(1 - s) * 70}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 34, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.12em" }}>SOURCE</div>
        <div style={{ fontFamily: FONT, fontSize: 54, color: "#fff", fontWeight: 800, lineHeight: 1.3, marginTop: 20 }}>{D.src}</div>
      </div>
      <div style={{ position: "absolute", left: 540 - 50, top: 400, transform: `scale(${g}) rotate(${f}deg)` }}><StarP size={100} glow={30} /></div>
    </AbsoluteFill>
  );
};

// ---------- 5. Toutes tes affaires ----------
const Affaires: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t = spring({ frame: f - mot(/^toutes/, 4), fps, config: { damping: 8, stiffness: 200 } });
  const e = spring({ frame: f - L[4], fps, config: { damping: 14, stiffness: 160 } });
  const tr = spring({ frame: f - mot(/^travail/, 4), fps, config: { damping: 10, stiffness: 190 } });
  const fa = spring({ frame: f - mot(/^famille/, 4), fps, config: { damping: 10, stiffness: 190 } });
  const carte = (x: number, s: number, ico: React.ReactNode, mot: string) => (
    <div style={{ position: "absolute", left: x, top: 760, width: 360, padding: "40px 0", borderRadius: 44, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}, 0 30px 80px rgba(0,0,0,0.4)`,
      textAlign: "center", transform: `scale(${s}) translateY(${(1 - s) * 60}px)`, opacity: s }}>
      {ico}
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#fff", marginTop: 14 }}>{mot}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 120, color: GOLD, transform: `scale(${t})`, textShadow: "0 0 60px rgba(233,196,106,0.6)" }}>toutes</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 60, color: "#fff", opacity: e, transform: `translateY(${(1 - e) * 40}px)` }}>tes affaires</div>
      {carte(150, tr, <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinejoin="round"><rect x={3} y={7} width={18} height={13} rx={2} /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18" /></svg>, "travail")}
      {carte(570, fa, <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>, "famille")}
    </AbsoluteFill>
  );
};

// ---------- 6. Dans Sabab : la fiche entière ----------
const E = "ecrans/fiche-hayy";
const ZT = zone(E, /^Yâ Hayyu yâ Qayyûm$/), ZA = zone(E, /^يَا حَيُّ/), ZP = zone(E, /^Yâ Hayyu yâ Qayyûm, bi rahmatika/);
const Fiche: React.FC = () => <Phone ecran={E} from={L[5] - 4} to={L[6] + 2} entree="bascule" sortie="traverse" focus={[{ at: L[5] + 8, px: 0.5, py: 0.4, s: 1.06 }]}>
  <Surligne at={mot(/^Sabab/, 5) + 2} {...ZT} fin={mot(/^l’arabe/, 5) - 2} />
  <Surligne at={mot(/^l’arabe/, 5)} {...ZA} fin={mot(/^phonétique/, 5) - 2} />
  <Surligne at={mot(/^phonétique/, 5)} {...ZP} />
  <Pastille at={mot(/^matin/, 5)} x={W * 0.66} y={H * 0.812} gold>Matin et soir</Pastille>
</Phone>;

// ---------- 7. Enregistre : le signet, puis l’étoile Sabab ----------
const Fin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[6], fps, config: { damping: 8, stiffness: 180 } });
  const out = interpolate(f, [FIN, FIN + 10], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 130, top: 420, transform: `scale(${s * (1 - out)}) rotate(${(1 - s) * 20}deg)`, opacity: 1 - out }}>
        <svg width={260} height={320} viewBox="0 0 24 30"><path d="M3 2h18v26l-9-6-9 6z" fill={GOLD} style={{ filter: "drop-shadow(0 0 2px rgba(233,196,106,0.9))" }} /></svg>
      </div>
      <Logo at={FIN + 4} phrase="Yâ Hayyu yâ Qayyûm" />
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["impact", 2, 0.6], ["pop", mot(/^Prophète/) + 2, 0.4], ["shimmer", mot(/^enseigné/) + 4, 0.4], ["pop", mot(/^fille/) + 8, 0.5], ["ding", mot(/^connais/) + 6, 0.5],
  ["whoosh", L[1] - 6, 0.5], ["pop", mot(/^matin/, 1) + 6, 0.4], ["pop", mot(/^soir/, 1) + 6, 0.4],
  ["shimmer", L[2] - 4, 0.5],
  ["whoosh", L[3] - 6, 0.4], ["ding", mot(/^Al-Hâkim/, 3) + 10, 0.4],
  ["whoosh", L[4] - 6, 0.4], ["pop", mot(/^toutes/, 4) - 4, 0.4], ["tick", mot(/^travail/, 4) - 3, 0.4], ["tick", mot(/^famille/, 4) - 3, 0.4],
  ["whoosh", L[5] - 6, 0.6], ["tick", mot(/^l’arabe/, 5) - 3, 0.4], ["tick", mot(/^phonétique/, 5) - 3, 0.4],
  ["whoosh", L[6] - 6, 0.5], ["pop", L[6] + 2, 0.5], ["impact", FIN + 12, 0.6], ["shimmer", FIN + 14, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[2] + 10, L[5] - 6, L[5] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><MatinSoir /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Invocation /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Source /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Affaires /></Scene>
    <Fiche />
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Fin /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(Prophète|Fâtima|matin|soir|Vivant|miséricorde|affaires|clin|An-Nasâ’î|Al-Hâkim|toutes|Sabab|Enregistre)/i} grandsDes={6} />
    <Son voix="saviez.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "saviez", component: Video, duree: T.DUREE };
