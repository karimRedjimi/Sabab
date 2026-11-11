import type { Metadata } from "next";
import { Bilan } from "@/components/views/Bilan";

export const metadata: Metadata = { title: "Mon bilan · Sabab" };

export default function Page() {
  return <Bilan />;
}
