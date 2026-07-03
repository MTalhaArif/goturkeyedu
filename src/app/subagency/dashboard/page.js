"use client";
import PortalDashboard from "@/app/components/PortalDashboard";

export default function SubAgencyDashboard() {
  return <PortalDashboard role="sub_agency" homePath="/subagency/dashboard" loginPath="/admin/login" />;
}
