"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SIDEBAR_MENUS = [
  { id: "dashboard", icon: "📊", label: "Dashboard Home" },
  { id: "front_office", icon: "🏢", label: "Front Office" },
  { id: "student_info", icon: "👥", label: "Student Information" },
  { id: "fees", icon: "💰", label: "Fees Collection" },
  { id: "exams", icon: "📝", label: "Examinations" },
  { id: "hr", icon: "🤝", label: "Human Resource" },
  { id: "settings", icon: "⚙️", label: "System Settings" }
];

const MOCK_STUDENTS = [
  { id: "1001", name: "Ahmet Yılmaz", class: "Turkish A1", father: "Mehmet", dob: "15/04/2005", gender: "Male", category: "General", mobile: "+90 555 123 4567", paid: "Yes" },
  { id: "1002", name: "Aisha Khan", class: "Turkish A1", father: "Tariq", dob: "22/08/2004", gender: "Female", category: "International", mobile: "+90 555 987 6543", paid: "No" },
  { id: "1003", name: "Omar Farooq", class: "Turkish B2", father: "Zayed", dob: "11/01/2003", gender: "Male", category: "International", mobile: "+90 555 456 7890", paid: "Yes" }
];

const MOCK_ENQUIRIES = [
  { name: "John Doe", phone: "+44 7700 900077", source: "Website", date: "01/07/2026", lastFollowUp: "01/07/2026", nextFollowUp: "05/07/2026", status: "Active" },
  { name: "Sarah Smith", phone: "+1 202 555 0173", source: "Social Media", date: "28/06/2026", lastFollowUp: "30/06/2026", nextFollowUp: "10/07/2026", status: "Passive" }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Student Info State
  const [studentView, setStudentView] = useState("list"); // 'list' or 'details'
  const [studentSearch, setStudentSearch] = useState("");

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

  const renderDashboardHome = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
        {[
          { title: "Fees Awaiting Payment", val: "0/0", icon: "💰", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
          { title: "Converted Leads", val: "0/0", icon: "📈", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
          { title: "Staff Present Today", val: "0/14", icon: "👥", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }
        ].map((stat, i) => (
          <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{stat.title}</div>
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
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{w.label}</div>
          </div>
        ))}
      </div>
    </>
  );

  const renderStudentInfo = () => {
    const filtered = MOCK_STUDENTS.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.id.includes(studentSearch));
    
    return (
      <div style={{ animation: "fadeIn 0.3s" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 24 }}>Student Details</h2>
        
        {/* Search Criteria Card */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Select Criteria</h4>
              <div style={{ display: "flex", gap: 12 }}>
                <select style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}>
                  <option>Select Class *</option>
                  <option>Turkish Language Course A1</option>
                  <option>Turkish Language Course B2</option>
                </select>
                <select style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}>
                  <option>Select Section</option>
                  <option>Morning</option>
                  <option>Evening</option>
                </select>
                <button style={{ background: "#0f172a", color: "white", border: "none", padding: "0 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Search</button>
              </div>
            </div>
            
            <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 32 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Search By Keyword</h4>
              <div style={{ display: "flex", gap: 12 }}>
                <input 
                  type="text" 
                  placeholder="Search By Student Name, Roll Number..." 
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}
                />
                <button style={{ background: "#0f172a", color: "white", border: "none", padding: "0 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Search</button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
          
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 24px" }}>
            <button 
              onClick={() => setStudentView("list")}
              style={{ background: "none", border: "none", borderBottom: studentView === "list" ? "2px solid #E03C31" : "2px solid transparent", padding: "16px 20px", color: studentView === "list" ? "#E03C31" : "#64748b", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <span>📋</span> List View
            </button>
            <button 
              onClick={() => setStudentView("details")}
              style={{ background: "none", border: "none", borderBottom: studentView === "details" ? "2px solid #E03C31" : "2px solid transparent", padding: "16px 20px", color: studentView === "details" ? "#E03C31" : "#64748b", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <span>🖼️</span> Details View
            </button>
          </div>

          <div style={{ padding: 24 }}>
            {studentView === "list" ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", textAlign: "left" }}>
                    <th style={{ padding: "12px 8px" }}>Admission No</th>
                    <th style={{ padding: "12px 8px" }}>Student Name</th>
                    <th style={{ padding: "12px 8px" }}>Class</th>
                    <th style={{ padding: "12px 8px" }}>Father Name</th>
                    <th style={{ padding: "12px 8px" }}>DOB</th>
                    <th style={{ padding: "12px 8px" }}>Gender</th>
                    <th style={{ padding: "12px 8px" }}>Mobile</th>
                    <th style={{ padding: "12px 8px" }}>Paid</th>
                    <th style={{ padding: "12px 8px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 8px", fontWeight: 600, color: "#0f172a" }}>{s.id}</td>
                      <td style={{ padding: "12px 8px" }}>{s.name}</td>
                      <td style={{ padding: "12px 8px" }}>{s.class}</td>
                      <td style={{ padding: "12px 8px" }}>{s.father}</td>
                      <td style={{ padding: "12px 8px" }}>{s.dob}</td>
                      <td style={{ padding: "12px 8px" }}>{s.gender}</td>
                      <td style={{ padding: "12px 8px" }}>{s.mobile}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: s.paid === "Yes" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: s.paid === "Yes" ? "#10b981" : "#ef4444" }}>{s.paid}</span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, marginRight: 8, cursor: "pointer" }}>👁️</button>
                        <button style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {filtered.map(s => (
                  <div key={s.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, textAlign: "center" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f1f5f9", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👤</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>{s.name}</h3>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0" }}>{s.class}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#475569", marginBottom: 16, textAlign: "left", background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                      <div><b>Adm No:</b> {s.id}</div>
                      <div><b>Gender:</b> {s.gender}</div>
                      <div><b>DOB:</b> {s.dob}</div>
                      <div><b>Paid:</b> {s.paid}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Profile</button>
                      <button style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Fee (₺)</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFrontOffice = () => (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Admission Enquiry</h2>
        <button style={{ background: "#E03C31", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(224,60,49,0.3)" }}>
          + Add Enquiry
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Select Criteria</h4>
        <div style={{ display: "flex", gap: 16 }}>
          <select style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}>
            <option>Source</option>
            <option>Website</option>
            <option>Social Media</option>
          </select>
          <input type="date" placeholder="Enquiry From Date" style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
          <input type="date" placeholder="Enquiry To Date" style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }} />
          <select style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}>
            <option>Status</option>
            <option>Active</option>
            <option>Passive</option>
            <option>Dead</option>
          </select>
          <button style={{ background: "#0f172a", color: "white", border: "none", padding: "0 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Search</button>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", overflow: "hidden", padding: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", textAlign: "left" }}>
              <th style={{ padding: "12px 8px" }}>Name</th>
              <th style={{ padding: "12px 8px" }}>Phone</th>
              <th style={{ padding: "12px 8px" }}>Source</th>
              <th style={{ padding: "12px 8px" }}>Enquiry Date</th>
              <th style={{ padding: "12px 8px" }}>Last Follow Up</th>
              <th style={{ padding: "12px 8px" }}>Next Follow Up</th>
              <th style={{ padding: "12px 8px" }}>Status</th>
              <th style={{ padding: "12px 8px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ENQUIRIES.map((e, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 8px", fontWeight: 600, color: "#0f172a" }}>{e.name}</td>
                <td style={{ padding: "12px 8px" }}>{e.phone}</td>
                <td style={{ padding: "12px 8px" }}>{e.source}</td>
                <td style={{ padding: "12px 8px" }}>{e.date}</td>
                <td style={{ padding: "12px 8px" }}>{e.lastFollowUp}</td>
                <td style={{ padding: "12px 8px" }}>{e.nextFollowUp}</td>
                <td style={{ padding: "12px 8px" }}>
                  <span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: e.status === "Active" ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)", color: e.status === "Active" ? "#10b981" : "#64748b" }}>{e.status}</span>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <button style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
      {/* SIDEBAR */}
      <div style={{
        width: sidebarOpen ? 280 : 80,
        background: "#0f172a",
        color: "#94a3b8",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        boxShadow: "4px 0 24px rgba(0,0,0,0.1)"
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>🇹🇷</div>
          {sidebarOpen && (
            <div style={{ whiteSpace: "nowrap" }}>
              <div style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
                <span style={{ color: "#E03C31" }}>Go</span>Turkey <span style={{ fontWeight: 400 }}>Admin</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Search */}
        {sidebarOpen && (
          <div style={{ padding: "20px" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, display: "flex", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ opacity: 0.5, marginRight: 8 }}>🔍</span>
              <input type="text" placeholder="Search..." style={{ background: "transparent", border: "none", color: "white", width: "100%", outline: "none", fontSize: 13 }} />
            </div>
          </div>
        )}

        {/* Menu Items */}
        <ul style={{ listStyle: "none", padding: "10px 12px", margin: 0, flex: 1, overflowY: "auto", fontSize: 14 }}>
          {sidebarOpen && <li style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Main Menu</li>}
          
          {SIDEBAR_MENUS.map((menu) => {
            const isActive = activeTab === menu.id;
            return (
              <li key={menu.id} style={{ marginBottom: 4 }}>
                <button 
                  onClick={() => setActiveTab(menu.id)}
                  style={{ 
                    width: "100%",
                    display: "flex", 
                    alignItems: "center", 
                    padding: "12px 14px", 
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    color: isActive ? "white" : "inherit",
                    background: isActive ? "linear-gradient(90deg, #E03C31 0%, #b91c1c 100%)" : "transparent",
                    borderRadius: 12,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                    boxShadow: isActive ? "0 4px 12px rgba(224, 60, 49, 0.3)" : "none",
                    textAlign: "left"
                  }}
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

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* TOP BAR */}
        <header style={{ 
          height: 72, 
          background: "rgba(255, 255, 255, 0.8)", 
          backdropFilter: "blur(12px)",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky", 
          top: 0, 
          zIndex: 100,
          borderBottom: "1px solid #e2e8f0"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16, color: "#1e293b", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              ☰
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Go Turkey And Study Academy</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{user.name}</span>
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>● Online</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                background: "rgba(224, 60, 49, 0.1)",
                color: "#E03C31",
                border: "1px solid rgba(224, 60, 49, 0.2)",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E03C31"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(224, 60, 49, 0.1)"; e.currentTarget.style.color = "#E03C31"; }}
            >
              <span>🚪</span> LOGOUT
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ padding: 32, flex: 1, overflowY: "auto" }}>
          {activeTab === "dashboard" && renderDashboardHome()}
          {activeTab === "student_info" && renderStudentInfo()}
          {activeTab === "front_office" && renderFrontOffice()}
          {/* Fallback for empty tabs */}
          {["fees", "exams", "hr", "settings"].includes(activeTab) && (
            <div style={{ animation: "fadeIn 0.3s", height: 400, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#94a3b8" }}>
              <span style={{ fontSize: 64, marginBottom: 16 }}>🚧</span>
              <h2 style={{ color: "#0f172a" }}>Under Construction</h2>
              <p>This module is currently being connected to the database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
