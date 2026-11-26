// « Le moment du calendrier » : vendredi 27 novembre 2026, la dernière heure du vendredi (programme.ts · heure ; Abû Dâwûd n° 1048).
// Textes religieux : public/voix/moment.textes.json (copiés par programme). On affiche seulement la fin de la note (« le hadith indique… »), coupée, jamais modifiée.
// Aucune promesse : on parle de chercher cette heure, d’y garder ses demandes.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/moment.json";
import tx from "../../public/voix/moment.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.heure;
const EXTRAIT = D.note.slice(D.note.indexOf("le hadith indique")); // « le hadith indique de la chercher à la dernière heure après le ʿAsr. »

// ---------- 1. L’accroche : la page du calendrier qui tombe sur vendredi, puis un sablier ----------
const Calendrier: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const tourne = interpolate(f, [2, mot(/^vendredi/)], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const v = spring({ frame: f - mot(/^vendredi/), fps, config: { damping: 9, stiffness: 180 } });
  const h = spring({ frame: f - mot(/^heure/), fps, config: { damping: 10, stiffness: 160 } });
  const sable = interpolate(f, [mot(/^heure/), L[1]], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 260, top: 230, width: 520, height: 560, perspective: 1800 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,0.5)", overflow: "hidden", transform: `scale(${0.9 + 0.1 * v})` }}>
          <div style={{ height: 130, background: GOLD, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: PLUM, letterSpacing: "0.1em" }}>VENDREDI</div>
          <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 250, lineHeight: 1.2, color: PLUM }}>27</div>
          <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 48, color: "rgba(42,12,34,0.6)" }}>novembre</div>
        </div>
        {/* La page de jeudi qui se tourne vers le haut */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "#EDE4EA", transformOrigin: "50% 0%", transform: `rotateX(${tourne * 105}deg)`, backfaceVisibility: "hidden", opacity: tourne < 0.95 ? 1 : 0, overflow: "hidden" }}>
          <div style={{ height: 130, background: "#B9A6B3", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", letterSpacing: "0.1em" }}>JEUDI</div>
          <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 250, lineHeight: 1.2, color: "rgba(42,12,34,0.5)" }}>26</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 540 - 70, top: 880, transform: `scale(${h})`, opacity: h }}>
        <svg width={140} height={210} viewBox="0 0 40 60" style={{ filter: "drop-shadow(0 0 20px rgba(233,196,106,0.7))" }}>
          <path d="M6 3h28M6 57h28M9 3c0 14 11 18 11 27S9 43 9 57M31 3c0 14-11 18-11 27s11 13 11 27" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round" />
          <path d={`M${12 + 8 * sable} ${8 + 18 * sable}h${16 - 16 * sable}L20 29z`} fill={GOLD} />
          <path d={`M20 ${57 - 14 * sable}L${12 - 0 * sable} 55h16z`} fill={GOLD} opacity={sable} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 70, color: "#fff", opacity: h }}>une <span style={{ color: GOLD }}>heure</span> à ne pas laisser passer</div>
    </AbsoluteFill>
  );
};

// ---------- 2 et 3. La journée du vendredi : la dernière heure avant le Maghreb s’allume ; l’extrait et sa source ----------
const Ligne: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[1], fps, config: { damping: 14, stiffness: 120 } });
  const asr = spring({ frame: f - mot(/Asr/, 1), fps, config: { damping: 10, stiffness: 180 } });
  const der = interpolate(f, [mot(/^dernière/, 1), mot(/^heure/, 1) + 8], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const c = spring({ frame: f - mot(/^chercher/, 1), fps, config: { damping: 14, stiffness: 120 } });
  const s = spring({ frame: f - L[2], fps, config: { damping: 9, stiffness: 190 } });
  const X0 = 110, X1 = 970, pos = (k: number) => X0 + (X1 - X0) * k;
  const repères: [string, number][] = [["Fajr", 0], ["Dhuhr", 0.45], ["ʿAsr", 0.7], ["Maghreb", 1]];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 46, color: "rgba(255,255,255,0.8)", letterSpacing: "0.12em", opacity: a }}>CE VENDREDI</div>
      <svg width={1080} height={420} style={{ position: "absolute", left: 0, top: 260, opacity: a }}>
        <line x1={X0} y1={200} x2={X1} y2={200} stroke="rgba(255,255,255,0.3)" strokeWidth={14} strokeLinecap="round" />
        <line x1={pos(1 - 0.16 * der)} y1={200} x2={pos(1)} y2={200} stroke={GOLD} strokeWidth={26} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 18px rgba(233,196,106,0.95))" }} opacity={der > 0 ? 1 : 0} />
        {repères.map(([n, k]) => {
          const on = n === "ʿAsr" ? asr : 1;
          return <g key={n} transform={`translate(${pos(k)} 200)`}>
            <circle r={n === "ʿAsr" ? 18 + 6 * asr : 14} fill={n === "ʿAsr" && asr > 0.1 ? GOLD : "#fff"} />
            <text y={n === "Maghreb" || n === "ʿAsr" ? 74 : -40} textAnchor={k === 0 ? "start" : k === 1 ? "end" : "middle"} x={k === 0 ? -14 : k === 1 ? 14 : 0} fontFamily="DM Sans" fontWeight={700} fontSize={40} fill={n === "ʿAsr" ? GOLD : "rgba(255,255,255,0.85)"} opacity={n === "ʿAsr" ? on : 1}>{n}</text>
          </g>;
        })}
        <text x={pos(0.92)} y={140} textAnchor="middle" fontFamily="DM Sans" fontWeight={800} fontSize={40} fill={GOLD} opacity={der}>dernière heure</text>
      </svg>
      <div style={{ position: "absolute", left: 90, right: 90, top: 720, padding: "44px 46px", borderRadius: 44, background: "rgba(42,12,34,0.92)", boxShadow: "0 0 0 3px rgba(233,196,106,0.55), 0 40px 100px rgba(0,0,0,0.5)", textAlign: "center",
        opacity: c, transform: `translateY(${(1 - c) * 60}px)` }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.3, color: "#fff" }}>« … {EXTRAIT} »</div>
        <div style={{ marginTop: 28, height: 70 }}>
          <span style={{ display: "inline-block", padding: "12px 36px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44, transform: `scale(${s})` }}>{D.src}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. L’accueil, un vendredi : la dernière heure calculée pour la ville ----------
const EA = "ecrans/accueil";
const ZD = zone(EA, /^Dernière heure du vendredi, de/);
const Accueil: React.FC = () => <Phone ecran={EA} from={L[3] - 4} to={L[4] + 10} entree="gauche" sortie="recul" focus={[{ at: L[3] + 8, px: 0.5, py: 0.45, s: 1.08 }]}>
  <Surligne at={mot(/^calculée/, 3)} {...ZD} />
</Phone>;

// ---------- 5. Quand elle commence : « Maintenant » (la même page, pendant la dernière heure) ----------
const EV = "ecrans/vendredi-accueil";
const ZM = zone(EV, /^Maintenant : Dernière heure du vendredi/), ZF = zone(EV, /^Moment favorable maintenant$/);
const Maintenant: React.FC = () => <Phone ecran={EV} from={L[4] + 2} to={L[5] - 2} entree="iris" sortie="gauche" focus={[{ at: L[4] + 2, px: 0.5, py: 0.5, s: 1.08 }]}>
  <Surligne at={mot(/^commence/, 4)} {...ZM} />
  <Surligne at={mot(/^maintenant/, 4)} {...ZF} />
  <Pastille at={mot(/^maintenant/, 4) + 4} x={W * 0.5} y={H * 0.27} gold>Maintenant</Pastille>
</Phone>;

// ---------- 6. Garde-la pour tes demandes : les moments favorables du vendredi ----------
const EM = "ecrans/vendredi-moments";
const ZH = englobe(zone(EM, /^La dernière heure du vendredi$/), zone(EM, /^Maintenant, jusqu’au Maghreb/));
const Moments: React.FC = () => <Phone ecran={EM} from={L[5] - 4} to={L[6] - 2} entree="droite" sortie="traverse" focus={[{ at: L[5] + 4, px: 0.5, py: 0.7, s: 1.08 }]}>
  <Surligne at={mot(/^Garde/, 5) + 4} {...ZH} />
  <Pastille at={mot(/^demandes/, 5)} x={W * 0.5} y={H * 0.27} size={34}>{D.title}</Pastille>
</Phone>;

const SFX: Sfx[] = [
  ["whoosh", 2, 0.35], ["pop", mot(/^vendredi/) + 6, 0.55], ["impact", mot(/^vendredi/) + 2, 0.35], ["tick", mot(/^heure/) + 10, 0.4],
  ["whoosh", L[1] - 18, 0.45], ["pop", mot(/Asr/, 1) + 10, 0.35],
  ["shimmer", L[2] - 6, 0.3], ["pop", L[2] + 30, 0.3],
  ["whoosh", L[3] - 18, 0.45], ["tick", mot(/^calculée/, 3) + 10, 0.35],
  ["shimmer", L[4] + 2, 0.3], ["ding", mot(/^maintenant/, 4) + 12, 0.45],
  ["whoosh", L[5] - 18, 0.4], ["tick", mot(/^demandes/, 5) + 10, 0.35],
  ["whoosh", L[6] - 18, 0.4], ["impact", L[6] - 2, 0.5], ["shimmer", mot(/^lien/, 6) + 12, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2], L[5], L[6], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Calendrier /></Scene>
    <Scene from={L[1] - 4} to={L[3] - 2}><Ligne /></Scene>
    <Accueil />
    <Maintenant />
    <Moments />
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[6]} phrase="Chaque vendredi a son heure" /></Scene>
    <Flash at={mot(/^vendredi/)} />
    <Voile />
    <SousTitres T={T} or={/^(vendredi|heure|hadith|dernière|‘Asr|Abû|Dâwûd|ville|accueil|maintenant|Garde-la|demandes|Sabab)/i} grandsDes={6} />
    <Son voix="moment.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "moment", component: Video, duree: T.DUREE };
