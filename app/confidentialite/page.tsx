import type { Metadata } from "next";
import { Confidentialite } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Confidentialité · Programme du rizq" };

export default function Page() {
  return <Confidentialite />;
}
