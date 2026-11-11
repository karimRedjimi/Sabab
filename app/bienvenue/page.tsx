import type { Metadata } from "next";
import { Bienvenue } from "@/components/views/Bienvenue";

export const metadata: Metadata = { title: "Bienvenue · Sabab" };

export default function Page() {
  return <Bienvenue />;
}
