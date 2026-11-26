"use client";
// Renders one sidebar section of the ERP: its sub-tabs (the legacy sub-menus) and the
// active tab's module — generic CRUD, a settings form, or a purpose-built component.

import { useState } from "react";
import { SECTIONS } from "@/lib/erp/schema";
import { Tabs } from "./ui";
import CrudTable from "./CrudTable";
import SettingsForm from "./SettingsForm";
import { StudentList, StudentAdmission, DisabledStudents, MultiClass, BulkDelete, PromoteStudents } from "./Students";
import { FeesCollect, FeesSearchPayment, FeesDue, FeesCarryForward } from "./Fees";
import Documents from "./Documents";
import { CertTemplates, CertGenerate, IdCardTemplates, IdCardGenerate } from "./Certificates";
import { StudentAttendance, PrintAdmitCard, PrintMarksheet } from "./Academic";
import { ReportStudents, ReportFinance, ReportAttendance, ReportExams, ReportDocuments, ReportHr } from "./Reports";
import { Backup, LegacyImport } from "./DataTools";

const CUSTOM = {
  students: StudentList, studentAdmission: StudentAdmission, disabledStudents: DisabledStudents,
  multiClass: MultiClass, bulkDelete: BulkDelete, promoteStudents: PromoteStudents,
  feesCollect: FeesCollect, feesSearchPayment: FeesSearchPayment, feesDue: FeesDue, feesCarryForward: FeesCarryForward,
  documents: Documents,
  certTemplates: () => <CertTemplates kind="certificate" />, certGenerate: () => <CertGenerate />,
  idCardTemplates: () => <IdCardTemplates kind="student" />, idCardGenerate: () => <IdCardGenerate kind="student" />,
  staffIdCardTemplates: () => <IdCardTemplates kind="staff" />, staffIdCardGenerate: () => <IdCardGenerate kind="staff" />,
  studentAttendance: StudentAttendance, printAdmitCard: PrintAdmitCard, printMarksheet: PrintMarksheet,
  reportStudents: ReportStudents, reportFinance: ReportFinance, reportAttendance: ReportAttendance,
  reportExams: ReportExams, reportDocuments: ReportDocuments, reportHr: ReportHr,
  backup: Backup, legacyImport: LegacyImport,
};

// Rendered with key={sectionId} by PortalDashboard, so the tab resets per section.
export default function ErpSection({ sectionId }) {
  const section = SECTIONS.find(s => s.id === sectionId);
  const [tab, setTab] = useState(section?.tabs[0].id);
  if (!section) return null;
  const active = section.tabs.find(t => t.id === tab) || section.tabs[0];
  const Custom = active.custom && CUSTOM[active.custom];

  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>{section.label}</h2>
      {section.tabs.length > 1 && <Tabs tabs={section.tabs} active={active.id} onChange={setTab} />}
      {active.entity && <CrudTable key={active.entity} entityKey={active.entity} />}
      {active.singleton && <SettingsForm key={active.singleton} settingsKey={active.singleton} />}
      {Custom && <Custom key={active.custom} />}
    </div>
  );
}
