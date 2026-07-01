"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Simulate network request
    await new Promise(r => setTimeout(r, 600));

    if (email === "goturkeytr@gmail.com" && password === "BUR0534sa..") {
      localStorage.setItem("goturkey_user", JSON.stringify({
        email,
        role: "admin",
        name: "Super Admin"
      }));
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      padding: 24,
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative background blur */}
      <div style={{ position: "absolute", top: "10%", left: "20%", width: 400, height: 400, background: "rgba(224, 60, 49, 0.15)", filter: "blur(100px)", borderRadius: "50%" }}></div>
      <div style={{ position: "absolute", bottom: "10%", right: "20%", width: 500, height: 500, background: "rgba(37, 99, 235, 0.15)", filter: "blur(120px)", borderRadius: "50%" }}></div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 10 }}>
        
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🇹🇷</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#E03C31" }}>Go</span>Turkey <span style={{ fontWeight: 300 }}>Admin</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4, letterSpacing: "1px", textTransform: "uppercase" }}>
            Management Portal
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 24,
          padding: "40px 32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}>
          <h2 style={{ color: "white", fontSize: 22, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>Welcome Back</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, textAlign: "center", marginBottom: 32 }}>Authenticate to access the dashboard</p>

          {error && (
            <div style={{
              background: "rgba(224, 60, 49, 0.1)",
              border: "1px solid rgba(224, 60, 49, 0.3)",
              color: "#fca5a5",
              padding: "12px 16px",
              borderRadius: 12,
              marginBottom: 20,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                placeholder="admin@goturkey.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: 15,
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#E03C31"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
            
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: 15,
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#E03C31"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "linear-gradient(to right, #E03C31, #b91c1c)",
                color: "white",
                border: "none",
                padding: "16px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(224, 60, 49, 0.4)",
                transition: "all 0.2s",
                opacity: loading ? 0.7 : 1,
                transform: loading ? "scale(0.98)" : "none"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(224, 60, 49, 0.6)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(224, 60, 49, 0.4)"}
            >
              {loading ? "Authenticating..." : "Sign In to Admin Portal"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
              ← Return to Main Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
