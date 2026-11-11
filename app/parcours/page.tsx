import type { Metadata } from "next";
import { Parcours } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Parcours de 40 jours · Sabab" };

export default function Page() {
  return <Parcours />;
}
