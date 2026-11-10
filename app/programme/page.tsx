import type { Metadata } from "next";
import { Programme } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Le programme · Programme du rizq" };

export default function Page() {
  return <Programme />;
}
