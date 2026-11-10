import type { Metadata } from "next";
import { Bienvenue } from "@/components/views/Bienvenue";

export const metadata: Metadata = { title: "Bienvenue · Programme du rizq" };

export default function Page() {
  return <Bienvenue />;
}
