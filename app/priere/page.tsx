import type { Metadata } from "next";
import { Priere } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Horaires de prière · Programme du rizq" };

export default function Page() {
  return <Priere />;
}
