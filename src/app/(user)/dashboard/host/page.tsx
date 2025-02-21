import PropertiesDisplay from "@/components/common/PropertiesDisplay";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host Dashboard",
  description: "Host dashboard page",
};

export default function HostDashboard() {
  return <PropertiesDisplay owned />;
}
