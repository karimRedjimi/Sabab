import type { Metadata } from "next";
import { Priere } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Horaires de prière · Sabab" };

export default function Page() {
  return <Priere />;
}
