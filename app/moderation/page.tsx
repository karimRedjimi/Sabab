import type { Metadata } from "next";
import { Moderation } from "@/components/views/Communaute";

export const metadata: Metadata = { title: "Modération · Programme du rizq", robots: { index: false } };

export default function Page() {
  return <Moderation />;
}
