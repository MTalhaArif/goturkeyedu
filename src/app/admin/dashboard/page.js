"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SIDEBAR_MENUS = [
  { id: "dashboard", icon: "📊", label: "Dashboard Home" },
  { id: "front_office", icon: "🏢", label: "Front Office" },
  { id: "student_info", icon: "👥", label: "Student Information" },
  { id: "fees", icon: "💰", label: "Fees Collection" },
  { id: "exams", icon: "📝", label: "Examinations" },
  { id: "online_exams", icon: "💻", label: "Online Examinations" },
  { id: "lesson_plan", icon: "📅", label: "Lesson Plan" },
  { id: "academics", icon: "🎓", label: "Academics" },
  { id: "hr", icon: "🤝", label: "Human Resource" },
  { id: "online_course", icon: "▶️", label: "Online Course" },
  { id: "zoom", icon: "📹", label: "Zoom Live Classes" },
  { id: "download", icon: "⬇️", label: "Download Center" },
  { id: "certificate", icon: "📜", label: "Certificate" },
  { id: "cms", icon: "🖥️", label: "Front CMS" },
  { id: "alumni", icon: "🎓", label: "Alumni" },
  { id: "reports", icon: "📊", label: "Reports" },
  { id: "settings", icon: "⚙️", label: "System Settings" }
];

const MOCK_DATA = {
  students: [
    { id: "1001", name: "Ahmet Yılmaz", class: "Turkish A1", father: "Mehmet", dob: "15/04/2005", gender: "Male", category: "General", mobile: "+90 555 123 4567", paid: "Yes" },
    { id: "1002", name: "Aisha Khan", class: "Turkish A1", father: "Tariq", dob: "22/08/2004", gender: "Female", category: "International", mobile: "+90 555 987 6543", paid: "No" },
  ],
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
  certificates: [
    { name: "Course Completion Certificate", bg: "Standard Template", status: "Active" }
  ],
  events: [
    { title: "Orientation Day", venue: "Main Hall", start: "10/07/2026", end: "10/07/2026" }
  ]
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local States
  const [studentView, setStudentView] = useState("list");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("goturkey_user");
    if (!stored) { router.push("/admin/login"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "admin") { router.push("/admin/login"); return; }
    setUser(u);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("goturkey_user");
    router.push("/admin/login");
  };

  if (!user) return <div style={{ minHeight: "100vh", background: "#f8fafc" }}></div>;

  // -- COMPONENT FACTORIES FOR EACH MODULE --

  const HeaderControls = ({ title, btnText }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, animation: "fadeIn 0.3s" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h2>
      {btnText && (
        <button style={{ background: "#E03C31", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(224,60,49,0.3)" }}>
          {btnText}
        </button>
      )}
    </div>
  );

  const CriteriaFilter = ({ fields }) => (
    <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", marginBottom: 24, animation: "fadeIn 0.3s" }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Select Criteria</h4>
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
        <button style={{ background: "#0f172a", color: "white", border: "none", padding: "0 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Search</button>
      </div>
    </div>
  );

  const DataTable = ({ columns, data, renderRow }) => (
    <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", overflow: "hidden", padding: 24, animation: "fadeIn 0.3s" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", textAlign: "left" }}>
            {columns.map((c, i) => <th key={i} style={{ padding: "12px 8px" }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
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
          { title: "Fees Awaiting Payment", val: "0/0", icon: "💰", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
          { title: "Converted Leads", val: "0/0", icon: "📈", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
          { title: "Staff Present Today", val: "0/14", icon: "👥", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }
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
          { val: "0 UNPAID", label: "Fees Overview", color: "#ef4444" },
          { val: "0 ACTIVE", label: "Enquiry Overview", color: "#10b981" },
          { val: "₺0", label: "Monthly Fees Collection", color: "#3b82f6" },
          { val: "78", label: "Total Students", color: "#f59e0b" }
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
      <HeaderControls title="Admission Enquiry" btnText="+ Add Enquiry" />
      <CriteriaFilter fields={[ { type: "select", placeholder: "Source" }, { type: "date" }, { type: "date" }, { type: "select", placeholder: "Status" } ]} />
      <DataTable 
        columns={["Name", "Phone", "Source", "Enquiry Date", "Next Follow Up", "Status", "Action"]} 
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
      <HeaderControls title="Search Due Fees" />
      <CriteriaFilter fields={[ { type: "select", placeholder: "Fees Group" }, { type: "select", placeholder: "Class" }, { type: "select", placeholder: "Section" } ]} />
      <DataTable 
        columns={["Student Name", "Fee Type", "Due Date", "Amount", "Balance", "Status", "Action"]} 
        data={MOCK_DATA.fees}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.name}</td><td>{r.feeType}</td><td>{r.dueDate}</td><td>{r.amount}</td><td style={{color:"#ef4444", fontWeight:600}}>{r.balance}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: r.status === "Paid" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: r.status === "Paid" ? "#10b981" : "#ef4444" }}>{r.status}</span></td>
            <td><button style={{ background: "#E03C31", color: "white", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontWeight:600, fontSize:12 }}>Collect</button></td>
          </>
        )}
      />
    </>
  );

  const renderExams = () => (
    <>
      <HeaderControls title="Exam Schedule" btnText="+ Add Exam" />
      <DataTable 
        columns={["Exam Name", "Group", "Subjects", "Date", "Status", "Action"]} 
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
      <HeaderControls title="Online Examinations" btnText="+ Add Online Exam" />
      <DataTable 
        columns={["Exam Title", "Class", "Questions", "Duration", "Status", "Action"]} 
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
      <HeaderControls title="Manage Lesson Plan" btnText="+ Create Plan" />
      <CriteriaFilter fields={[ { type: "select", placeholder: "Teacher" }, { type: "select", placeholder: "Class" }, { type: "select", placeholder: "Subject" } ]} />
      <DataTable 
        columns={["Day", "Subject", "Topic", "Teacher", "Time", "Action"]} 
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
      <HeaderControls title="Class Timetable & Assign" />
      <DataTable 
        columns={["Class", "Section", "Subjects", "Class Teacher", "Students", "Action"]} 
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
      <HeaderControls title="Staff Directory" btnText="+ Add Staff" />
      <CriteriaFilter fields={[ { type: "select", placeholder: "Role" }, { type: "text", placeholder: "Search By Keyword" } ]} />
      <DataTable 
        columns={["Staff ID", "Name", "Role", "Department", "Phone", "Status", "Action"]} 
        data={MOCK_DATA.hr}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.id}</td><td style={{fontWeight:600}}>{r.name}</td><td>{r.role}</td><td>{r.dept}</td><td>{r.phone}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{r.status}</span></td>
            <td><button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>Profile</button></td>
          </>
        )}
      />
    </>
  );

  const renderOnlineCourse = () => (
    <>
      <HeaderControls title="Course List" btnText="+ Add Course" />
      <DataTable 
        columns={["Course Title", "Teacher", "Price", "Students Enrolled", "Status", "Action"]} 
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
      <HeaderControls title="Zoom Live Classes" btnText="+ Add Live Class" />
      <DataTable 
        columns={["Class Title", "Date", "Time", "Duration", "Created By", "Status", "Action"]} 
        data={MOCK_DATA.zoom}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.title}</td><td>{r.date}</td><td>{r.time}</td><td>{r.duration}</td><td>{r.staff}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{r.status}</span></td>
            <td><button style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontWeight:600, fontSize:12 }}>Start Meeting</button></td>
          </>
        )}
      />
    </>
  );

  const renderDownload = () => (
    <>
      <HeaderControls title="Upload Content" btnText="+ Upload" />
      <DataTable 
        columns={["Content Title", "Type", "Date", "Size", "Action"]} 
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

  const renderCertificate = () => (
    <>
      <HeaderControls title="Student Certificate" btnText="+ Generate Certificate" />
      <DataTable 
        columns={["Certificate Name", "Background Image", "Status", "Action"]} 
        data={MOCK_DATA.certificates}
        renderRow={r => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600 }}>{r.name}</td><td>{r.bg}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{r.status}</span></td>
            <td><button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>Preview</button></td>
          </>
        )}
      />
    </>
  );

  const renderCMS = () => (
    <>
      <HeaderControls title="Event List" btnText="+ Add Event" />
      <DataTable 
        columns={["Event Title", "Venue", "Start Date", "End Date", "Action"]} 
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

  const renderStudentInfo = () => (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <HeaderControls title="Student Details" />
      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Select Criteria</h4>
            <div style={{ display: "flex", gap: 12 }}>
              <select style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}><option>Class</option></select>
              <select style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}><option>Section</option></select>
              <button style={{ background: "#0f172a", color: "white", border: "none", padding: "0 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Search</button>
            </div>
          </div>
          <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 32 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Search By Keyword</h4>
            <div style={{ display: "flex", gap: 12 }}>
              <input type="text" placeholder="Search By Student Name..." style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
              <button style={{ background: "#0f172a", color: "white", border: "none", padding: "0 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Search</button>
            </div>
          </div>
        </div>
      </div>
      <DataTable 
        columns={["Admission No", "Student Name", "Class", "DOB", "Gender", "Mobile", "Paid", "Action"]} 
        data={MOCK_DATA.students}
        renderRow={s => (
          <>
            <td style={{ padding: "12px 8px", fontWeight: 600, color: "#0f172a" }}>{s.id}</td><td>{s.name}</td><td>{s.class}</td><td>{s.dob}</td><td>{s.gender}</td><td>{s.mobile}</td>
            <td><span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: s.paid === "Yes" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: s.paid === "Yes" ? "#10b981" : "#ef4444" }}>{s.paid}</span></td>
            <td><button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, marginRight: 8, cursor: "pointer" }}>👁️</button></td>
          </>
        )}
      />
    </div>
  );

  // Fallback for settings/reports
  const renderFallback = (title) => (
    <div style={{ animation: "fadeIn 0.3s", height: 400, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#94a3b8" }}>
      <span style={{ fontSize: 64, marginBottom: 16 }}>⚙️</span>
      <h2 style={{ color: "#0f172a" }}>{title} configuration</h2>
      <p>This administrative module is active and awaiting backend parameters.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      `}} />
      <div style={{ width: sidebarOpen ? 280 : 80, background: "#0f172a", color: "#94a3b8", display: "flex", flexDirection: "column", transition: "width 0.3s", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden", boxShadow: "4px 0 24px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>🇹🇷</div>
          {sidebarOpen && <div style={{ color: "white", fontWeight: 800, fontSize: 18, whiteSpace:"nowrap" }}><span style={{ color: "#E03C31" }}>Go</span>Turkey <span style={{ fontWeight: 400 }}>Admin</span></div>}
        </div>

        {/* User Panel */}
        {sidebarOpen && (
          <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #E03C31 0%, #b91c1c 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "white", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              👤
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user.name}</div>
              <div style={{ color: "#10b981", fontSize: 12, fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ animation: "pulse 2s infinite" }}>●</span> Online
              </div>
            </div>
          </div>
        )}
        <ul style={{ listStyle: "none", padding: "10px 12px", margin: 0, flex: 1, overflowY: "auto", fontSize: 14 }}>
          {sidebarOpen && <li style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Main Menu</li>}
          {SIDEBAR_MENUS.map((menu) => {
            const isActive = activeTab === menu.id;
            return (
              <li key={menu.id} style={{ marginBottom: 4 }}>
                <button 
                  onClick={() => setActiveTab(menu.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", padding: "12px 14px", border: "none", outline: "none", cursor: "pointer", color: isActive ? "white" : "inherit", background: isActive ? "linear-gradient(90deg, #E03C31 0%, #b91c1c 100%)" : "transparent", borderRadius: 12, whiteSpace: "nowrap", transition: "all 0.2s", textAlign: "left" }}
                  onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; } }}
                  onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "inherit"; } }}
                >
                  <span style={{ width: 24, fontSize: 18, textAlign: "center", marginRight: sidebarOpen ? 12 : 0 }}>{menu.icon}</span>
                  {sidebarOpen && <span style={{ fontWeight: isActive ? 600 : 500 }}>{menu.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 72, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>☰</button>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Go Turkey And Study Academy</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                👤
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Welcome,</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: -2 }}>Super Admin</span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout} 
              title="Logout"
              style={{ 
                background: "rgba(224, 60, 49, 0.1)", 
                color: "#E03C31", 
                border: "1px solid rgba(224, 60, 49, 0.2)", 
                padding: "10px 20px", 
                borderRadius: 12, 
                fontSize: 14, 
                fontWeight: 800, 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                gap: 10,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E03C31"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(224, 60, 49, 0.1)"; e.currentTarget.style.color = "#E03C31"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              LOGOUT
            </button>
          </div>
        </header>

        <div style={{ padding: 32, flex: 1, overflowY: "auto" }}>
          {activeTab === "dashboard" && renderDashboard()}
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
          {["alumni", "reports", "settings"].includes(activeTab) && renderFallback(activeTab.toUpperCase())}
        </div>
      </div>
    </div>
  );
}
