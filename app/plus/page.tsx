import type { Metadata } from "next";
import { Plus } from "@/components/views/Plus";

export const metadata: Metadata = { title: "Plus · Programme du rizq" };

export default function Page() {
  return <Plus />;
}
