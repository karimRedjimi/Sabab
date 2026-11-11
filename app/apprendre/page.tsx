import type { Metadata } from "next";
import { Apprendre } from "@/components/views/Apprendre";

export const metadata: Metadata = { title: "Apprendre par cœur · Sabab" };

export default function Page() {
  return <Apprendre />;
}
