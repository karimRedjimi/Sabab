import type { Metadata } from "next";
import { Notifications } from "@/components/views/Notifications";

export const metadata: Metadata = { title: "Notifications · Sabab" };

export default function Page() {
  return <Notifications />;
}
