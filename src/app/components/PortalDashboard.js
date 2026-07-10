"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { adminDict } from "@/app/data/adminTranslations";
import { auth } from "@/lib/firebase";
import {
  getAgencies, getSubAgenciesByParent, getAllSubAgencies,
  addStudent, deleteStudent,
  getStudentsByAgency, getStudentsByOwner, getAllStudents,
  getAllStudentUsers, getAllApplicationsForAdmin, updateApplicationStage,
} from "@/lib/firestore";

const MOCK_DATA = {
  enquiries: [
    { name: "John Doe", phone: "+44 7700 900077", source: "Website", date: "01/07/2026", nextFollowUp: "05/07/2026", status: "Active" }
  ],
  fees: [
    { name: "Ahmet Yılmaz", feeType: "Tuition Fee", dueDate: "10/07/2026", amount: "₺15,000", status: "Unpaid", balance: "₺15,000" },
    { name: "Aisha Khan", feeType: "Application Fee", dueDate: "01/06/2026", amount: "₺1,000", status: "Paid", balance: "₺0" }
  ],
  exams: [
    { name: "Midterm Evaluation", group: "Turkish Language A1", subjects: 4, date: "15/08/2026", status: "Scheduled" },
    { name: "Final Placement Exam", group: "University Prep", subjects: 6, date: "20/09/2026", status: "Pending" }
  ],
  onlineExams: [
    { title: "Vocabulary Quiz 1", class: "Turkish A1", totalQuestions: 20, duration: "30 Mins", status: "Published" }
  ],
  lessonPlans: [
    { day: "Monday", subject: "Turkish Grammar", topic: "Past Tense", teacher: "Fatma Demir", time: "09:00 - 10:30" }
  ],
  academics: [
    { class: "Turkish A1", section: "Morning", subjects: 3, teacher: "Fatma Demir", students: 24 }
  ],
  hr: [
    { id: "9001", name: "Fatma Demir", role: "Teacher", dept: "Academic", phone: "+90 555 111 2233", status: "Active" },
    { id: "9002", name: "Can Yilmaz", role: "Accountant", dept: "Finance", phone: "+90 555 222 3344", status: "Active" }
  ],
  courses: [
    { title: "Intensive Turkish B1", teacher: "Fatma Demir", price: "₺5000", students: 18, status: "Active" }
  ],
  zoom: [
    { title: "Conversation Practice", date: "02/07/2026", time: "14:00", duration: "60 Mins", staff: "Fatma Demir", status: "Awaiting" }
  ],
  downloads: [
    { title: "A1 Grammar Workbook", type: "Study Material", date: "01/07/2026", size: "2.4 MB" }
  ],
  events: [
    { title: "Orientation Day", venue: "Main Hall", start: "10/07/2026", end: "10/07/2026" }
  ]
};

// "Settings" has no real implementation for anyone (it's the fallback placeholder even
// for Super Admin) — Agency/Sub-Agency additionally never see it at all, per the
// "agency will not have settings" requirement. Agencies-management is Super Admin only;
// Sub-Agencies-management belongs to the Agency that owns them (a Sub-Agency is the
// leaf of the hierarchy and creates no accounts of its own).
function isVisibleForRole(menuId, role) {
  if (menuId === "settings") return role === "super_admin";
  if (menuId === "agencies") return role === "super_admin";
  if (menuId === "subagencies") return role === "agency";
  if (menuId === "applications") return role === "super_admin";
  return true;
}

export default function PortalDashboard({ role, homePath, loginPath }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { lang, setLang } = useLanguage();

  // Certificate module state (must be at top level — Rules of Hooks)
  const [certTab, setCertTab] = useState("templates");
  const [certLang, setCertLang] = useState("EN"); // output language of the generated certificate/ID card — independent of the admin dashboard's own display language
  const [certPreview, setCertPreview] = useState(null);
  const [genCriteria, setGenCriteria] = useState({ cls: "", section: "", cert: "" });
  const [genStudents, setGenStudents] = useState([]);

  // Tenant-scoped, real Firestore-backed data
  const [agencies, setAgencies] = useState([]);
  const [subAgencies, setSubAgencies] = useState([]);
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: "", admNo: "", class: "", section: "", email: "", phone: "", nationality: "" });
  const [createModal, setCreateModal] = useState(null); // "agency" | "subagency" | null
  const [appRows, setAppRows] = useState([]); // one row per application, joined with its owning student (super_admin only)
  const [reviewModal, setReviewModal] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("goturkey_user");
    if (!stored) { router.push(loginPath); return; }
    const u = JSON.parse(stored);
    if (u.role !== role) { router.push(loginPath); return; }
    setUser(u);
  }, []);

  const refreshTenantData = async (u) => {
    if (role === "super_admin") {
      const [ag, subs, studs, studentUsers, apps] = await Promise.all([getAgencies(), getAllSubAgencies(), getAllStudents(), getAllStudentUsers(), getAllApplicationsForAdmin()]);
      setAgencies(ag); setSubAgencies(subs); setStudents(studs);
      const userByUid = Object.fromEntries(studentUsers.map(su => [su.id, su]));
      setAppRows(apps.map(a => ({
        ...a,
        studentName: userByUid[a.studentUid]?.name || "—",
        studentEmail: userByUid[a.studentUid]?.email || "—",
      })));
    } else if (role === "agency") {
      const [subs, studs] = await Promise.all([getSubAgenciesByParent(u.uid), getStudentsByAgency(u.uid)]);
      setSubAgencies(subs); setStudents(studs);
    } else if (role === "sub_agency") {
      setStudents(await getStudentsByOwner(u.uid));
    }
  };

  useEffect(() => { if (user) refreshTenantData(user); }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("goturkey_user");
    router.push(loginPath);
  };

  if (!user) return <div style={{ minHeight: "100vh", background: "#f8fafc" }}></div>;

  const t = adminDict[lang] || adminDict["EN"];

  const SIDEBAR_MENUS = [
    { id: "dashboard", icon: "📊", label: t.sidebar.dashboard },
    { id: "agencies", icon: "🏛️", label: t.sidebar.agencies },
    { id: "subagencies", icon: "🏢", label: t.sidebar.subagencies },
    { id: "front_office", icon: "🏢", label: t.sidebar.front_office },
    { id: "student_info", icon: "👥", label: t.sidebar.student_info },
    { id: "fees", icon: "💰", label: t.sidebar.fees },
    { id: "exams", icon: "📝", label: t.sidebar.exams },
    { id: "online_exams", icon: "💻", label: t.sidebar.online_exams },
    { id: "lesson_plan", icon: "📅", label: t.sidebar.lesson_plan },
    { id: "academics", icon: "🎓", label: t.sidebar.academics },
    { id: "hr", icon: "🤝", label: t.sidebar.hr },
    { id: "online_course", icon: "▶️", label: t.sidebar.online_course },
    { id: "zoom", icon: "📹", label: t.sidebar.zoom },
    { id: "download", icon: "⬇️", label: t.sidebar.download },
    { id: "certificate", icon: "📜", label: t.sidebar.certificate },
    { id: "cms", icon: "🖥️", label: t.sidebar.cms },
    { id: "alumni", icon: "🎓", label: t.sidebar.alumni },
    { id: "reports", icon: "📊", label: t.sidebar.reports },
    { id: "applications", icon: "📋", label: t.sidebar.applications },
    { id: "settings", icon: "⚙️", label: t.sidebar.settings }
  ].filter((m) => isVisibleForRole(m.id, role));

  // -- COMPONENT FACTORIES FOR EACH MODULE --
  const HeaderControls = ({ title, btnText, onBtnClick }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, animation: "fadeIn 0.3s" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h2>
      {btnText && (
        <button onClick={onBtnClick} style={{ background: "#E03C31", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(224,60,49,0.3)" }}>
          {btnText}
        </button>
      )}
    </div>
  );

  const CriteriaFilter = ({ fields }) => (
    <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", marginBottom: 24, animation: "fadeIn 0.3s" }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>{t.common.selectCriteria}</h4>
      <div style={{ display: "flex", gap: 16 }}>
        {fields.map((f, i) => (
          f.type === "select" ? (
            <select key={i} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}>
              <option>{f.placeholder}</option>
            </select>
          ) : (
            <input key={i} type={f.type || "text"} placeholder={f.placeholder} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
          )
        ))}
        <button style={{ background: "#0f172a", color: "white", border: "none", padding: "0 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>{t.common.search}</button>
      </div>
    </div>
  );

  const DataTable = ({ columns, data, renderRow }) => (
    <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", overflow: "hidden", padding: 24, animation: "fadeIn 0.3s" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", textAlign: "left", direction: lang === "AR" ? "rtl" : "ltr" }}>
            {columns.map((c, i) => <th key={i} style={{ padding: "12px 8px" }}>{c}</th>)}
          </tr>
        </thead>
        <tbody style={{ direction: lang === "AR" ? "rtl" : "ltr" }}>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // -- MODULE RENDERERS --
  const renderDashboard = () => (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
        {[
          { title: t.dashboard.feesAwaiting, val: "0/0", icon: "💰", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
          { title: t.dashboard.leads, val: "0/0", icon: "📈", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
          { title: t.dashboard.staffPresent, val: "0/14", icon: "👥", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }
        ].map((stat, i) => (
          <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>{stat.title}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{stat.val}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {[
          { val: "0", label: t.dashboard.feesUnpaid, color: "#ef4444" },
          { val: "0", label: t.dashboard.enquiryActive, color: "#10b981" },
          { val: "₺0", label: t.dashboard.monthlyFees, color: "#3b82f6" },
          { val: String(students.length), label: t.dashboard.totalStudents, color: "#f59e0b" }
        ].map((w, i) => (
          <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: w.color, marginBottom: 8 }}>{w.val}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>{w.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFrontOffice = () => (
    <>
      <HeaderControls title={t.frontOffice.title} btnText={t.frontOffice.addBtn} />
      <CriteriaFilter fields={[ { type: "select", placeholder: t.frontOffice.source }, { type: "text", placeholder: t.frontOffice.fromDate }, { type: "text", placeholder: t.frontOffice.toDate }, { type: "select", placeholder: t.common.status } ]} />
      <DataTable
        columns={t.frontOffice.cols}
        data={MOCK_DATA.enquiries}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.name}</td><td>{r.phone}</td><td>{r.source}</td><td>{r.date}</td><td>{r.nextFollowUp}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{r.status}</span></td>
            <td><button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>✏️</button></td>
          </>
        )}
      />
    </>
  );

  const renderFees = () => (
    <>
      <HeaderControls title={t.fees.title} />
      <CriteriaFilter fields={[ { type: "select", placeholder: t.fees.group }, { type: "select", placeholder: t.studentInfo.class }, { type: "select", placeholder: t.studentInfo.section } ]} />
      <DataTable
        columns={t.fees.cols}
        data={MOCK_DATA.fees}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.name}</td><td>{r.feeType}</td><td>{r.dueDate}</td><td>{r.amount}</td><td style={{color:"#ef4444", fontWeight:600}}>{r.balance}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: r.status === "Paid" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: r.status === "Paid" ? "#10b981" : "#ef4444" }}>{r.status}</span></td>
            <td><button style={{ background: "#E03C31", color: "white", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontWeight:600, fontSize:12 }}>{t.fees.collect}</button></td>
          </>
        )}
      />
    </>
  );

  const renderExams = () => (
    <>
      <HeaderControls title={t.exams.title} btnText={t.exams.addBtn} />
      <DataTable
        columns={t.exams.cols}
        data={MOCK_DATA.exams}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.name}</td><td>{r.group}</td><td>{r.subjects}</td><td>{r.date}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{r.status}</span></td>
            <td><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>⚙️</button></td>
          </>
        )}
      />
    </>
  );

  const renderOnlineExams = () => (
    <>
      <HeaderControls title={t.onlineExams.title} btnText={t.onlineExams.addBtn} />
      <DataTable
        columns={t.onlineExams.cols}
        data={MOCK_DATA.onlineExams}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.title}</td><td>{r.class}</td><td>{r.totalQuestions}</td><td>{r.duration}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{r.status}</span></td>
            <td><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>📊</button></td>
          </>
        )}
      />
    </>
  );

  const renderLessonPlan = () => (
    <>
      <HeaderControls title={t.lessonPlan.title} btnText={t.lessonPlan.addBtn} />
      <CriteriaFilter fields={[ { type: "select", placeholder: t.lessonPlan.teacher }, { type: "select", placeholder: t.studentInfo.class }, { type: "select", placeholder: t.lessonPlan.subject } ]} />
      <DataTable
        columns={t.lessonPlan.cols}
        data={MOCK_DATA.lessonPlans}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.day}</td><td>{r.subject}</td><td>{r.topic}</td><td>{r.teacher}</td><td>{r.time}</td>
            <td><button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>✏️</button></td>
          </>
        )}
      />
    </>
  );

  const renderAcademics = () => (
    <>
      <HeaderControls title={t.academics.title} />
      <DataTable
        columns={t.academics.cols}
        data={MOCK_DATA.academics}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.class}</td><td>{r.section}</td><td>{r.subjects}</td><td>{r.teacher}</td><td>{r.students}</td>
            <td><button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>👁️</button></td>
          </>
        )}
      />
    </>
  );

  const renderHR = () => (
    <>
      <HeaderControls title={t.hr.title} btnText={t.hr.addBtn} />
      <CriteriaFilter fields={[ { type: "select", placeholder: t.hr.role }, { type: "text", placeholder: t.common.searchKeyword } ]} />
      <DataTable
        columns={t.hr.cols}
        data={MOCK_DATA.hr}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.id}</td><td style={{fontWeight:600}}>{r.name}</td><td>{r.role}</td><td>{r.dept}</td><td>{r.phone}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{r.status}</span></td>
            <td><button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>{t.hr.profile}</button></td>
          </>
        )}
      />
    </>
  );

  const renderOnlineCourse = () => (
    <>
      <HeaderControls title={t.onlineCourse.title} btnText={t.onlineCourse.addBtn} />
      <DataTable
        columns={t.onlineCourse.cols}
        data={MOCK_DATA.courses}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.title}</td><td>{r.teacher}</td><td style={{fontWeight:700, color:"#10b981"}}>{r.price}</td><td>{r.students}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{r.status}</span></td>
            <td><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>⚙️</button></td>
          </>
        )}
      />
    </>
  );

  const renderZoom = () => (
    <>
      <HeaderControls title={t.zoom.title} btnText={t.zoom.addBtn} />
      <DataTable
        columns={t.zoom.cols}
        data={MOCK_DATA.zoom}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.title}</td><td>{r.date}</td><td>{r.time}</td><td>{r.duration}</td><td>{r.staff}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{r.status}</span></td>
            <td><button style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontWeight:600, fontSize:12 }}>{t.zoom.start}</button></td>
          </>
        )}
      />
    </>
  );

  const renderDownload = () => (
    <>
      <HeaderControls title={t.download.title} btnText={t.download.addBtn} />
      <DataTable
        columns={t.download.cols}
        data={MOCK_DATA.downloads}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.title}</td><td>{r.type}</td><td>{r.date}</td><td>{r.size}</td>
            <td><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>⬇️</button></td>
          </>
        )}
      />
    </>
  );

  // -- STUDENT INFO (real, tenant-scoped Firestore data) --
  const handleAddStudent = async () => {
    if (!newStudent.name) return;
    const agencyId = role === "agency" ? user.uid : role === "sub_agency" ? user.parentAgencyId : null;
    if (!agencyId) return; // Super Admin doesn't add students directly — agencies manage their own
    await addStudent({
      ...newStudent,
      admNo: newStudent.admNo || `GTK-${Date.now().toString().slice(-6)}`,
      status: "active",
      agencyId,
      ownerId: user.uid,
    });
    setNewStudent({ name: "", admNo: "", class: "", section: "", email: "", phone: "", nationality: "" });
    refreshTenantData(user);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm(t.studentInfo.confirmDelete)) return;
    await deleteStudent(id);
    refreshTenantData(user);
  };

  const ownerName = (ownerId) => {
    if (ownerId === user.uid) return user.name;
    const found = [...agencies, ...subAgencies].find(a => a.id === ownerId);
    return found?.name || "—";
  };

  const renderStudentInfo = () => (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <HeaderControls title={t.studentInfo.title} />
      {role !== "super_admin" && (
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>{t.studentInfo.addBtn}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <input placeholder={t.studentInfo.name} value={newStudent.name} onChange={e => setNewStudent(p => ({...p, name: e.target.value}))} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
            <input placeholder={t.studentInfo.class} value={newStudent.class} onChange={e => setNewStudent(p => ({...p, class: e.target.value}))} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
            <input placeholder={t.studentInfo.section} value={newStudent.section} onChange={e => setNewStudent(p => ({...p, section: e.target.value}))} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
            <input placeholder={t.studentInfo.email} value={newStudent.email} onChange={e => setNewStudent(p => ({...p, email: e.target.value}))} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
            <input placeholder={t.studentInfo.phone} value={newStudent.phone} onChange={e => setNewStudent(p => ({...p, phone: e.target.value}))} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
            <input placeholder={t.studentInfo.nationality} value={newStudent.nationality} onChange={e => setNewStudent(p => ({...p, nationality: e.target.value}))} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
          </div>
          <button onClick={handleAddStudent} style={{ marginTop: 14, background: "#E03C31", color: "white", border: "none", padding: "10px 22px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>{t.studentInfo.addBtn}</button>
        </div>
      )}
      <DataTable
        columns={role === "super_admin" ? [...t.studentInfo.cols, t.agencies.title] : t.studentInfo.cols}
        data={students}
        renderRow={s => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600, color: "#0f172a" }}>{s.admNo}</td><td>{s.name}</td><td>{s.class}</td><td>{s.section}</td><td>{s.email}</td><td>{s.phone}</td>
            <td><button onClick={() => handleDeleteStudent(s.id)} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>🗑️</button></td>
            {role === "super_admin" && <td>{ownerName(s.ownerId)}</td>}
          </>
        )}
      />
    </div>
  );

  // -- CERTIFICATE MODULE (visual design unchanged; generate/ID-card tabs now read
  //    from the real, tenant-scoped `students` list instead of hardcoded mock data) --
  // Output-language text for the generated certificate/ID card itself (the student-facing
  // document), independent of adminDict which only covers the dashboard's own UI chrome.
  const CERT_TEXT = {
    EN: {
      academy: "GO TURKEY AND STUDY ACADEMY",
      certificate: "CERTIFICATE",
      ofAppreciation: "OF APPRECIATION",
      presentedTo: "This certificate is proudly presented to",
      admissionNo: "Admission No",
      bodyLine1: (cls) => <>Has successfully completed the <strong>{cls}</strong> (Turkish Language Course) Programme</>,
      bodyLine2: "This Certificate grade equals to Common European Framework of Reference Language Level",
      date: "DATE",
      signature: "SIGNATURE",
      verify: "VERIFY",
      verifyPrefix: "Verify",
      print: "Print",
      studentId: "STUDENT ID",
      printIdCard: "Print ID Card",
      academyShort: "Go Turkey & Study Academy",
    },
    TR: {
      academy: "GO TURKEY AND STUDY ACADEMY",
      certificate: "SERTİFİKA",
      ofAppreciation: "TAKDİR BELGESİ",
      presentedTo: "Bu sertifika onurla takdim edilir",
      admissionNo: "Kayıt No",
      bodyLine1: (cls) => <><strong>{cls}</strong> (Türkçe Dil Kursu) Programını başarıyla tamamlamıştır</>,
      bodyLine2: "Bu Sertifika derecesi, Avrupa Dilleri Ortak Çerçeve Programı seviyesine eşittir",
      date: "TARİH",
      signature: "İMZA",
      verify: "DOĞRULA",
      verifyPrefix: "Doğrulama",
      print: "Yazdır",
      studentId: "ÖĞRENCİ KİMLİĞİ",
      printIdCard: "Kimlik Kartını Yazdır",
      academyShort: "Go Turkey & Study Academy",
    },
  };

  const LangToggle = ({ value, onChange }) => (
    <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: 8, padding: 3, gap: 2 }}>
      {["EN", "TR"].map(l => (
        <button key={l} onClick={() => onChange(l)} style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: value === l ? "#E03C31" : "transparent", color: value === l ? "white" : "#64748b" }}>
          {l}
        </button>
      ))}
    </div>
  );

  const certTemplates = [
    { id: 1, name: "GoTurkey", bg: "Standard Blue", status: "Active" },
    { id: 2, name: "GO TURKEY INGILIZCE", bg: "English Template", status: "Active" },
    { id: 3, name: "Sample Transfer Certificate", bg: "Transfer Layout", status: "Active" },
  ];

  const handleGenSearch = () => {
    setGenStudents(students.filter(s =>
      (!genCriteria.cls || (s.class || "").includes(genCriteria.cls)) &&
      (!genCriteria.section || s.section === genCriteria.section)
    ));
  };

  const CertPreviewModal = ({ student, onClose }) => {
    const qrValue = `https://goturkey.gen.tr/verify/${student.admNo}`;
    const ct = CERT_TEXT[certLang];
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
        <div style={{ background: "white", borderRadius: 16, padding: 32, maxWidth: 680, width: "90%", position: "relative" }} onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18, fontWeight: 700 }}>×</button>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <LangToggle value={certLang} onChange={setCertLang} />
          </div>
          {/* Certificate preview */}
          <div style={{ background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)", borderRadius: 12, padding: "40px 48px", color: "white", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: 20 }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 12px)", pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🇹🇷</div>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎓</div>
            </div>
            <div style={{ fontSize: 11, letterSpacing: 4, opacity: 0.7, marginBottom: 6 }}>{ct.academy}</div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 2, marginBottom: 4 }}>{ct.certificate}</div>
            <div style={{ fontSize: 16, opacity: 0.8, marginBottom: 24 }}>{ct.ofAppreciation}</div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "16px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>{ct.presentedTo}</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{student.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{ct.admissionNo}: {student.admNo}</div>
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.7, marginBottom: 24 }}>
              {ct.bodyLine1(student.class)}<br />
              {ct.bodyLine2}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 120, borderTop: "1px solid rgba(255,255,255,0.4)", paddingTop: 6, fontSize: 12, opacity: 0.7 }}>{ct.date}</div>
              </div>
              {/* QR Code placeholder */}
              <div style={{ background: "white", borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 72, height: 72, background: "#0f172a", borderRadius: 4, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, padding: 4 }}>
                  {Array.from({length: 49}).map((_, i) => (
                    <div key={i} style={{ background: [0,1,2,3,4,5,7,14,21,28,35,42,8,15,22,29,36,43,6,13,20,27,34,41,48,10,11,12,36,37,38,23,25].includes(i) ? "#0f172a" : "white", borderRadius: 1 }} />
                  ))}
                </div>
                <div style={{ color: "#0f172a", fontSize: 9, fontWeight: 700 }}>{ct.verify}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 120, borderTop: "1px solid rgba(255,255,255,0.4)", paddingTop: 6, fontSize: 12, opacity: 0.7 }}>{ct.signature}</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <div style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: "6px 14px", borderRadius: 6 }}>🔗 {ct.verifyPrefix}: goturkey.gen.tr/verify/{student.admNo}</div>
            <button style={{ background: "#E03C31", color: "white", border: "none", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>🖨️ {ct.print}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificate = () => (
    <>
      {certPreview && <CertPreviewModal student={certPreview} onClose={() => setCertPreview(null)} />}
      <HeaderControls title="Certificate Management" />
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "white", borderRadius: 12, padding: 4, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", width: "fit-content" }}>
        {[
          { id: "templates", label: "📋 Student Certificate" },
          { id: "generate", label: "🖨️ Generate Certificate" },
          { id: "idcard", label: "🪪 Student ID Card" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setCertTab(tab.id)} style={{ padding: "10px 20px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, background: certTab === tab.id ? "#E03C31" : "transparent", color: certTab === tab.id ? "white" : "#64748b", transition: "all 0.2s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TEMPLATES TAB */}
      {certTab === "templates" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
          {/* Add form */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#0f172a" }}>Add Student Certificate</h3>
            {[
              { label: "Certificate Name *", placeholder: "e.g. GoTurkey" },
              { label: "Header Left Text", placeholder: "" },
              { label: "Header Center Text", placeholder: "" },
              { label: "Header Right Text", placeholder: "" },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", fontSize: 13 }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Body Text *</label>
              <textarea rows={4} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", fontSize: 13, resize: "vertical" }} />
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, lineHeight: 1.6 }}>
                Tags: [name] [dob] [admission_no] [roll_no] [class] [section] [gender] [father_name] [category] [email] [phone]
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Footer Left Text</label>
                <input style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", fontSize: 13 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Footer Right Text</label>
                <input style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {["Header Height", "Footer Height", "Body Height", "Body Width"].map((l, i) => (
                <div key={i}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>{l}</label>
                  <input type="number" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", fontSize: 13 }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Student Photo</label>
              <div style={{ width: 40, height: 22, background: "#e2e8f0", borderRadius: 11, position: "relative", cursor: "pointer" }}>
                <div style={{ width: 18, height: 18, background: "white", borderRadius: "50%", position: "absolute", top: 2, left: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
            <div style={{ border: "2px dashed #e2e8f0", borderRadius: 8, padding: "20px", textAlign: "center", marginBottom: 16, color: "#94a3b8", fontSize: 13 }}>
              📁 Drag and drop background image or click
            </div>
            <button style={{ width: "100%", background: "#E03C31", color: "white", border: "none", padding: "11px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Save Certificate Template</button>
          </div>
          {/* List */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#0f172a" }}>Student Certificate List</h3>
            <input placeholder="Search..." style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, outline: "none", fontSize: 13, marginBottom: 16 }} />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Certificate Name</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Background</th>
                <th style={{ padding: "10px 8px", textAlign: "left" }}>Action</th>
              </tr></thead>
              <tbody>
                {certTemplates.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 600, color: "#3b82f6", cursor: "pointer" }}>{c.name}</td>
                    <td style={{ padding: "12px 8px" }}><div style={{ width: 44, height: 32, background: "linear-gradient(135deg,#1a237e,#0d47a1)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🖼️</div></td>
                    <td style={{ padding: "12px 8px" }}>
                      <button onClick={() => setCertPreview({ name: c.name, admNo: "GTK-PREVIEW", class: "Turkish A1" })} style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", marginRight: 6, fontSize: 13 }}>👁️ View</button>
                      <button style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", marginRight: 6, fontSize: 13 }}>✏️</button>
                      <button style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GENERATE TAB */}
      {certTab === "generate" && (
        <div>
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Select Criteria</h4>
            <div style={{ display: "flex", gap: 16 }}>
              <select value={genCriteria.cls} onChange={e => setGenCriteria(p => ({...p, cls: e.target.value}))} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none", fontSize: 13 }}>
                <option value="">Class *</option>
                <option>Turkish A1</option><option>Turkish B1</option><option>Turkish B2</option>
              </select>
              <select value={genCriteria.section} onChange={e => setGenCriteria(p => ({...p, section: e.target.value}))} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none", fontSize: 13 }}>
                <option value="">Section</option>
                <option>Morning</option><option>Evening</option>
              </select>
              <select value={genCriteria.cert} onChange={e => setGenCriteria(p => ({...p, cert: e.target.value}))} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none", fontSize: 13 }}>
                <option value="">Certificate *</option>
                {certTemplates.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
              <button onClick={handleGenSearch} style={{ background: "#0f172a", color: "white", border: "none", padding: "0 28px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>🔍 Search</button>
            </div>
          </div>
          {genStudents.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700 }}>Student List ({genStudents.length})</h4>
                <button style={{ background: "#E03C31", color: "white", border: "none", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>🖨️ Generate All</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "10px 8px", textAlign: "left" }}>Adm No</th>
                  <th style={{ padding: "10px 8px", textAlign: "left" }}>Student Name</th>
                  <th style={{ padding: "10px 8px", textAlign: "left" }}>Class</th>
                  <th style={{ padding: "10px 8px", textAlign: "left" }}>Section</th>
                  <th style={{ padding: "10px 8px", textAlign: "left" }}>QR / Action</th>
                </tr></thead>
                <tbody>
                  {genStudents.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 8px", fontWeight: 600 }}>{s.admNo}</td>
                      <td style={{ padding: "12px 8px", fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: "12px 8px" }}>{s.class}</td>
                      <td style={{ padding: "12px 8px" }}>{s.section}</td>
                      <td style={{ padding: "12px 8px", display: "flex", gap: 8 }}>
                        <button onClick={() => setCertPreview(s)} style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📄 Preview + QR</button>
                        <button style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "none", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>🖨️ Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {genStudents.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🖨️</div>
              <p style={{ fontSize: 15 }}>Select class and certificate template, then click Search</p>
            </div>
          )}
        </div>
      )}

      {/* ID CARD TAB */}
      {certTab === "idcard" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <LangToggle value={certLang} onChange={setCertLang} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {students.map(s => (
            <div key={s.id} style={{ background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)", borderRadius: 16, padding: 20, color: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.7 }}>{CERT_TEXT[certLang].studentId}</div>
                <div style={{ fontSize: 20 }}>🇹🇷</div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: "2px solid rgba(255,255,255,0.3)" }}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{s.class} · {s.section}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{s.admNo}</div>
                </div>
              </div>
              {/* Mini QR */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16 }}>
                <div style={{ fontSize: 10, opacity: 0.6 }}>{CERT_TEXT[certLang].academyShort}<br />2026 – 2027</div>
                <div style={{ background: "white", borderRadius: 4, padding: 4, width: 40, height: 40, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1 }}>
                  {Array.from({length:25}).map((_,i) => (
                    <div key={i} style={{ background: [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24].includes(i) ? "#0f172a" : "white", borderRadius: 0.5 }} />
                  ))}
                </div>
              </div>
              <button style={{ width: "100%", marginTop: 14, background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", padding: "7px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>🖨️ {CERT_TEXT[certLang].printIdCard}</button>
            </div>
          ))}
          {students.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🪪</div>
              <p style={{ fontSize: 15 }}>No students yet — add one from Student Information first.</p>
            </div>
          )}
          </div>
        </div>
      )}
    </>
  );

  const renderCMS = () => (
    <>
      <HeaderControls title={t.cms.title} btnText={t.cms.addBtn} />
      <DataTable
        columns={t.cms.cols}
        data={MOCK_DATA.events}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.title}</td><td>{r.venue}</td><td>{r.start}</td><td>{r.end}</td>
            <td><button style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>✏️</button></td>
          </>
        )}
      />
    </>
  );

  // -- STUDENT APPLICATIONS REVIEW (Super Admin only) --
  const setApplicationStage = async (appId, stage, extra = {}) => {
    await updateApplicationStage(appId, stage, extra);
    await refreshTenantData(user);
    setReviewModal(null);
  };

  const ReviewApplicationModal = ({ app, onClose }) => {
    const [offerForm, setOfferForm] = useState({ universityName: app?.universityName || "", programName: app?.programName || "", notes: "" });
    const [busy, setBusy] = useState(false);

    const run = async (fn) => {
      setBusy(true);
      await fn();
      setBusy(false);
    };

    const handleMakeOffer = (e) => {
      e.preventDefault();
      run(() => setApplicationStage(app.id, "offer_made", { offer: { ...offerForm, madeAt: new Date().toISOString() } }));
    };

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto", padding: "40px 16px" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 32, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
          <h3 style={{ marginBottom: 4, color: "#0f172a" }}>{app.studentName}</h3>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{app.studentEmail}</p>

          <p style={{ fontSize: 14, marginBottom: 6 }}><strong>{t.applications.universityLabel}:</strong> {app.universityName || "—"} {app.universityType ? `(${app.universityType})` : ""}</p>
          <p style={{ fontSize: 14, marginBottom: 6 }}><strong>{t.applications.programLabel}:</strong> {app.programName || "—"}</p>
          <p style={{ fontSize: 14, marginBottom: 16 }}><strong>{t.applications.stageLabel}:</strong> {t.applications.stages[app.stage] || app.stage}</p>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 13 }}>{t.applications.documentsLabel}</strong>
            <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.9 }}>
              {Object.entries(app.documents || {}).map(([key, f]) => (
                f ? <li key={key}>{key}: <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a></li> : null
              ))}
            </ul>
          </div>

          {app.paymentScreenshot && (
            <p style={{ fontSize: 13, marginBottom: 16 }}><strong>{t.applications.paymentScreenshotLabel}:</strong> <a href={app.paymentScreenshot.url} target="_blank" rel="noreferrer">{app.paymentScreenshot.name}</a></p>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            {app.stage === "payment_submitted" && (
              <button disabled={busy} onClick={() => run(() => setApplicationStage(app.id, "payment_verified"))} className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>{t.applications.verifyPaymentBtn}</button>
            )}
            {app.stage === "offer_made" && (
              <button disabled={busy} onClick={() => run(() => setApplicationStage(app.id, "accepted"))} className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>{t.applications.markAcceptedBtn}</button>
            )}
          </div>

          {["payment_verified", "under_review"].includes(app.stage) && (
            <form onSubmit={handleMakeOffer} style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <h4 style={{ fontSize: 14, marginBottom: 10, color: "#0f172a" }}>{t.applications.makeOfferTitle}</h4>
              <input required placeholder={t.applications.universityLabel} value={offerForm.universityName} onChange={e => setOfferForm({ ...offerForm, universityName: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 7 }} />
              <input required placeholder={t.applications.programLabel} value={offerForm.programName} onChange={e => setOfferForm({ ...offerForm, programName: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 7 }} />
              <textarea placeholder={t.applications.offerNotesLabel} value={offerForm.notes} onChange={e => setOfferForm({ ...offerForm, notes: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 7, minHeight: 70 }} />
              <button type="submit" disabled={busy} className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>{t.applications.submitOfferBtn}</button>
            </form>
          )}

          <button onClick={onClose} style={{ marginTop: 20, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>{t.common.close}</button>
        </div>
      </div>
    );
  };

  const renderApplications = () => (
    <>
      <HeaderControls title={t.applications.title} />
      {appRows.length === 0 ? (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", color: "#64748b" }}>
          {t.applications.noApplication}
        </div>
      ) : (
        <DataTable
          columns={t.applications.cols}
          data={appRows}
          renderRow={a => (
            <>
              <td style={{ padding: "12px 8px", fontWeight: 600 }}>{a.studentName}</td>
              <td>{a.studentEmail}</td>
              <td>{a.universityName || "—"}</td>
              <td>{a.programName || "—"}</td>
              <td>{t.applications.stages[a.stage] || a.stage}</td>
              <td>
                <button onClick={() => setReviewModal(a)} style={{ background: "rgba(26,35,126,0.08)", color: "#1a237e", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  {t.applications.reviewBtn}
                </button>
              </td>
            </>
          )}
        />
      )}
      {reviewModal && <ReviewApplicationModal app={reviewModal} onClose={() => setReviewModal(null)} />}
    </>
  );

  const renderFallback = (title) => (
    <div style={{ animation: "fadeIn 0.3s", height: 400, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#94a3b8" }}>
      <span style={{ fontSize: 64, marginBottom: 16 }}>⚙️</span>
      <h2 style={{ color: "#0f172a" }}>{title} {t.fallback.config}</h2>
      <p>{t.fallback.msg}</p>
    </div>
  );

  // -- AGENCIES / SUB-AGENCIES MANAGEMENT (Firebase Admin SDK-backed) --
  const callApi = async (path, body) => {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(error || "Request failed.");
    }
    return res.json();
  };

  const toggleAgencyStatus = async (agency) => {
    await callApi(`/api/agencies/${agency.id}/status`, { disabled: agency.status !== "disabled" });
    refreshTenantData(user);
  };

  const toggleSubAgencyStatus = async (sub) => {
    await callApi(`/api/subagencies/${sub.id}/status`, { disabled: sub.status !== "disabled" });
    refreshTenantData(user);
  };

  const StatusPill = ({ status }) => (
    <span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: status === "disabled" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: status === "disabled" ? "#ef4444" : "#10b981" }}>
      {status === "disabled" ? t.agencies.disabled : t.agencies.active}
    </span>
  );

  const renderAgencies = () => (
    <>
      <HeaderControls title={t.agencies.title} btnText={t.agencies.addBtn} onBtnClick={() => setCreateModal("agency")} />
      <DataTable
        columns={t.agencies.cols}
        data={agencies}
        renderRow={a => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{a.name}</td><td>{a.email}</td>
            <td><StatusPill status={a.status} /></td>
            <td>
              <button onClick={() => toggleAgencyStatus(a)} style={{ background: a.status === "disabled" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: a.status === "disabled" ? "#10b981" : "#ef4444", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                {a.status === "disabled" ? t.agencies.enable : t.agencies.disable}
              </button>
            </td>
          </>
        )}
      />
      {createModal === "agency" && <CreateAccountModal kind="agency" onClose={() => setCreateModal(null)} />}
    </>
  );

  const renderSubAgencies = () => (
    <>
      <HeaderControls title={t.subagencies.title} btnText={t.subagencies.addBtn} onBtnClick={() => setCreateModal("subagency")} />
      <DataTable
        columns={t.subagencies.cols}
        data={subAgencies}
        renderRow={s => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{s.name}</td><td>{s.email}</td>
            <td><StatusPill status={s.status} /></td>
            <td>
              <button onClick={() => toggleSubAgencyStatus(s)} style={{ background: s.status === "disabled" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: s.status === "disabled" ? "#10b981" : "#ef4444", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                {s.status === "disabled" ? t.agencies.enable : t.agencies.disable}
              </button>
            </td>
          </>
        )}
      />
      {createModal === "subagency" && <CreateAccountModal kind="subagency" onClose={() => setCreateModal(null)} />}
    </>
  );

  const CreateAccountModal = ({ kind, onClose }) => {
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "", city: "" });
    const [result, setResult] = useState(null); // { email, password } once created — shown back for manual sending until SMTP exists
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const labels = kind === "agency" ? t.agencies : t.subagencies;
    const apiPath = kind === "agency" ? "/api/agencies" : "/api/subagencies";

    const handleCreate = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        const idToken = await auth.currentUser.getIdToken();
        const res = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account.");
        setResult({ email: data.email, password: data.password });
        refreshTenantData(user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const field = (key, label, opts = {}) => (
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>
        <input
          required={opts.required}
          type={opts.type || "text"}
          minLength={opts.minLength}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 7, outline: "none" }}
        />
      </div>
    );

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto", padding: "40px 16px" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 32, maxWidth: 440, width: "90%", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18, fontWeight: 700 }}>×</button>

          {!result ? (
            <form onSubmit={handleCreate}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#0f172a" }}>{labels.addBtn}</h3>
              {error && <div style={{ background: "rgba(224,60,49,0.08)", border: "1px solid rgba(224,60,49,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#E03C31", fontSize: 13 }}>⚠️ {error}</div>}
              {field("name", labels.name, { required: true })}
              {field("email", labels.email, { required: true, type: "email" })}
              {field("password", labels.password, { required: true, type: "text", minLength: 6 })}
              {field("phone", labels.phone)}
              {field("address", labels.address)}
              {field("city", labels.city)}
              <button type="submit" disabled={loading} style={{ width: "100%", background: "#E03C31", color: "white", border: "none", padding: "12px", borderRadius: 8, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: 6 }}>
                {loading ? "..." : labels.submit}
              </button>
            </form>
          ) : (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>{labels.passwordRevealTitle}</h3>
              <div style={{ background: "rgba(224,60,49,0.08)", border: "1px solid rgba(224,60,49,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#E03C31", fontSize: 13, fontWeight: 600 }}>
                ⚠️ {labels.passwordRevealWarning}
              </div>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 16, fontFamily: "monospace", fontSize: 14 }}>
                <div style={{ marginBottom: 8 }}><strong>{labels.email}:</strong> {result.email}</div>
                <div><strong>{labels.password}:</strong> {result.password}</div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`${result.email} / ${result.password}`)}
                style={{ width: "100%", marginBottom: 10, background: "#0f172a", color: "white", border: "none", padding: "11px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
              >
                {labels.copyBtn}
              </button>
              <button onClick={onClose} style={{ width: "100%", background: "none", border: "1px solid #e2e8f0", padding: "11px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                {labels.close}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // -- REPORTS (role-branched, backed by the real data already loaded above) --
  const StatTile = ({ val, label, color }) => (
    <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 6 }}>{val}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>{label}</div>
    </div>
  );

  const BreakdownBar = ({ items }) => {
    const max = Math.max(1, ...items.map(i => i.count));
    return (
      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9" }}>
        {items.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>{t.reports.noData}</div>}
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{item.label}</span>
              <span style={{ color: "#64748b" }}>{item.count}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#f1f5f9" }}>
              <div style={{ height: 8, borderRadius: 4, width: `${(item.count / max) * 100}%`, background: "linear-gradient(90deg, #E03C31, #1a237e)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReports = () => {
    if (role === "super_admin") {
      const active = agencies.filter(a => a.status !== "disabled").length;
      const breakdown = agencies.map(a => ({ label: a.name, count: students.filter(s => s.agencyId === a.id).length }));
      return (
        <div style={{ animation: "fadeIn 0.3s" }}>
          <HeaderControls title={t.reports.title} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 24 }}>
            <StatTile val={agencies.length} label={t.reports.totalAgencies} color="#1a237e" />
            <StatTile val={active} label={t.reports.activeAgencies} color="#10b981" />
            <StatTile val={agencies.length - active} label={t.reports.disabledAgencies} color="#ef4444" />
            <StatTile val={subAgencies.length} label={t.reports.totalSubAgencies} color="#f59e0b" />
          </div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>{t.reports.perAgencyBreakdown}</h4>
          <BreakdownBar items={breakdown} />
        </div>
      );
    }
    if (role === "agency") {
      const active = subAgencies.filter(s => s.status !== "disabled").length;
      const breakdown = subAgencies.map(s => ({ label: s.name, count: students.filter(st => st.ownerId === s.id).length }));
      return (
        <div style={{ animation: "fadeIn 0.3s" }}>
          <HeaderControls title={t.reports.title} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
            <StatTile val={subAgencies.length} label={t.reports.mySubAgencies} color="#1a237e" />
            <StatTile val={active} label={t.reports.activeAgencies} color="#10b981" />
            <StatTile val={students.length} label={t.reports.myStudents} color="#f59e0b" />
          </div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>{t.reports.perSubAgencyBreakdown}</h4>
          <BreakdownBar items={breakdown} />
        </div>
      );
    }
    return (
      <div style={{ animation: "fadeIn 0.3s" }}>
        <HeaderControls title={t.reports.title} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          <StatTile val={students.length} label={t.reports.myStudents} color="#1a237e" />
          <StatTile val={user.name} label={t.reports.myStatus} color="#10b981" />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      `}} />
      <div style={{ width: sidebarOpen ? 280 : 80, background: "#0f172a", color: "#94a3b8", display: "flex", flexDirection: "column", transition: "width 0.3s", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden", boxShadow: "4px 0 24px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(255,255,255,0.05)", direction: "ltr" }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>🇹🇷</div>
          {sidebarOpen && <div style={{ color: "white", fontWeight: 800, fontSize: 18, whiteSpace:"nowrap" }}><span style={{ color: "#E03C31" }}>Go</span>Turkey <span style={{ fontWeight: 400 }}>Admin</span></div>}
        </div>

        {sidebarOpen && (
          <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)", direction: lang === "AR" ? "rtl" : "ltr" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #E03C31 0%, #b91c1c 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "white", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              👤
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user.name}</div>
              <div style={{ color: "#10b981", fontSize: 12, fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ animation: "pulse 2s infinite" }}>●</span> {t.top.online}
              </div>
            </div>
          </div>
        )}

        <ul style={{ listStyle: "none", padding: "10px 12px", margin: 0, flex: 1, overflowY: "auto", fontSize: 14, direction: lang === "AR" ? "rtl" : "ltr" }}>
          {sidebarOpen && <li style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>{t.sidebar.mainMenu}</li>}
          {SIDEBAR_MENUS.map((menu) => {
            const isActive = activeTab === menu.id;
            return (
              <li key={menu.id} style={{ marginBottom: 4 }}>
                <button
                  onClick={() => setActiveTab(menu.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", padding: "12px 14px", border: "none", outline: "none", cursor: "pointer", color: isActive ? "white" : "inherit", background: isActive ? "linear-gradient(90deg, #E03C31 0%, #b91c1c 100%)" : "transparent", borderRadius: 12, whiteSpace: "nowrap", transition: "all 0.2s", textAlign: lang === "AR" ? "right" : "left" }}
                  onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; } }}
                  onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "inherit"; } }}
                >
                  <span style={{ width: 24, fontSize: 18, textAlign: "center", marginRight: lang === "AR" ? 0 : (sidebarOpen ? 12 : 0), marginLeft: lang === "AR" ? (sidebarOpen ? 12 : 0) : 0 }}>{menu.icon}</span>
                  {sidebarOpen && <span style={{ fontWeight: isActive ? 600 : 500 }}>{menu.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", direction: lang === "AR" ? "rtl" : "ltr" }}>
        <header style={{ height: 72, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #e2e8f0", direction: "ltr" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>☰</button>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>{t.top.title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", background: "white", borderRadius: 10, padding: "4px 8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 16, marginRight: 6 }}>🌍</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{ background: "transparent", color: "#0f172a", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none" }}
              >
                <option value="EN">English</option>
                <option value="TR">Türkçe</option>
                <option value="AR">العربية</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                👤
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.top.welcome}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: -2 }}>{user.name}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              style={{ background: "rgba(224, 60, 49, 0.1)", color: "#E03C31", border: "1px solid rgba(224, 60, 49, 0.2)", padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E03C31"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(224, 60, 49, 0.1)"; e.currentTarget.style.color = "#E03C31"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              {t.top.logout}
            </button>
          </div>
        </header>

        <div style={{ padding: 32, flex: 1, overflowY: "auto" }}>
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "agencies" && role === "super_admin" && renderAgencies()}
          {activeTab === "subagencies" && role === "agency" && renderSubAgencies()}
          {activeTab === "front_office" && renderFrontOffice()}
          {activeTab === "student_info" && renderStudentInfo()}
          {activeTab === "fees" && renderFees()}
          {activeTab === "exams" && renderExams()}
          {activeTab === "online_exams" && renderOnlineExams()}
          {activeTab === "lesson_plan" && renderLessonPlan()}
          {activeTab === "academics" && renderAcademics()}
          {activeTab === "hr" && renderHR()}
          {activeTab === "online_course" && renderOnlineCourse()}
          {activeTab === "zoom" && renderZoom()}
          {activeTab === "download" && renderDownload()}
          {activeTab === "certificate" && renderCertificate()}
          {activeTab === "cms" && renderCMS()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "applications" && role === "super_admin" && renderApplications()}
          {["alumni", "settings"].includes(activeTab) && renderFallback(t.sidebar[activeTab])}
        </div>
      </div>
    </div>
  );
}
