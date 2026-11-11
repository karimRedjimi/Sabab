import type { Metadata } from "next";
import { Chemin } from "@/components/views/Chemin";

export const metadata: Metadata = { title: "Mon chemin · Sabab" };

export default function Page() {
  return <Chemin />;
}
