// « Le moment du calendrier » : samedi 28 novembre 2026, thème du samedi « La barakah dans ce qu’on a » (programme.ts · DAYS Samedi, anas, rahim).
// Textes religieux : public/voix/moment.textes.json (copiés par programme). De la note d’anas, on affiche seulement la première phrase (coupée, jamais modifiée) :
// pas la suite (« ses biens… devenus très nombreux »), qui pourrait sonner comme une promesse. Du geste (rahim), seulement le titre et la description, pas la note.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/moment.json";
import tx from "../../public/voix/moment.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua, G = tx.geste, J = tx.jour;
const NOTE = D.note.slice(0, D.note.indexOf("personne.") + "personne.".length); // « Le Prophète ﷺ l’a faite pour Anas, à la demande de sa mère ; elle est ici adaptée à la première personne. »
const AvecSalut: React.FC<{ t: string }> = ({ t }) => <>{t.split(/(ﷺ)/).map((p, i) => p === "ﷺ" ? <span key={i} style={{ fontFamily: AR }}>{p}</span> : p)}</>;
const THEME = mot(/^thème/);

// ---------- 1. L’accroche : la page de vendredi se tourne, samedi apparaît ----------
const Calendrier: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const tourne = interpolate(f, [2, mot(/^samedi/)], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const v = spring({ frame: f - mot(/^samedi/), fps, config: { damping: 9, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 260, top: 300, width: 520, height: 560, perspective: 1800 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "#fff", boxShadow: `0 0 ${60 * v}px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)`, overflow: "hidden", transform: `scale(${0.9 + 0.1 * v})` }}>
          <div style={{ height: 130, background: GOLD, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: PLUM, letterSpacing: "0.1em" }}>{J.name.toUpperCase()}</div>
          <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 250, lineHeight: 1.2, color: PLUM }}>28</div>
          <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 48, color: "rgba(42,12,34,0.6)" }}>novembre</div>
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "#EDE4EA", transformOrigin: "50% 0%", transform: `rotateX(${tourne * 105}deg)`, backfaceVisibility: "hidden", opacity: tourne < 0.95 ? 1 : 0, overflow: "hidden" }}>
          <div style={{ height: 130, background: "#B9A6B3", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", letterSpacing: "0.1em" }}>VENDREDI</div>
          <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 250, lineHeight: 1.2, color: "rgba(42,12,34,0.5)" }}>27</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. La journée du samedi : le thème, dans l’appli ----------
const EJ = "ecrans/journee";
const ZT = zone(EJ, /^Thème du samedi/);
const Journee: React.FC = () => <Phone ecran={EJ} from={THEME - 6} to={L[1] - 2} entree="bas" sortie="gauche" focus={[{ at: THEME + 4, px: 0.5, py: 0.6, s: 1.06 }]}>
  <Surligne at={mot(/^barakah/)} {...ZT} />
</Phone>;

// ---------- 3. Pour Anas : la note (première phrase), une étoile pour la mère, une pour l’enfant ----------
const Anas: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[1], fps, config: { damping: 13, stiffness: 130 } });
  const e1 = spring({ frame: f - mot(/^Anas/, 1), fps, config: { damping: 9, stiffness: 190 } });
  const e2 = spring({ frame: f - mot(/^mère/, 1), fps, config: { damping: 9, stiffness: 190 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 120 }}>
        <div style={{ textAlign: "center", transform: `scale(${e2})`, opacity: e2 }}><StarP size={210} glow={30} /><div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: "#fff", marginTop: 14 }}>sa mère</div></div>
        <div style={{ textAlign: "center", transform: `scale(${e1})`, opacity: e1 }}><StarP size={150} glow={30} /><div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, color: GOLD, marginTop: 14 }}>Anas</div></div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 760, padding: "40px 44px", borderRadius: 40, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.5), 0 30px 80px rgba(0,0,0,0.45)", textAlign: "center",
        fontFamily: FONT, fontWeight: 600, fontSize: 46, lineHeight: 1.4, color: "#fff", opacity: a, transform: `translateY(${(1 - a) * 50}px)` }}><AvecSalut t={NOTE} /></div>
    </AbsoluteFill>
  );
};

// ---------- 4. L’invocation : arabe, phonétique, traduction (copiés à l’identique) ----------
const Dua: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[2], fps, config: { damping: 15, stiffness: 100 } });
  const b = interpolate(f, [L[2] + 16, L[2] + 32], [0, 1], C);
  const halo = 0.5 + 0.5 * Math.sin(f / 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", opacity: a }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, border: `3px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: "0.06em" }}>{D.title.toUpperCase()}</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 300, padding: "50px 40px", borderRadius: 50, background: "rgba(42,12,34,0.92)", textAlign: "center", opacity: a, transform: `scale(${0.94 + 0.06 * a})`,
        boxShadow: `0 0 0 3px rgba(233,196,106,${0.5 + 0.3 * halo}), 0 0 ${40 + 40 * halo}px rgba(233,196,106,0.35), 0 40px 100px rgba(0,0,0,0.5)` }}>
        <div dir="rtl" lang="ar" style={{ fontFamily: AR, fontSize: 92, lineHeight: 1.8, color: GOLD, textShadow: "0 0 30px rgba(233,196,106,0.45)" }}>{D.ar}</div>
        <div style={{ fontFamily: FONT, fontStyle: "italic", fontSize: 42, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginTop: 14, opacity: b }}>{D.ph}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.3, color: "#fff", marginTop: 22, opacity: b }}>{D.fr}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Dans Sabab : la fiche, avec sa source ----------
const EF = "ecrans/fiche-anas";
const ZF = englobe(zone(EF, /^La barakah dans ce qu’on a$/, 1), zone(EF, /^Ô Allah, augmente mes biens/)), ZS = zone(EF, /^Source : Al-Bukhârî \(n° 6334\)/);
const Fiche: React.FC = () => <Phone ecran={EF} from={L[3] - 4} to={L[4] - 2} entree="zoom" sortie="recul" focus={[{ at: L[3] + 6, px: 0.5, py: 0.35, s: 1.06 }]}>
  <Surligne at={L[3] + 4} {...ZF} fin={mot(/^Al-Bukhârî/, 3) - 2} />
  <Surligne at={mot(/^Al-Bukhârî/, 3)} {...ZS} />
</Phone>;

// ---------- 6. Le geste du jour : un téléphone qui sonne, une porte qui s’ouvre ----------
const Geste: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[4], fps, config: { damping: 11, stiffness: 150 } });
  const ap = spring({ frame: f - mot(/^appeler/, 4), fps, config: { damping: 8, stiffness: 200 } });
  const vi = spring({ frame: f - mot(/^visiter/, 4), fps, config: { damping: 8, stiffness: 200 } });
  const vib = Math.sin(f * 1.6) * 6 * Math.max(0, 1 - (f - mot(/^appeler/, 4)) / 30);
  const Rond: React.FC<{ s: number; children: React.ReactNode; x: number }> = ({ s, children, x }) => <div style={{ position: "absolute", left: x - 130, top: 330, width: 260, height: 260, borderRadius: "50%", background: PLUM, boxShadow: `0 0 0 6px ${GOLD}, 0 0 60px rgba(233,196,106,0.6)`, display: "grid", placeItems: "center", transform: `scale(${s})` }}>
    <svg width={130} height={130} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  </div>;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", transform: `scale(${a})` }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44, letterSpacing: "0.06em" }}>LE GESTE DU JOUR</span>
      </div>
      <div style={{ transform: `rotate(${vib}deg)` }}><Rond s={ap} x={360}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></Rond></div>
      <Rond s={vi} x={720}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></Rond>
      <div style={{ position: "absolute", left: 80, right: 80, top: 700, padding: "40px 40px", borderRadius: 40, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.5)", textAlign: "center", opacity: a }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: "#fff", lineHeight: 1.2 }}>{G.title}</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.75)", lineHeight: 1.4, marginTop: 16 }}>{G.desc}</div>
      </div>
    </AbsoluteFill>
  );
};

const FIN = L[5];
const SFX: Sfx[] = [
  ["whoosh", 2, 0.35], ["impact", mot(/^samedi/) - 2, 0.45], ["whoosh", THEME - 20, 0.35], ["tick", mot(/^barakah/) + 10, 0.35],
  ["whoosh", L[1] - 18, 0.4], ["pop", mot(/^Anas/, 1) + 10, 0.35], ["pop", mot(/^mère/, 1) + 10, 0.35],
  ["shimmer", L[2] - 8, 0.35],
  ["whoosh", L[3] - 18, 0.4], ["tick", mot(/^Al-Bukhârî/, 3) + 12, 0.35],
  ["whoosh", L[4] - 18, 0.4], ["vibration", mot(/^appeler/, 4) + 4, 0.3], ["pop", mot(/^visiter/, 4) + 12, 0.35],
  ["whoosh", FIN - 18, 0.4], ["impact", FIN - 2, 0.5], ["shimmer", mot(/^lien/, 5) + 14, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2], L[4], FIN, T.DUREE]} />
    <Scene from={0} to={THEME - 4} zin={0}><Calendrier /></Scene>
    <Journee />
    <Scene from={L[1] - 4} to={L[2] - 2}><Anas /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 4}><Dua /></Scene>
    <Fiche />
    <Scene from={L[4] - 4} to={FIN - 2}><Geste /></Scene>
    <Scene from={FIN - 4} to={T.DUREE + 10} zin={0}><Logo at={FIN} phrase="Le lien est en bio" /></Scene>
    <Flash at={mot(/^samedi/)} />
    <Voile />
    <SousTitres T={T} or={/^(samedi|barakah|Prophète|Anas|mère|Allah|biens|bénis-moi|Al-Bukhârî|Muslim|appeler|visiter|proche|Sabab)/i} grandsDes={99} />
    <Son voix="moment.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "moment", component: Video, duree: T.DUREE };
