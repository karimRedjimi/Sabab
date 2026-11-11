import type { Metadata } from "next";
import { Coran } from "@/components/views/Coran";

export const metadata: Metadata = { title: "Rappel du Coran · Sabab" };

export default function Page() {
  return <Coran />;
}
