import type { Metadata } from "next";
import { FinCycle } from "@/components/views/FinCycle";

export const metadata: Metadata = { title: "Fin du cycle · Sabab" };

export default function Page() {
  return <FinCycle />;
}
