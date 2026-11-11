import type { Metadata } from "next";
import { Suivi } from "@/components/views/Suivi";

export const metadata: Metadata = { title: "Ton suivi · Sabab" };

export default function Page() {
  return <Suivi />;
}
