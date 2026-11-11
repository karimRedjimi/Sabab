import type { Metadata } from "next";
import { Jour } from "@/components/views/Jour";

export const metadata: Metadata = { title: "Sabab" };

export default function Page() {
  return <Jour />;
}
