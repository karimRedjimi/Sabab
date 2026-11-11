import type { Metadata } from "next";
import { Communaute } from "@/components/views/Communaute";

export const metadata: Metadata = { title: "Communauté · Sabab" };

export default function Page() {
  return <Communaute />;
}
