import type { Metadata } from "next";
import { Moderation } from "@/components/views/Communaute";

export const metadata: Metadata = { title: "Modération · Sabab", robots: { index: false } };

export default function Page() {
  return <Moderation />;
}
