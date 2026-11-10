import type { Metadata } from "next";
import { Rythme } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Mon rythme · Programme du rizq" };

export default function Page() {
  return <Rythme />;
}
