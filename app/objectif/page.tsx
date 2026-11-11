import type { Metadata } from "next";
import { Objectif } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Mon objectif · Sabab" };

export default function Page() {
  return <Objectif />;
}
