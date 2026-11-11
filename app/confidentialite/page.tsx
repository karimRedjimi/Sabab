import type { Metadata } from "next";
import { Confidentialite } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Confidentialité · Sabab" };

export default function Page() {
  return <Confidentialite />;
}
