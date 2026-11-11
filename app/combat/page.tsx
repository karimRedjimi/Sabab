import type { Metadata } from "next";
import { Combat } from "@/components/views/Combat";

export const metadata: Metadata = { title: "Mon combat · Sabab", robots: { index: false } };

export default function Page() {
  return <Combat />;
}
