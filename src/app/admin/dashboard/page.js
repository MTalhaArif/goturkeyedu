"use client";
import PortalDashboard from "@/app/components/PortalDashboard";

export default function AdminDashboard() {
  return <PortalDashboard role="super_admin" homePath="/admin/dashboard" loginPath="/admin/login" />;
}
