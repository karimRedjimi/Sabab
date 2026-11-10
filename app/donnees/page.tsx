import type { Metadata } from "next";
import { Donnees } from "@/components/views/Donnees";

export const metadata: Metadata = { title: "Mes données · Programme du rizq" };

export default function Page() {
  return <Donnees />;
}
