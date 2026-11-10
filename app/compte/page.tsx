import type { Metadata } from "next";
import { Compte } from "@/components/views/Compte";

export const metadata: Metadata = { title: "Mon compte · Programme du rizq", robots: { index: false } };

export default function Page() {
  return <Compte />;
}
