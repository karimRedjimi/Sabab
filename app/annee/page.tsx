import type { Metadata } from "next";
import { Annee } from "@/components/views/FinCycle";

export const metadata: Metadata = { title: "Ton année · Sabab" };

export default function Page() {
  return <Annee />;
}
