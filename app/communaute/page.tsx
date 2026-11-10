import type { Metadata } from "next";
import { Communaute } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Communauté · Programme du rizq" };

export default function Page() {
  return <Communaute />;
}
