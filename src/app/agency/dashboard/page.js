"use client";
import PortalDashboard from "@/app/components/PortalDashboard";

export default function AgencyDashboard() {
  return <PortalDashboard role="agency" homePath="/agency/dashboard" loginPath="/admin/login" />;
}
