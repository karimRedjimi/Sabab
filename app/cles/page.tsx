import type { Metadata } from "next";
import { Cles } from "@/components/views/Cles";

export const metadata: Metadata = { title: "Clés des rappels · Sabab", robots: { index: false } };

export default function Page() {
  return <Cles />;
}
