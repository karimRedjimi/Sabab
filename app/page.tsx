import type { Metadata } from "next";
import { Jour } from "@/components/views/Jour";

export const metadata: Metadata = { title: "Programme du rizq" };

export default function Page() {
  return <Jour />;
}
