"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { upsertUser } from "@/lib/firestore";

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interestedUniversity = searchParams.get("university") || "";
  const interestedProgram = searchParams.get("program") || "";
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    country: "", nationality: "", educationLevel: "",
    targetProgram: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const countries = ["Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bosnia", "Brazil", "Cameroon", "China", "DR Congo", "Egypt", "Ethiopia", "France", "Georgia", "Germany", "Ghana", "India", "Indonesia", "Iran", "Iraq", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Lebanon", "Libya", "Malaysia", "Morocco", "Nigeria", "Oman", "Pakistan", "Palestine", "Qatar", "Russia", "Saudi Arabia", "Senegal", "Somalia", "Sudan", "Syria", "Tajikistan", "Tunisia", "Turkey", "Turkmenistan", "UAE", "Uganda", "Ukraine", "Uzbekistan", "Yemen", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");

    try {
      // 1. Create Firebase Auth account
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = credential.user;
      const fullName = `${form.firstName} ${form.lastName}`.trim();

      // 2. Set display name in Firebase Auth
      await updateProfile(user, { displayName: fullName });

      // 3. Save full student profile to Firestore `users` collection
      await upsertUser(user.uid, {
        name: fullName,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        nationality: form.nationality,
        educationLevel: form.educationLevel,
        targetProgram: form.targetProgram,
        interestedUniversity: interestedUniversity || null,
        interestedProgram: interestedProgram || null,
        role: "student",
        status: "active",
        registeredAt: new Date().toISOString(),
      });

      // 4. Store session in localStorage
      localStorage.setItem("goturkey_user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: fullName,
        role: "student",
        country: form.country,
        educationLevel: form.educationLevel,
      }));

      router.push("/dashboard");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
        "auth/invalid-email": "Invalid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/network-request-failed": "Network error. Check your connection.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };
      setError(messages[err.code] || `Registration failed: ${err.message}`);
      setLoading(false);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #E03C31 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 36 }}>🇹🇷</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
              <span style={{ color: "#ffb300" }}>Go</span>Turkey
            </div>
          </a>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Student Portal Registration</div>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: "40px 44px", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
          {/* Step indicator */}
          <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
            {["Personal Info", "Education", "Account"].map((label, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: step > i + 1 ? "var(--secondary)" : step === i + 1 ? "var(--primary)" : "rgba(26,35,126,0.1)", color: step >= i + 1 ? "white" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, margin: "0 auto 6px" }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 11, color: step === i + 1 ? "var(--primary)" : "var(--text-muted)", fontWeight: step === i + 1 ? 700 : 400 }}>{label}</div>
                {i < 2 && <div style={{ height: 2, background: step > i + 1 ? "var(--primary)" : "var(--border)", position: "relative", top: -34, marginLeft: "50%", width: "100%" }} />}
              </div>
            ))}
          </div>

          <h2 style={{ color: "var(--secondary)", fontSize: 22, marginBottom: 24, textAlign: "center" }}>
            {step === 1 ? "Personal Information" : step === 2 ? "Education Details" : "Create Your Account"}
          </h2>

          {(interestedUniversity || interestedProgram) && (
            <div style={{ background: "rgba(26,35,126,0.05)", border: "1px solid rgba(26,35,126,0.1)", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "var(--secondary)", textAlign: "center" }}>
              🎓 Applying to: <strong>{interestedProgram || "a program"}</strong>{interestedUniversity && <> at <strong>{interestedUniversity}</strong></>}
            </div>
          )}

          {/* Firebase badge */}
          {step === 3 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "rgba(26,35,126,0.04)", borderRadius: 8, padding: "7px 12px", marginBottom: 20, border: "1px solid rgba(26,35,126,0.08)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Account secured with Firebase Authentication · Profile saved to Firestore</span>
            </div>
          )}

          {error && <div style={{ background: "rgba(224,60,49,0.08)", border: "1px solid rgba(224,60,49,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "var(--primary)", fontSize: 14 }}>⚠️ {error}</div>}

          <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s + 1); } : handleSubmit}>
            {step === 1 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>FIRST NAME *</label>
                    <input type="text" required className="form-input" value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="John" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>LAST NAME *</label>
                    <input type="text" required className="form-input" value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Doe" />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>EMAIL ADDRESS *</label>
                  <input type="email" required className="form-input" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" />
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>PHONE NUMBER</label>
                  <input type="tel" className="form-input" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 234 567 890" />
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>COUNTRY OF RESIDENCE *</label>
                  <select required className="form-select" value={form.country} onChange={e => update("country", e.target.value)}>
                    <option value="">Select country...</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>NATIONALITY *</label>
                  <select required className="form-select" value={form.nationality} onChange={e => update("nationality", e.target.value)}>
                    <option value="">Select nationality...</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>EDUCATION LEVEL *</label>
                  <select required className="form-select" value={form.educationLevel} onChange={e => update("educationLevel", e.target.value)}>
                    <option value="">Select level...</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="doctorate">Doctorate / PhD</option>
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>TARGET PROGRAM AREA</label>
                  <select className="form-select" value={form.targetProgram} onChange={e => update("targetProgram", e.target.value)}>
                    <option value="">Select field of study...</option>
                    {["Engineering", "Medicine & Health", "Business & Economics", "Computer Science & IT", "Architecture", "Social Sciences", "Natural Sciences", "Arts & Design", "Education", "Law", "Agriculture", "Other"].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div style={{ background: "rgba(26,35,126,0.04)", borderRadius: 12, padding: "20px", marginTop: 16 }}>
                  <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.7 }}>
                    <strong style={{ color: "var(--secondary)" }}>📚 Why we ask:</strong> This helps us recommend the most suitable universities and programs for you. You can always change your preferences later.
                  </p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>PASSWORD *</label>
                  <input id="reg-password" type="password" required minLength={8} className="form-input" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Minimum 8 characters" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>CONFIRM PASSWORD *</label>
                  <input id="reg-confirm-password" type="password" required className="form-input" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Repeat your password" />
                </div>
                <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 20 }}>
                  <input type="checkbox" required style={{ marginTop: 3 }} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    I agree to the <a href="/terms" style={{ color: "var(--primary)" }}>Terms of Service</a> and <a href="/privacy" style={{ color: "var(--primary)" }}>Privacy Policy</a>. I consent to receiving updates about study opportunities in Türkiye.
                  </span>
                </label>
              </>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "13px", border: "2px solid var(--secondary)", background: "none", borderRadius: 8, fontWeight: 700, color: "var(--secondary)", cursor: "pointer", fontSize: 15 }}>← Back</button>
              )}
              <button id="reg-next-submit" type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, padding: "13px", fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Creating account..." : step < 3 ? "Continue →" : "Create Account"}
              </button>
            </div>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
            Already have an account? <a href="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}
