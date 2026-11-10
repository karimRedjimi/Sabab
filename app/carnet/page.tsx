import type { Metadata } from "next";
import { Carnet } from "@/components/views/Carnet";

export const metadata: Metadata = { title: "Carnet des invocations · Programme du rizq" };

export default function Page() {
  return <Carnet />;
}
