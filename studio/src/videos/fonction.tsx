// « Une fonction à fond » : les cycles de 30 jours et le bilan (fin de cycle, bilan de la semaine, régularité sur 30 jours).
// Aucun texte religieux dit. Les écrans montrent « Qu’Allah l’accepte » (texte de l’appli) ; rien d’autre de religieux.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/fonction.json";

const T = minutage(voix);
const { L, mot } = T;

// ---------- 1. L’accroche : trente cases qui se remplissent, un « ? » ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t = spring({ frame: f - 2, fps, config: { damping: 9, stiffness: 180 } });
  const q = spring({ frame: f - mot(/^vraiment/), fps, config: { damping: 8, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 200, color: GOLD, transform: `scale(${t})`, textShadow: "0 0 60px rgba(233,196,106,0.6)" }}>30</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 52, color: "#fff", letterSpacing: "0.14em", opacity: t }}>JOURS</div>
      <div style={{ position: "absolute", left: 150, top: 560, display: "grid", gridTemplateColumns: "repeat(6, 110px)", gap: 18 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const k = spring({ frame: f - 6 - i * 1.4, fps, config: { damping: 12, stiffness: 220 } });
          const plein = i % 7 !== 3 && i % 11 !== 8;
          return <div key={i} style={{ width: 110, height: 110, borderRadius: 24, background: plein ? GOLD : "rgba(255,255,255,0.12)", opacity: k * (plein ? 0.9 : 1), transform: `scale(${k})`, boxShadow: plein ? "0 0 18px rgba(233,196,106,0.5)" : undefined }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 540 - 90, top: 820, width: 180, height: 180, borderRadius: "50%", background: PLUM, boxShadow: `0 0 0 6px ${GOLD}, 0 0 60px rgba(233,196,106,0.7)`, display: "grid", placeItems: "center",
        fontFamily: FONT, fontWeight: 800, fontSize: 130, color: GOLD, transform: `scale(${q}) rotate(${(1 - q) * -40}deg)` }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2 et 3. La fin du cycle : l’écran entier, surligné au fil de la voix ----------
const EC = "ecrans/cycle";
const ZC = zone(EC, /^Fin du cycle 1/), ZJ = englobe(zone(EC, /^24$/), zone(EC, /^jours tenus$/)), ZE = englobe(zone(EC, /^9$/), zone(EC, /^bienfait/));
const Cycle: React.FC = () => <Phone ecran={EC} from={L[1] - 4} to={L[3] - 2} entree="droite" sortie="gauche" focus={[{ at: L[1] + 8, px: 0.5, py: 0.35, s: 1.05 }]}>
  <Surligne at={mot(/^cycle/, 1)} {...ZC} fin={L[2] + 4} />
  <Surligne at={mot(/^24/, 2)} {...ZJ} fin={mot(/^étoile/, 2) - 2} />
  <Surligne at={mot(/^étoile/, 2)} {...ZE} />
  <Pastille at={mot(/^jours/, 1) + 4} x={W * 0.5} y={H * 0.3} gold>30 jours</Pastille>
</Phone>;

// ---------- 4. Le bilan de la semaine ----------
const EB = "ecrans/bilan";
const ZB1 = englobe(zone(EB, /^5 \/ 6$/), zone(EB, /^jours tenus jusqu’ici/)), ZB2 = englobe(zone(EB, /^Prières$/), zone(EB, /^notées/), zone(EB, /^après l’appel$/)), ZB3 = zone(EB, /^7 points de plus/);
const Bilan: React.FC = () => <Phone ecran={EB} from={L[3] - 4} to={L[4] - 2} entree="bascule" sortie="droite" focus={[{ at: L[3] + 8, px: 0.5, py: 0.45, s: 1.05 }]}>
  <Surligne at={mot(/^jours/, 3)} {...ZB1} fin={mot(/^prières/, 3) - 2} />
  <Surligne at={mot(/^prières/, 3)} {...ZB2} fin={mot(/^progresse/, 3) - 2} />
  <Surligne at={mot(/^progresse/, 3)} {...ZB3} />
</Phone>;

// ---------- 5. La régularité sur 30 jours ----------
const ES = "ecrans/suivi2";
const ZR = englobe(zone(ES, /^Ta régularité$/), zone(ES, /^30$/), zone(ES, /^12$/), zone(ES, /^28$/));
const Suivi: React.FC = () => <Phone ecran={ES} from={L[4] - 4} to={L[5] - 2} entree="gauche" sortie="recul" focus={[{ at: L[4] + 8, px: 0.5, py: 0.55, s: 1.05 }]}>
  <Surligne at={mot(/^régularité/, 4)} {...ZR} />
  <Pastille at={mot(/^coup/, 4)} x={W * 0.5} y={H * 0.79} gold>D’un coup d’œil</Pastille>
</Phone>;

// ---------- 6. Rien que pour toi : un cadenas doux, deux mentions qui se barrent ----------
const PourToi: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const c = spring({ frame: f - L[5], fps, config: { damping: 11, stiffness: 150 } });
  const ferme = interpolate(f, [mot(/^toi/, 5), mot(/^toi/, 5) + 8], [0, 1], C);
  const m1 = spring({ frame: f - mot(/^publiés/, 5), fps, config: { damping: 10, stiffness: 200 } });
  const m2 = spring({ frame: f - mot(/^comparés/, 5), fps, config: { damping: 10, stiffness: 200 } });
  const Mention: React.FC<{ s: number; t: string; top: number }> = ({ s, t, top }) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: s, transform: `translateY(${(1 - s) * 30}px)` }}>
    <span style={{ position: "relative", display: "inline-block", padding: "18px 44px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: "0 0 0 3px rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.85)", fontFamily: FONT, fontWeight: 800, fontSize: 54 }}>
      {t}<span style={{ position: "absolute", left: 30, right: 30, top: "50%", height: 6, borderRadius: 3, background: GOLD, transform: `scaleX(${s})`, transformOrigin: "left" }} />
    </span>
  </div>;
  return (
    <AbsoluteFill>
      <svg width={300} height={340} viewBox="0 0 100 114" style={{ position: "absolute", left: 540 - 150, top: 240, transform: `scale(${c})`, overflow: "visible", filter: "drop-shadow(0 0 30px rgba(233,196,106,0.6))" }}>
        <path d={`M28 52 V34 C28 20 38 10 50 10 C62 10 72 20 72 34 V${52 - 14 * (1 - ferme)}`} fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
        <rect x={14} y={50} width={72} height={58} rx={14} fill={PLUM} stroke={GOLD} strokeWidth={6} />
        <circle cx={50} cy={76} r={7} fill={GOLD} /><rect x={47} y={78} width={6} height={16} rx={3} fill={GOLD} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 84, color: "#fff", opacity: c }}>Rien que <span style={{ color: GOLD }}>pour toi</span></div>
      <Mention s={m1} t="Publiés" top={830} />
      <Mention s={m2} t="Comparés" top={980} />
    </AbsoluteFill>
  );
};

const FIN = L[6];
const SFX: Sfx[] = [
  ["impact", 3, 0.55], ["tick", 14, 0.3], ["tick", 30, 0.3], ["pop", mot(/^vraiment/) + 8, 0.45],
  ["whoosh", L[1] - 18, 0.45], ["tick", mot(/^cycle/, 1) + 10, 0.35], ["pop", mot(/^jours/, 1) + 12, 0.35],
  ["tick", mot(/^24/, 2) + 12, 0.35], ["shimmer", mot(/^étoile/, 2) + 10, 0.35],
  ["whoosh", L[3] - 18, 0.45], ["tick", mot(/^prières/, 3) + 10, 0.35], ["ding", mot(/^progresse/, 3) + 14, 0.4],
  ["whoosh", L[4] - 18, 0.45], ["tick", mot(/^régularité/, 4) + 12, 0.35], ["pop", mot(/^coup/, 4) + 12, 0.35],
  ["whoosh", L[5] - 18, 0.4], ["tap", mot(/^toi/, 5) + 8, 0.4], ["pop", mot(/^publiés/, 5) + 12, 0.35], ["pop", mot(/^comparés/, 5) + 14, 0.35],
  ["whoosh", FIN - 18, 0.4], ["impact", FIN - 2, 0.5], ["shimmer", mot(/^lien/, 6) + 14, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2], L[5], FIN, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Cycle />
    <Bilan />
    <Suivi />
    <Scene from={L[5] - 4} to={FIN - 2}><PourToi /></Scene>
    <Scene from={FIN - 4} to={T.DUREE + 10} zin={0}><Logo at={FIN} phrase="Le lien est en bio" /></Scene>
    <Flash at={L[1]} />
    <Voile />
    <SousTitres T={T} or={/^(Trente|cycle|jours\.|24|étoile|bilan|prières|progresse|régularité|toi|publiés|comparés|Sabab)/i} grandsDes={99} />
    <Son voix="fonction.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "fonction", component: Video, duree: T.DUREE };
