// « Une fonction à fond » : apprendre par cœur (révision espacée, masquage progressif). Aucun texte religieux dit.
// Les écrans montrent des invocations du programme (Hasbiyallâh, après le Fajr, contre les dettes) en cours de révision.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/fonction.json";

const T = minutage(voix);
const { L, mot } = T;
const LIEN = mot(/^lien/, 8);

// ---------- 1. L’accroche : une du’â lue sur l’écran… et le cœur vide ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const c = spring({ frame: f - 2, fps, config: { damping: 12, stiffness: 150 } });
  const scan = (f % 40) / 40;
  const coeur = interpolate(f, [mot(/^connais/), mot(/^cœur/) + 6], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const q = spring({ frame: f - mot(/^cœur/), fps, config: { damping: 7, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 200, right: 200, top: 230, height: 520, borderRadius: 60, background: "rgba(42,12,34,0.92)", boxShadow: "0 0 0 6px #160812, 0 0 0 8px rgba(255,255,255,0.18), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - c) * 200}px) rotate(${(1 - c) * -8}deg)`, opacity: c, overflow: "hidden" }}>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ position: "absolute", left: 60, right: i % 2 ? 140 : 60, top: 90 + i * 80, height: 26, borderRadius: 13, background: "rgba(255,255,255,0.35)" }} />)}
        <div style={{ position: "absolute", left: 40, right: 40, top: 70 + scan * 400, height: 60, borderRadius: 20, background: "rgba(233,196,106,0.18)", boxShadow: "0 0 30px rgba(233,196,106,0.35)" }} />
      </div>
      <svg width={300} height={280} viewBox="0 0 100 92" style={{ position: "absolute", left: 540 - 150, top: 860, filter: "drop-shadow(0 0 24px rgba(233,196,106,0.7))" }}>
        <path d="M50 86 C10 58 4 36 14 20 C24 4 44 8 50 24 C56 8 76 4 86 20 C96 36 90 58 50 86z" fill="none" stroke={GOLD} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={`${coeur} 1`} />
      </svg>
      <div style={{ position: "absolute", left: 540 - 60, top: 950, width: 120, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 110, color: "#fff", transform: `scale(${q})` }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2. L’onglet Apprendre ----------
const EA = "ecrans/apprendre-niveaux";
const ZTI = zone(EA, /^Apprendre par cœur$/), ZSU = englobe(zone(EA, /^2 \/ 5$/), zone(EA, /^du socle sues par cœur$/)), ZREV = zone(EA, /^Réviser 3 invocation/), ZLIST = zone(EA, /^Tes révisions$/);
const Onglet: React.FC = () => <Phone ecran={EA} from={L[1] - 6} to={L[3] - 2} entree="droite" sortie="gauche" focus={[{ at: L[1] + 10, px: 0.5, py: 0.4, s: 1.05 }]}>
  <Surligne at={mot(/^Apprendre/, 1)} {...ZTI} fin={mot(/^retenir/, 1) - 2} />
  <Surligne at={mot(/^retenir/, 1)} {...ZSU} fin={L[2] - 2} />
  <Surligne at={mot(/^révises/, 2)} {...ZREV} fin={mot(/^reviennent/, 2) - 2} />
  <Surligne at={mot(/^reviennent/, 2)} {...ZLIST} />
  <Pastille at={mot(/^une/, 1) + 4} x={W * 0.5} y={H * 0.404} gold>Une par une</Pastille>
</Phone>;

// ---------- 3 à 5. Le masquage progressif : un mot sur trois, deux sur trois, tout ----------
// Le bloc arabe : de la première à la dernière ligne arabe du manifeste, sur la largeur de la carte de traduction.
const blocArabe = (e: string, premier: RegExp, dernier: RegExp, carte: RegExp) => {
  const a = zone(e, premier), b = zone(e, dernier), c = zone(e, carte);
  return { x: c.x, w: c.w, y: a.y, h: b.y + b.h - a.y };
};
const E1 = "ecrans/revision-1", E2 = "ecrans/revision-2", E3 = "ecrans/revision-3";
const Z1A = blocArabe(E1, /^حَسْبِيَ$/, /^الْعَظِيمِ$/, /^Allah me suffit/), Z1I = zone(E1, /^Récite-la en complétant/), Z1N = zone(E1, /^1 sur 3$/);
const Z2A = blocArabe(E2, /^اللَّهُمَّ$/, /^طَيِّبًا،$/, /^Ô Allah, je Te demande une science/), Z2N = zone(E2, /^2 sur 3$/);
const Z3I = zone(E3, /^Récite-la de mémoire/), Z3R = zone(E3, /^Révéler le texte$/), Z3N = zone(E3, /^3 sur 3$/);
const Rev1: React.FC = () => <Phone ecran={E1} from={L[3] - 4} to={L[4] - 2} entree="zoom" sortie="recul">
  <Surligne at={L[3] + 4} {...Z1N} fin={mot(/^caché/, 3) - 2} />
  <Surligne at={mot(/^caché/, 3)} {...Z1A} fin={mot(/^complètes/, 3) - 2} />
  <Surligne at={mot(/^complètes/, 3)} {...Z1I} />
  <Pastille at={mot(/^mot/, 3)} x={W * 0.5} y={H * 0.88} gold>1 mot sur 3</Pastille>
</Phone>;
const Rev2: React.FC = () => <Phone ecran={E2} from={L[4] - 4} to={L[5] - 2} entree="bascule" sortie="gauche">
  <Surligne at={L[4] + 2} {...Z2N} />
  <Surligne at={mot(/^deux/, 4)} {...Z2A} />
  <Pastille at={mot(/^deux/, 4) + 2} x={W * 0.5} y={H * 0.83} gold>2 mots sur 3</Pastille>
</Phone>;
const Rev3: React.FC = () => <Phone ecran={E3} from={L[5] - 4} to={L[6] - 2} entree="droite" sortie="traverse">
  <Surligne at={L[5] + 2} {...Z3N} fin={mot(/^récites/, 5) - 2} />
  <Surligne at={mot(/^récites/, 5)} {...Z3I} fin={mot(/^vérifies/, 5) - 2} />
  <Surligne at={mot(/^vérifies/, 5)} {...Z3R} />
</Phone>;

// ---------- 6. La révision espacée : sue, elle revient plus tard ; sinon, demain ----------
const Espacee: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[6], fps, config: { damping: 12, stiffness: 160 } });
  const loin = interpolate(f, [mot(/^plus/, 6), mot(/^tard/, 6) + 14], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const b = spring({ frame: f - mot(/^Sinon/, 6), fps, config: { damping: 12, stiffness: 160 } });
  const pres = interpolate(f, [mot(/^revient/, 6), mot(/^demain/, 6) + 10], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const ligne = (y: number, s: number, bouton: string, or: boolean, p: number, dest: string) => (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, height: 220, opacity: s, transform: `translateX(${(1 - s) * -200}px)` }}>
      <div style={{ position: "absolute", left: 0, top: 60, padding: "22px 34px", borderRadius: 26, background: or ? GOLD : "rgba(42,12,34,0.92)", boxShadow: or ? "0 0 40px rgba(233,196,106,0.6)" : `0 0 0 3px ${GOLD}`,
        color: or ? PLUM : "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 48 }}>{bouton}</div>
      <div style={{ position: "absolute", left: 380, right: 0, top: 108, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.2)" }} />
      <div style={{ position: "absolute", left: 380, width: 520 * p, top: 108, height: 6, borderRadius: 3, background: GOLD }} />
      <div style={{ position: "absolute", left: 380 + 520 * p - 30, top: 80, transform: `scale(${p > 0 ? 1 : 0})` }}><StarP size={60} glow={20} /></div>
      <div style={{ position: "absolute", right: 0, top: 150, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: or ? GOLD : "#fff", opacity: p }}>{dest}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {ligne(380, a, "Je l’ai sue", true, loin, "plus tard")}
      {ligne(720, b, "À revoir", false, pres * 0.3, "demain")}
    </AbsoluteFill>
  );
};

// ---------- 7. La bibliothèque ----------
const EB = "ecrans/biblio";
const ZN = zone(EB, /^304 invocations$/), ZTH = englobe(zone(EB, /^Du programme 21/), zone(EB, /^Pardon et repentir 8/));
const Biblio: React.FC = () => <Phone ecran={EB} from={L[7] - 4} to={LIEN - 2} entree="iris" sortie="recul" focus={[{ at: L[7] + 8, px: 0.5, py: 0.3, s: 1.06 }]}>
  <Surligne at={mot(/^300/, 7)} {...ZN} fin={mot(/^bibliothèque/, 7) - 2} />
  <Surligne at={mot(/^bibliothèque/, 7)} {...ZTH} />
  <Pastille at={mot(/^sourcées/, 7)} x={W * 0.5} y={H * 0.115} gold>Toutes sourcées</Pastille>
</Phone>;

const SFX: Sfx[] = [
  ["whoosh", 2, 0.5], ["tap", 14, 0.4], ["ding", mot(/^cœur/) + 4, 0.5],
  ["whoosh", L[1] - 8, 0.6], ["tick", mot(/^Apprendre/, 1) + 4, 0.4], ["tick", mot(/^retenir/, 1) + 4, 0.4], ["pop", mot(/^une/, 1) + 10, 0.4],
  ["tick", mot(/^révises/, 2) + 4, 0.4], ["tick", mot(/^reviennent/, 2) + 8, 0.4],
  ["whoosh", L[3] - 6, 0.6], ["pop", mot(/^mot/, 3) + 6, 0.4], ["tick", mot(/^complètes/, 3) + 6, 0.4],
  ["whoosh", L[4] - 6, 0.5], ["pop", mot(/^deux/, 4) + 8, 0.4],
  ["whoosh", L[5] - 6, 0.6], ["tick", mot(/^récites/, 5) + 6, 0.4], ["tap", mot(/^vérifies/, 5) + 8, 0.4],
  ["whoosh", L[6] - 6, 0.5], ["ding", mot(/^tard/, 6) + 8, 0.4], ["pop", mot(/^Sinon/, 6) + 2, 0.4],
  ["whoosh", L[7] - 6, 0.6], ["tick", mot(/^300/, 7) + 10, 0.4], ["pop", mot(/^sourcées/, 7) + 6, 0.4],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[7] - 6, L[8] - 10, T.DUREE]} />
    <Scene from={0} to={L[1] - 4} zin={0}><Accroche /></Scene>
    <Onglet />
    <Rev1 />
    <Rev2 />
    <Rev3 />
    <Scene from={L[6] - 4} to={L[7] - 2}><Espacee /></Scene>
    <Biblio />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Apprendre par cœur" /></Scene>
    <Flash at={L[1]} />
    <Voile />
    <SousTitres T={T} or={/^(cœur|Apprendre|retenir|révises|caché|mémoire|deux|tout|vérifies|tard|demain|300|sourcées|Sabab)/i} grandsDes={99} />
    <Son voix="fonction.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "fonction", component: Video, duree: T.DUREE };
