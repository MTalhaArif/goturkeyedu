"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DUMMY_USERS = [
  { email: "student@test.com", password: "password123", role: "student", name: "Test Student" },
  { email: "demo@goturkey.com", password: "demo1234", role: "student", name: "Demo User" },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const user = DUMMY_USERS.find(u => u.email === form.email && u.password === form.password);
    if (user) {
      localStorage.setItem("goturkey_user", JSON.stringify(user));
      router.push("/");
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #E03C31 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 40 }}>🇹🇷</span>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)", letterSpacing: -1 }}>
                <span style={{ color: "#E03C31" }}>Go</span>Turkey
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Discover your potential</div>
            </div>
          </a>
        </div>

        {/* Card */}
        <div style={{ background: "white", borderRadius: 20, padding: "40px 44px", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
          <h2 style={{ color: "var(--secondary)", fontSize: 26, marginBottom: 8, textAlign: "center" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", marginBottom: 30 }}>Sign in to your Go Turkey account</p>

          {error && (
            <div style={{ background: "rgba(224,60,49,0.08)", border: "1px solid rgba(224,60,49,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "var(--primary)", fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "var(--secondary)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
              <input id="login-email" type="email" required placeholder="you@example.com" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ fontSize: 15 }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ fontWeight: 700, fontSize: 13, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
                <a href="#" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>Forgot password?</a>
              </div>
              <input id="login-password" type="password" required placeholder="••••••••" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ fontSize: 15 }} />
            </div>
            <button id="login-submit" type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: 16, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Don't have an account? <a href="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Create one free →</a>
            </p>
          </div>

        </div>

        <p style={{ textAlign: "center", marginTop: 24, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          © 2024 Go Turkey. All rights reserved.
        </p>
      </div>
    </div>
  );
}
