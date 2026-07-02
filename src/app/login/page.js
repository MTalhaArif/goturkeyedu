"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";

const ADMIN_EMAIL = "goturkeytr@gmail.com";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = credential.user;

      // Block admin from using student portal
      if (user.email === ADMIN_EMAIL) {
        await auth.signOut();
        setError("Admins must use the Admin Portal to sign in.");
        setLoading(false);
        return;
      }

      // Fetch Firestore profile (created at registration)
      const profile = await getUserProfile(user.uid);

      localStorage.setItem("goturkey_user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        role: "student",
        name: profile?.name || user.displayName || user.email.split("@")[0],
        ...profile,
      }));

      router.push("/");
    } catch (err) {
      const messages = {
        "auth/invalid-credential": "Invalid email or password. Please try again.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Check your connection.",
        "auth/user-disabled": "This account has been disabled.",
      };
      setError(messages[err.code] || "Login failed. Please try again.");
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
                <span style={{ color: "#ffb300" }}>Go</span>Turkey
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Student Portal</div>
            </div>
          </a>
        </div>

        {/* Card */}
        <div style={{ background: "white", borderRadius: 20, padding: "40px 44px", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
          <h2 style={{ color: "var(--secondary)", fontSize: 26, marginBottom: 8, textAlign: "center" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", marginBottom: 30 }}>Sign in to your Go Turkey account</p>

          {/* Firebase badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "rgba(26,35,126,0.04)", borderRadius: 8, padding: "7px 12px", marginBottom: 24, border: "1px solid rgba(26,35,126,0.08)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Secured by Firebase Authentication</span>
          </div>

          {error && (
            <div style={{ background: "rgba(224,60,49,0.08)", border: "1px solid rgba(224,60,49,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "var(--primary)", fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "var(--secondary)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="you@example.com"
                className="form-input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ fontSize: 15 }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ fontWeight: 700, fontSize: 13, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
                <a href="#" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>Forgot password?</a>
              </div>
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ fontSize: 15 }}
              />
            </div>
            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "14px", fontSize: 16, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Don't have an account? <a href="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Create one free →</a>
            </p>
          </div>

          <div style={{ marginTop: 16, textAlign: "center", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <a href="/admin/login" style={{ fontSize: 12, color: "var(--text-muted)" }}>
              🔐 Admin? <span style={{ color: "#E03C31", fontWeight: 600 }}>Use Admin Portal →</span>
            </a>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          © 2024 Go Turkey. All rights reserved.
        </p>
      </div>
    </div>
  );
}
