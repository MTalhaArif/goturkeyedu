"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SIDEBAR_MENUS = [
  { icon: "🏢", label: "Front Office" },
  { icon: "👥", label: "Student Information" },
  { icon: "💰", label: "Fees Collection" },
  { icon: "📝", label: "Examinations" },
  { icon: "💻", label: "Online Examinations" },
  { icon: "📅", label: "Lesson Plan" },
  { icon: "🎓", label: "Academics" },
  { icon: "🤝", label: "Human Resource" },
  { icon: "▶️", label: "Online Course" },
  { icon: "📹", label: "Zoom Live Classes" },
  { icon: "⬇️", label: "Download Center" },
  { icon: "📜", label: "Certificate" },
  { icon: "🖥️", label: "Front CMS" },
  { icon: "🎓", label: "Alumni" },
  { icon: "📊", label: "Reports" },
  { icon: "⚙️", label: "System Settings" }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
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
          
          {SIDEBAR_MENUS.map((menu, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              <a 
                href="#"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "12px 14px", 
                  textDecoration: "none", 
                  color: i === 0 ? "white" : "inherit",
                  background: i === 0 ? "linear-gradient(90deg, #E03C31 0%, #b91c1c 100%)" : "transparent",
                  borderRadius: 12,
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  boxShadow: i === 0 ? "0 4px 12px rgba(224, 60, 49, 0.3)" : "none"
                }}
                onMouseEnter={e => { if(i !== 0) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; } }}
                onMouseLeave={e => { if(i !== 0) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "inherit"; } }}
              >
                <span style={{ width: 24, fontSize: 18, textAlign: "center", marginRight: sidebarOpen ? 12 : 0 }}>{menu.icon}</span>
                {sidebarOpen && <span style={{ fontWeight: i === 0 ? 600 : 500 }}>{menu.label}</span>}
              </a>
            </li>
          ))}
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
            
            {/* Prominent Logout Button */}
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
          
          {/* Top Row Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
            {[
              { title: "Fees Awaiting Payment", val: "0/0", icon: "💰", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
              { title: "Converted Leads", val: "0/0", icon: "📈", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
              { title: "Staff Present Today", val: "0/14", icon: "👥", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }
            ].map((stat, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 20, transition: "transform 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}>
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

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {[
              "Fees Collection & Expenses For July 2026",
              "Fees Collection & Expenses For Session 2026-27"
            ].map((title, i) => (
              <div key={i} style={{ background: "white", borderRadius: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{title}</span>
                  <button style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>⋮</button>
                </div>
                <div style={{ height: 280, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
                  <span style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📊</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>No data available for chart generation</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row Widgets */}
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

        </div>
      </div>
    </div>
  );
}
