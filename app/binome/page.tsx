import type { Metadata } from "next";
import { Binome } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Mon binôme · Sabab" };

export default function Page() {
  return <Binome />;
}
