"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Stethoscope, Mic, Send, Upload, FileText, Clock, User, Settings as SettingsIcon,
  LogOut, ShieldCheck, Globe, CheckCircle2, Circle, Home, MessageSquare,
  Activity, Pill, AlertTriangle, ChevronRight, Eye, EyeOff, Bell, X, Check,
  FileUp, Trash2, Download, Edit3, ChevronLeft, Volume2, Loader2, HeartPulse,
  ClipboardList, Users2, Sparkles, ShieldAlert
} from "lucide-react";

const FONT = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
    .mk-display { font-family: 'Space Grotesk', sans-serif; }
    .mk-body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    @keyframes mkPulse { 0%,100% { transform: scale(1); opacity:1 } 50% { transform: scale(1.12); opacity:.7 } }
    @keyframes mkFade { from { opacity:0; transform: translateY(4px)} to {opacity:1; transform:none} }
    .mk-fade { animation: mkFade .25s ease-out; }
    input:focus, textarea:focus { outline: none; }
  `}</style>
);

const TEAL = "#0E6E63";
const TEAL_DARK = "#0B564D";
const TEAL_TINT = "#E4F3EF";
const INK = "#12231F";
const SUB = "#5B6E69";
const BORDER = "#DCE6E3";
const AMBER = "#C98A2C";
const RED = "#B3402A";
const RED_TINT = "#F7E8E4";
const GREEN = "#2F8F5B";
const BG = "#F6F9F8";

const LANGS = [
  { code: "en", label: "English", native: "English", flag: "EN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "हि" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "मर" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "ગુ" },
];

const STRINGS = {
  en: { welcome: "Welcome", startInterview: "Start Interview", continue: "Continue" },
  hi: { welcome: "स्वागत है", startInterview: "साक्षात्कार शुरू करें", continue: "जारी रखें" },
  mr: { welcome: "स्वागत आहे", startInterview: "मुलाखत सुरू करा", continue: "पुढे चला" },
  gu: { welcome: "સ્વાગત છે", startInterview: "ઇન્ટરવ્યુ શરૂ કરો", continue: "ચાલુ રાખો" },
};

const DEMO_USER = {
  name: "Ishwari Sharma",
  email: "ishwari.sharma@demo.in",
  mobile: "9876543210",
  dob: "2005-03-14",
  gender: "Female",
  password: "demo1234",
  abha: "14-1234-5678-9012",
  bloodGroup: "B+",
  emergencyContact: "9822011223 (Mother)",
  address: "Kopargaon, Ahmednagar, Maharashtra",
};

const DEMO_DOCS = [
  { id: "d1", name: "Prescription.pdf", date: "12 Aug 2026", status: "processed",
    extracted: { Diagnosis: "Hypertension", Medicines: "Amlodipine 5 mg", Doctor: "Dr. Sharma" } },
  { id: "d2", name: "Blood_Test.pdf", date: "25 Jul 2026", status: "processed",
    extracted: { Hemoglobin: "12.8 g/dL", "Blood Pressure": "138/88 mmHg", Glucose: "104 mg/dL" } },
  { id: "d3", name: "Discharge_Summary.pdf", date: "10 Jun 2026", status: "processed",
    extracted: { Visit: "General consultation", Notes: "Advised follow-up in 4 weeks" } },
];

const TIMELINE_SEED = [
  { date: "12 Aug 2026", type: "Prescription", title: "Hypertension diagnosed", detail: "Amlodipine 5 mg prescribed by Dr. Sharma" },
  { date: "25 Jul 2026", type: "Lab Report", title: "Blood glucose 104 mg/dL", detail: "Hemoglobin 12.8 g/dL, BP 138/88 mmHg" },
  { date: "10 Jun 2026", type: "Visit", title: "General consultation", detail: "Routine check-up, no acute findings" },
  { date: "2025", type: "Visit", title: "Previous medical record", detail: "Seasonal fever, resolved with symptomatic treatment" },
];

const QUESTIONS = [
  { section: "Chief Complaint", q: "Hello Ishwari. What brings you to the hospital today?", type: "text", mock: "I have chest pain since yesterday evening.", field: "chiefComplaint" },
  { section: "History of Present Illness", q: "I understand. When did the chest pain start?", type: "quick", options: ["Today", "Yesterday", "This week", "Longer ago"], field: "onset" },
  { section: "History of Present Illness", q: "Where exactly do you feel the pain?", type: "text", mock: "Center of my chest, slightly to the left.", field: "location" },
  { section: "History of Present Illness", q: "How would you describe the pain?", type: "quick", options: ["Pressure", "Sharp", "Burning", "Dull", "Other"], field: "character" },
  { section: "History of Present Illness", q: "Does the pain spread to your arm, shoulder, back or jaw?", type: "quick", options: ["Yes", "No", "Not sure"], field: "radiation" },
  { section: "History of Present Illness", q: "What makes it better or worse?", type: "text", mock: "It feels worse when I climb stairs, better when I rest.", field: "modifying" },
  { section: "Review of Systems", q: "Do you have difficulty breathing?", type: "quick", options: ["Yes", "No", "Sometimes"], field: "breathing" },
  { section: "Past Medical History", q: "Do you have any known medical conditions?", type: "text", mock: "Mild hypertension, diagnosed last year.", field: "pastMedical" },
  { section: "Medicines", q: "Are you currently taking any medicines?", type: "text", mock: "Amlodipine 5 mg once daily.", field: "medicines" },
  { section: "Allergies", q: "Do you have any allergies?", type: "quick", options: ["No known allergies", "Yes", "Not sure"], field: "allergies" },
  { section: "Family History", q: "Has anyone in your family had a similar condition?", type: "text", mock: "My father had a heart condition in his 50s.", field: "family" },
  { section: "Past Surgical History", q: "Have you had any surgeries in the past?", type: "quick", options: ["Yes", "No"], field: "surgical" },
  { section: "Personal History", q: "Do you smoke or consume alcohol?", type: "quick", options: ["Neither", "Smoke", "Alcohol", "Both"], field: "personal" },
  { section: "Personal History", q: "How would you describe your sleep and diet lately?", type: "text", mock: "Sleep has been irregular, diet is mostly home-cooked.", field: "lifestyle" },
  { section: "Review of Systems", q: "Anything else you'd like to add before we finish?", type: "text", mock: "No, that covers it.", field: "additional" },
];

function Logo({ size = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: size + 14, height: size + 14, borderRadius: 10, background: TEAL,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        <Stethoscope size={size} color="#fff" strokeWidth={2} />
      </div>
      <span className="mk-display" style={{ fontSize: 19, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>
        MediKiosk
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick, style = {}, disabled, type = "button", full }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#9FC2BC" : TEAL, color: "#fff", border: "none",
        borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer", width: full ? "100%" : "auto",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "background .15s", ...style
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = TEAL_DARK; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = TEAL; }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style = {}, full }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#fff", color: INK, border: `1px solid ${BORDER}`,
        borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14,
        cursor: "pointer", width: full ? "100%" : "auto",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...style
      }}
    >
      {children}
    </button>
  );
}

function TextField({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>{label}</label>
      <input
        {...props}
        style={{
          width: "100%", padding: "11px 13px", borderRadius: 9,
          border: `1px solid ${error ? RED : BORDER}`, fontSize: 14, color: INK,
          background: "#fff", boxSizing: "border-box"
        }}
      />
      {error && <div style={{ fontSize: 12, color: RED, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  const color = type === "error" ? RED : type === "info" ? TEAL : GREEN;
  return (
    <div className="mk-fade" style={{
      position: "fixed", top: 20, right: 20, zIndex: 200, background: "#fff",
      border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, borderRadius: 10,
      padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,.08)", display: "flex",
      alignItems: "center", gap: 10, maxWidth: 320
    }}>
      <span style={{ fontSize: 13, color: INK, fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "auto", color: SUB }}>
        <X size={14} />
      </button>
    </div>
  );
}

function StoryThread() {
  return (
    <div style={{ position: "relative", paddingLeft: 22, marginTop: 36 }}>
      <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 2, background: `linear-gradient(${TEAL}, ${AMBER})`, borderRadius: 2 }} />
      {[
        { icon: MessageSquare, text: "Patient tells their story" },
        { icon: FileUp, text: "Past records fold in" },
        { icon: Sparkles, text: "One complete history" },
      ].map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, position: "relative" }}>
          <div style={{
            position: "absolute", left: -22, width: 10, height: 10, borderRadius: "50%",
            background: i === 2 ? AMBER : TEAL
          }} />
          <s.icon size={16} color={SUB} />
          <span className="mk-body" style={{ fontSize: 13.5, color: SUB }}>{s.text}</span>
        </div>
      ))}
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="mk-body" style={{ minHeight: "100vh", display: "flex", background: BG }}>
      <div style={{
        flex: "0 0 42%", background: `linear-gradient(160deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
        color: "#fff", padding: "56px 48px", display: "flex", flexDirection: "column",
        justifyContent: "center", minWidth: 340
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={20} color="#fff" />
          </div>
          <span className="mk-display" style={{ fontSize: 19, fontWeight: 600 }}>MediKiosk</span>
        </div>
        <h1 className="mk-display" style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, margin: 0, maxWidth: 340 }}>
          Your complete patient story
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, marginTop: 18, color: "rgba(255,255,255,.85)", maxWidth: 320 }}>
          Record your symptoms, organize your medical records, and prepare a complete history before your consultation.
        </p>
        <div style={{ marginTop: 8 }}>
          <div style={{ position: "relative", paddingLeft: 22, marginTop: 36 }}>
            <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 2, background: "rgba(255,255,255,.35)", borderRadius: 2 }} />
            {["Tell us how you feel", "Upload your old records", "Get a doctor-ready summary"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, position: "relative" }}>
                <div style={{ position: "absolute", left: -22, width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
                <span style={{ fontSize: 13.5, color: "rgba(255,255,255,.85)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>{children}</div>
      </div>
    </div>
  );
}

function LoginScreen({ users, onLogin, onGoRegister, notify }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [showForgot, setShowForgot] = useState(false);

  const submit = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Enter your email or mobile number.";
    if (!password.trim()) errs.password = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const found = users.find(u => (u.email === email || u.mobile === email) && u.password === password);
    if (found) {
      onLogin(found);
    } else {
      setErrors({ password: "We couldn't match that email and password." });
      notify("Login failed. Check your details or try Demo Login.", "error");
    }
  };

  return (
    <div className="mk-fade">
      <h2 className="mk-display" style={{ fontSize: 24, fontWeight: 600, color: INK, marginBottom: 4 }}>Sign in</h2>
      <p style={{ fontSize: 13.5, color: SUB, marginBottom: 24 }}>Welcome back. Let's continue your patient story.</p>

      <TextField label="Email or mobile number" placeholder="name@email.com" value={email}
        onChange={e => setEmail(e.target.value)} error={errors.email} />

      <div style={{ marginBottom: 6, position: "relative" }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>Password</label>
        <input type={showPw ? "text" : "password"} placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "11px 40px 11px 13px", borderRadius: 9, border: `1px solid ${errors.password ? RED : BORDER}`, fontSize: 14, boxSizing: "border-box" }} />
        <button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 12, top: 34, background: "none", border: "none", cursor: "pointer", color: SUB }}>
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        {errors.password && <div style={{ fontSize: 12, color: RED, marginTop: 4 }}>{errors.password}</div>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 22px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: SUB, cursor: "pointer" }}>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Remember me
        </label>
        <button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: TEAL, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Forgot password?
        </button>
      </div>

      <PrimaryButton onClick={submit} full>Sign in</PrimaryButton>
      <div style={{ margin: "12px 0" }}>
        <GhostButton full onClick={() => onLogin(DEMO_USER, true)}>
          <Sparkles size={15} /> Demo login for judges
        </GhostButton>
      </div>

      <p style={{ textAlign: "center", fontSize: 13.5, color: SUB, marginTop: 20 }}>
        Don't have an account?{" "}
        <button onClick={onGoRegister} style={{ background: "none", border: "none", color: TEAL, fontWeight: 600, cursor: "pointer" }}>Register</button>
      </p>

      {showForgot && (
        <Modal onClose={() => setShowForgot(false)} title="Password reset">
          <p style={{ fontSize: 13.5, color: SUB, lineHeight: 1.6 }}>
            Password reset isn't available in this prototype. Use Demo Login or your registered password to continue.
          </p>
          <PrimaryButton onClick={() => setShowForgot(false)} style={{ marginTop: 12 }} full>Got it</PrimaryButton>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,25,22,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div className="mk-fade" style={{ background: "#fff", borderRadius: 14, padding: 24, width: 380, maxWidth: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 className="mk-display" style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: SUB }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function RegisterScreen({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", dob: "", gender: "", password: "", confirm: "", abha: "", agree: false });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(form.mobile)) errs.mobile = "Enter a valid 10-digit mobile number.";
    if (!form.dob) errs.dob = "Date of birth is required.";
    if (!form.gender) errs.gender = "Select a gender.";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords don't match.";
    if (!form.agree) errs.agree = "You must agree to continue.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onRegister({ ...form });
  };

  return (
    <div className="mk-fade">
      <h2 className="mk-display" style={{ fontSize: 24, fontWeight: 600, color: INK, marginBottom: 4 }}>Create your account</h2>
      <p style={{ fontSize: 13.5, color: SUB, marginBottom: 22 }}>Takes about two minutes.</p>

      <TextField label="Full name" value={form.name} onChange={e => set("name", e.target.value)} error={errors.name} placeholder="Ishwari Sharma" />
      <TextField label="Email" value={form.email} onChange={e => set("email", e.target.value)} error={errors.email} placeholder="name@email.com" />
      <TextField label="Mobile number" value={form.mobile} onChange={e => set("mobile", e.target.value)} error={errors.mobile} placeholder="9876543210" />
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TextField label="Date of birth" type="date" value={form.dob} onChange={e => set("dob", e.target.value)} error={errors.dob} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>Gender</label>
          <select value={form.gender} onChange={e => set("gender", e.target.value)}
            style={{ width: "100%", padding: "11px 13px", borderRadius: 9, border: `1px solid ${errors.gender ? RED : BORDER}`, fontSize: 14, background: "#fff" }}>
            <option value="">Select</option>
            <option>Female</option><option>Male</option><option>Other</option>
          </select>
          {errors.gender && <div style={{ fontSize: 12, color: RED, marginTop: 4 }}>{errors.gender}</div>}
        </div>
      </div>
      <TextField label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} error={errors.password} placeholder="At least 6 characters" />
      <TextField label="Confirm password" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} error={errors.confirm} />
      <TextField label="ABHA ID (optional)" value={form.abha} onChange={e => set("abha", e.target.value)} placeholder="14-xxxx-xxxx-xxxx" />

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: SUB, marginBottom: 6, cursor: "pointer" }}>
        <input type="checkbox" checked={form.agree} onChange={e => set("agree", e.target.checked)} style={{ marginTop: 2 }} />
        I agree to the Terms and Privacy Policy.
      </label>
      {errors.agree && <div style={{ fontSize: 12, color: RED, marginBottom: 10 }}>{errors.agree}</div>}

      <PrimaryButton onClick={submit} full style={{ marginTop: 8 }}>Create account</PrimaryButton>
      <p style={{ textAlign: "center", fontSize: 13.5, color: SUB, marginTop: 18 }}>
        Already registered?{" "}
        <button onClick={onGoLogin} style={{ background: "none", border: "none", color: TEAL, fontWeight: 600, cursor: "pointer" }}>Sign in</button>
      </p>
    </div>
  );
}

function ConsentScreen({ onAccept, onDecline }) {
  const [consent, setConsent] = useState({ history: true, voice: true, docs: true, summary: true });
  const [playing, setPlaying] = useState(false);
  const allOn = Object.values(consent).every(Boolean);

  const play = () => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2200);
  };

  const items = [
    { key: "history", label: "Medical history", desc: "The symptoms and history you share in conversation." },
    { key: "voice", label: "Voice / conversation", desc: "Your spoken responses during the interview, where used." },
    { key: "docs", label: "Medical documents", desc: "Prescriptions, lab reports and discharge summaries you upload." },
    { key: "summary", label: "Health summary", desc: "The combined report generated for your doctor." },
  ];

  return (
    <div className="mk-body" style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mk-fade" style={{ background: "#fff", borderRadius: 16, padding: 40, maxWidth: 560, width: "100%", border: `1px solid ${BORDER}` }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <ShieldCheck size={22} color={TEAL} />
        </div>
        <h1 className="mk-display" style={{ fontSize: 24, fontWeight: 600, color: INK, margin: 0 }}>Your data, your consent</h1>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 12 }}>
          <p style={{ fontSize: 14, color: SUB, lineHeight: 1.6, margin: 0, flex: 1 }}>
            MediKiosk collects your health information to prepare a structured medical history for your healthcare provider.
          </p>
          <button onClick={play} title="Listen to consent explanation" style={{ background: TEAL_TINT, border: "none", borderRadius: 8, padding: 8, cursor: "pointer", flexShrink: 0 }}>
            <Volume2 size={16} color={TEAL} style={playing ? { animation: "mkPulse 1s infinite" } : {}} />
          </button>
        </div>
        {playing && <div style={{ fontSize: 12.5, color: TEAL, marginTop: 6 }}>Playing consent explanation…</div>}

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(it => (
            <div key={it.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: INK }}>{it.label}</div>
                <div style={{ fontSize: 12.5, color: SUB, marginTop: 2 }}>{it.desc}</div>
              </div>
              <button onClick={() => setConsent(c => ({ ...c, [it.key]: !c[it.key] }))}
                style={{
                  width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer",
                  background: consent[it.key] ? TEAL : "#D8DEDC", position: "relative", flexShrink: 0
                }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: consent[it.key] ? 21 : 3, transition: "left .15s" }} />
              </button>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12.5, color: SUB, marginTop: 16, background: TEAL_TINT, padding: 12, borderRadius: 8 }}>
          Your information will only be used with your permission, and only to prepare your patient story for review by a qualified healthcare professional.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <GhostButton onClick={onDecline} style={{ flex: 1 }}>Decline</GhostButton>
          <PrimaryButton onClick={() => onAccept(consent)} disabled={!allOn} style={{ flex: 1.4 }}>
            <Check size={15} /> I understand and give consent
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function LanguageScreen({ onContinue }) {
  const [sel, setSel] = useState("en");
  return (
    <div className="mk-body" style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mk-fade" style={{ background: "#fff", borderRadius: 16, padding: 40, maxWidth: 480, width: "100%", border: `1px solid ${BORDER}`, textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Globe size={22} color={TEAL} />
        </div>
        <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>Choose your preferred language</h1>
        <p style={{ fontSize: 13.5, color: SUB, marginTop: 8 }}>You can change your language anytime from your profile.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setSel(l.code)}
              style={{
                padding: "16px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                border: `1.5px solid ${sel === l.code ? TEAL : BORDER}`,
                background: sel === l.code ? TEAL_TINT : "#fff"
              }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: TEAL, marginBottom: 6 }}>{l.flag}</div>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: INK }}>{l.native}</div>
              <div style={{ fontSize: 12, color: SUB }}>{l.label}{l.code !== "en" ? " · basic labels" : " · full experience"}</div>
            </button>
          ))}
        </div>

        <PrimaryButton onClick={() => onContinue(sel)} full style={{ marginTop: 26 }}>
          Continue to MediKiosk <ChevronRight size={16} />
        </PrimaryButton>
      </div>
    </div>
  );
}

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "chat", label: "AI History Chat", icon: MessageSquare },
  { key: "upload", label: "Medical Documents", icon: FileText },
  { key: "report", label: "Medical Report", icon: ClipboardList },
  { key: "timeline", label: "Patient Timeline", icon: Clock },
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

function Sidebar({ screen, setScreen, onLogout }) {
  return (
    <div style={{ width: 232, flexShrink: 0, background: "#fff", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", padding: "20px 14px", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "0 8px 22px" }}><Logo size={18} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV.map(n => {
          const active = screen === n.key;
          return (
            <button key={n.key} onClick={() => setScreen(n.key)}
              style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 12px",
                borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left",
                background: active ? TEAL_TINT : "transparent",
                borderLeft: active ? `3px solid ${TEAL}` : "3px solid transparent",
              }}>
              <n.icon size={16.5} color={active ? TEAL : SUB} />
              <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? TEAL : INK }}>{n.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", textAlign: "left" }}>
        <LogOut size={16.5} color={RED} />
        <span style={{ fontSize: 13.5, fontWeight: 500, color: RED }}>Log out</span>
      </button>
    </div>
  );
}

function TopBar({ title, user, language, setLanguage }) {
  const [open, setOpen] = useState(false);
  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
      <h2 className="mk-display" style={{ fontSize: 18, fontWeight: 600, color: INK, margin: 0 }}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12.5, color: INK }}>
            <Globe size={14} /> {LANGS.find(l => l.code === language)?.native}
          </button>
          {open && (
            <div style={{ position: "absolute", right: 0, top: 34, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.08)", zIndex: 20, width: 150 }}>
              {LANGS.map(l => (
                <button key={l.code} onClick={() => { setLanguage(l.code); setOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: INK }}>
                  {l.native}
                </button>
              ))}
            </div>
          )}
        </div>
        <Bell size={17} color={SUB} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: TEAL, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>{initials}</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>{user.name.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
      {done ? <CheckCircle2 size={15} color={GREEN} /> : <Circle size={15} color="#C7D1CE" />}
      <span style={{ fontSize: 13, color: done ? INK : SUB }}>{label}</span>
    </div>
  );
}

function Dashboard({ user, setScreen, chatDone, docsCount, progressPct }) {
  return (
    <div style={{ padding: 28 }}>
      <h1 className="mk-display" style={{ fontSize: 24, fontWeight: 600, color: INK, margin: 0 }}>Welcome, {user.name.split(" ")[0]} 👋</h1>
      <p style={{ fontSize: 14, color: SUB, marginTop: 4 }}>Let's prepare your complete patient story.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginTop: 24 }}>
        <div onClick={() => setScreen("chat")} style={{ cursor: "pointer", background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`, borderRadius: 16, padding: 28, color: "#fff", position: "relative", overflow: "hidden" }}>
          <MessageSquare size={22} />
          <h3 className="mk-display" style={{ fontSize: 19, fontWeight: 600, margin: "14px 0 4px" }}>Start medical history</h3>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.85)", margin: 0, maxWidth: 320 }}>Tell us how you're feeling — in your own words, by typing or speaking.</p>
          <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.15)", padding: "9px 16px", borderRadius: 9, fontSize: 13.5, fontWeight: 600 }}>
            {chatDone ? "Review interview" : "Start interview"} <ChevronRight size={14} />
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: `1px solid ${BORDER}` }}>
          <h4 style={{ fontSize: 13.5, fontWeight: 600, color: INK, margin: "0 0 12px" }}>Your patient profile</h4>
          <ProgressRow label="Personal information" done />
          <ProgressRow label="Consent" done />
          <ProgressRow label="Language" done />
          <ProgressRow label="Medical history" done={chatDone} />
          <ProgressRow label="Medical documents" done={docsCount > 0} />
          <ProgressRow label="Final report" done={chatDone && docsCount > 0} />
          <div style={{ marginTop: 12, height: 6, background: "#EDF2F1", borderRadius: 999 }}>
            <div style={{ height: 6, width: `${progressPct}%`, background: TEAL, borderRadius: 999, transition: "width .3s" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
        {[
          { icon: Upload, title: "Upload medical records", desc: "Add prescriptions, lab reports or discharge summaries.", btn: "Upload documents", go: "upload" },
          { icon: ClipboardList, title: "Your medical report", desc: "Review your AI-generated patient history.", btn: "View report", go: "report" },
          { icon: Clock, title: "Health timeline", desc: "See your medical history organized by date.", btn: "View timeline", go: "timeline" },
        ].map((c, i) => (
          <div key={i} onClick={() => setScreen(c.go)} style={{ cursor: "pointer", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <c.icon size={17} color={TEAL} />
            </div>
            <h4 style={{ fontSize: 14.5, fontWeight: 600, color: INK, margin: "0 0 4px" }}>{c.title}</h4>
            <p style={{ fontSize: 12.5, color: SUB, margin: "0 0 12px", lineHeight: 1.5 }}>{c.desc}</p>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEAL, display: "flex", alignItems: "center", gap: 4 }}>{c.btn} <ChevronRight size={13} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatScreen({ user, language, answers, setAnswers, qIndex, setQIndex, messages, setMessages, onFinish }) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);
  const done = qIndex >= QUESTIONS.length;
  const current = !done ? QUESTIONS[qIndex] : null;
  const pct = Math.round((qIndex / QUESTIONS.length) * 100);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && current) {
      setMessages([{ sender: "ai", text: current.q, section: current.section }]);
    }
  }, []);

  const advance = (answerText) => {
    const q = QUESTIONS[qIndex];
    setAnswers(a => ({ ...a, [q.field]: answerText }));
    const userMsg = { sender: "user", text: answerText };
    const nextIndex = qIndex + 1;
    const next = QUESTIONS[nextIndex];
    setMessages(m => [...m, userMsg, ...(next ? [{ sender: "ai", text: next.q, section: next.section }] : [{ sender: "ai", text: "Your medical history has been recorded.", section: "Complete" }])]);
    setQIndex(nextIndex);
    setInput("");
  };

  const send = () => {
    if (!input.trim()) return;
    advance(input.trim());
  };

  const simulateVoice = () => {
    if (!current) return;
    setListening(true);
    setTimeout(() => {
      setListening(false);
      setInput(current.mock || "Yes, that's correct.");
    }, 1400);
  };

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", height: "calc(100vh - 65px)" }}>
      <div>
        <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>AI medical history</h1>
        <p style={{ fontSize: 13.5, color: SUB, margin: "4px 0 14px" }}>Tell us about your health in your own words.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, color: SUB }}>{user.name} · {LANGS.find(l => l.code === language)?.native}</span>
          <span style={{ fontSize: 12.5, color: TEAL, fontWeight: 600 }}>{done ? "Complete" : `History ${pct}% complete`}</span>
        </div>
        <div style={{ height: 6, background: "#EDF2F1", borderRadius: 999, marginBottom: 16 }}>
          <div style={{ height: 6, width: `${done ? 100 : pct}%`, background: TEAL, borderRadius: 999, transition: "width .3s" }} />
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} className="mk-fade" style={{ display: "flex", justifyContent: m.sender === "ai" ? "flex-start" : "flex-end" }}>
            <div style={{
              maxWidth: "70%", padding: "10px 14px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
              background: m.sender === "ai" ? TEAL_TINT : TEAL, color: m.sender === "ai" ? INK : "#fff",
              borderBottomLeftRadius: m.sender === "ai" ? 3 : 12, borderBottomRightRadius: m.sender === "ai" ? 12 : 3
            }}>
              {m.section && m.sender === "ai" && <div style={{ fontSize: 10.5, fontWeight: 700, color: TEAL, marginBottom: 3 }}>{m.section.toUpperCase()}</div>}
              {m.text}
            </div>
          </div>
        ))}
        {!done && <div style={{ fontSize: 11.5, color: SUB, alignSelf: "flex-start", paddingLeft: 4 }}>Question {qIndex + 1} of {QUESTIONS.length}</div>}
      </div>

      {!done ? (
        <div style={{ marginTop: 14 }}>
          {current.type === "quick" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {current.options.map(o => (
                <button key={o} onClick={() => advance(o)} style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid ${TEAL}`, background: "#fff", color: TEAL, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{o}</button>
              ))}
              <button onClick={() => advance("Skip")} style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid ${BORDER}`, background: "#fff", color: SUB, fontSize: 13, cursor: "pointer" }}>Skip</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={simulateVoice} title="Speak your answer"
              style={{
                width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0, cursor: "pointer",
                background: listening ? RED : TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center",
                animation: listening ? "mkPulse 1s infinite" : "none"
              }}>
              <Mic size={18} color={listening ? "#fff" : TEAL} />
            </button>
            <input value={listening ? "Listening…" : input} disabled={listening}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Type your answer…"
              style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 14 }} />
            <PrimaryButton onClick={send} disabled={listening || !input.trim()}><Send size={15} /></PrimaryButton>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <PrimaryButton onClick={onFinish} full>Continue to medical records <ChevronRight size={15} /></PrimaryButton>
        </div>
      )}
    </div>
  );
}

function UploadScreen({ documents, setDocuments, notify }) {
  const [dragOver, setDragOver] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const fileRef = useRef(null);

  const handleFiles = (files) => {
    const list = Array.from(files || []);
    list.forEach((f, i) => {
      const id = "u" + Date.now() + i;
      const doc = { id, name: f.name, date: "Today", status: "analyzing" };
      setDocuments(d => [...d, doc]);
      setTimeout(() => {
        setDocuments(d => d.map(x => x.id === id ? {
          ...x, status: "processed",
          extracted: { Diagnosis: "Seasonal fever", Medicines: "Paracetamol 500 mg", Doctor: "Dr. Patel" }
        } : x));
        notify(`${f.name} processed`, "success");
      }, 1800);
    });
  };

  return (
    <div style={{ padding: 28 }}>
      <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>Medical records</h1>
      <p style={{ fontSize: 13.5, color: SUB, margin: "4px 0 20px" }}>Upload your previous medical documents to build your complete patient story.</p>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${dragOver ? TEAL : BORDER}`, borderRadius: 16, padding: 40, textAlign: "center",
          background: dragOver ? TEAL_TINT : "#fff", cursor: "pointer"
        }}>
        <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        <Upload size={26} color={TEAL} style={{ margin: "0 auto 10px" }} />
        <p style={{ fontSize: 14.5, fontWeight: 600, color: INK, margin: "0 0 4px" }}>Drag and drop files, or click to browse</p>
        <p style={{ fontSize: 12.5, color: SUB, margin: 0 }}>Prescriptions · Lab reports · Discharge summaries · Medical reports</p>
        <p style={{ fontSize: 11.5, color: "#9AA8A4", marginTop: 8 }}>PDF, JPG, PNG up to 10MB</p>
      </div>

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        {documents.map(doc => (
          <div key={doc.id} className="mk-fade" style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={17} color={TEAL} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{doc.name}</div>
              <div style={{ fontSize: 12, color: SUB }}>{doc.date}</div>
            </div>
            {doc.status === "analyzing" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: AMBER }}>
                <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Analyzing document…
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: GREEN, fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Processed
              </span>
            )}
            <button onClick={() => setViewDoc(doc)} disabled={doc.status !== "processed"} style={{ background: "none", border: "none", cursor: doc.status === "processed" ? "pointer" : "default", color: SUB }}><Eye size={16} /></button>
            <button onClick={() => setDocuments(d => d.filter(x => x.id !== doc.id))} style={{ background: "none", border: "none", cursor: "pointer", color: RED }}><Trash2 size={16} /></button>
          </div>
        ))}
        {documents.length === 0 && <p style={{ fontSize: 13, color: SUB, textAlign: "center" }}>No documents uploaded yet.</p>}
      </div>

      {viewDoc && (
        <Modal onClose={() => setViewDoc(null)} title={viewDoc.name}>
          <div style={{ fontSize: 12.5, color: SUB, marginBottom: 10 }}>{viewDoc.date}</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: TEAL, marginBottom: 8 }}>EXTRACTED INFORMATION</div>
          {Object.entries(viewDoc.extracted || {}).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
              <span style={{ color: SUB }}>{k}</span><span style={{ fontWeight: 600, color: INK }}>{v}</span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

function TimelineScreen({ events }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Diagnoses", "Medicines", "Lab Reports", "Visits"];
  const typeMatch = { Diagnoses: "Prescription", "Lab Reports": "Lab Report", Visits: "Visit" };
  const shown = filter === "All" ? events : events.filter(e => e.type === typeMatch[filter]);
  const colorFor = t => t === "Prescription" ? TEAL : t === "Lab Report" ? AMBER : "#6B7FD7";

  return (
    <div style={{ padding: 28 }}>
      <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>Medical timeline</h1>
      <p style={{ fontSize: 13.5, color: SUB, margin: "4px 0 18px" }}>Your health journey, organized in one place.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 14px", borderRadius: 999, border: `1px solid ${filter === f ? TEAL : BORDER}`, background: filter === f ? TEAL_TINT : "#fff", color: filter === f ? TEAL : SUB, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", paddingLeft: 26 }}>
        <div style={{ position: "absolute", left: 8, top: 6, bottom: 6, width: 2, background: BORDER }} />
        {shown.map((ev, i) => (
          <div key={i} className="mk-fade" style={{ position: "relative", marginBottom: 18 }}>
            <div style={{ position: "absolute", left: -26, top: 4, width: 12, height: 12, borderRadius: "50%", background: colorFor(ev.type), border: "2px solid #fff", boxShadow: `0 0 0 2px ${BORDER}` }} />
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${colorFor(ev.type)}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: colorFor(ev.type) }}>{ev.type.toUpperCase()}</span>
                <span style={{ fontSize: 12, color: SUB }}>{ev.date}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>{ev.title}</div>
              <div style={{ fontSize: 12.5, color: SUB, marginTop: 2 }}>{ev.detail}</div>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p style={{ fontSize: 13, color: SUB }}>No entries in this category yet.</p>}
      </div>
    </div>
  );
}

function ReportScreen({ user, answers, documents, notify }) {
  const [editing, setEditing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const has = f => answers[f] && answers[f] !== "Skip";

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: TEAL, letterSpacing: ".02em", marginBottom: 8 }}>{title.toUpperCase()}</div>
      <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.6 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ padding: 28, maxWidth: 780 }}>
      <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>Complete patient story</h1>
      <p style={{ fontSize: 13.5, color: SUB, margin: "4px 0 16px" }}>AI-generated clinical history for physician review.</p>

      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FDF3E7", border: `1px solid #F0D9AE`, borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
        <AlertTriangle size={16} color={AMBER} />
        <span style={{ fontSize: 12.5, color: "#7A5A1E", fontWeight: 600 }}>AI-generated draft — physician verification required.</span>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 26 }}>
        <Section title="Patient information">
          {user.name} · {user.gender || "—"} · Preferred language: English
        </Section>
        <Section title="Chief complaint">
          {has("chiefComplaint") ? answers.chiefComplaint : "Not yet recorded."}
        </Section>
        <Section title="History of present illness">
          Onset: {answers.onset || "—"} &nbsp;·&nbsp; Location: {answers.location || "—"} &nbsp;·&nbsp; Character: {answers.character || "—"}<br/>
          Radiates: {answers.radiation || "—"} &nbsp;·&nbsp; Modifying factors: {answers.modifying || "—"}
        </Section>
        <Section title="Past medical history">{answers.pastMedical || "None reported."}</Section>
        <Section title="Past surgical history">{answers.surgical || "None reported."}</Section>
        <Section title="Current medications">{answers.medicines || "None reported."}</Section>
        <Section title="Allergies">{answers.allergies || "None reported."}</Section>
        <Section title="Family history">{answers.family || "None reported."}</Section>
        <Section title="Personal history">{answers.personal || "—"}. {answers.lifestyle || ""}</Section>
        <Section title="Review of systems">Breathing difficulty: {answers.breathing || "Not assessed"}. {answers.additional || ""}</Section>
        <Section title="Previous investigations">
          {documents.filter(d => d.extracted).map(d => (
            <div key={d.id} style={{ marginBottom: 6 }}>
              <strong>{d.name}</strong> ({d.date}): {Object.entries(d.extracted).map(([k, v]) => `${k} — ${v}`).join(", ")}
            </div>
          ))}
          {documents.length === 0 && "No previous documents uploaded."}
        </Section>

        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: RED, letterSpacing: ".02em", marginBottom: 8 }}>RED FLAG / ATTENTION ITEMS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: RED_TINT, padding: "10px 14px", borderRadius: 8 }}>
            <ShieldAlert size={15} color={RED} />
            <span style={{ fontSize: 13, color: RED }}>
              {has("chiefComplaint") ? "Chest discomfort reported — requires physician review." : "No urgent findings flagged from the interview so far."}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <GhostButton onClick={() => setEditing(e => !e)}><Edit3 size={14} /> {editing ? "Done editing" : "Edit report"}</GhostButton>
        <PrimaryButton onClick={() => { setConfirmed(true); notify("Report confirmed for physician review.", "success"); }}>
          <Check size={15} /> Confirm report
        </PrimaryButton>
        <GhostButton onClick={() => notify("PDF generation coming soon.", "info")}><Download size={14} /> Download PDF</GhostButton>
      </div>
      {confirmed && <p style={{ fontSize: 12.5, color: GREEN, marginTop: 10 }}>Confirmed and ready to share with your doctor.</p>}
      {editing && <p style={{ fontSize: 12.5, color: SUB, marginTop: 10 }}>Prototype note: full inline editing of each field will be enabled in the production build — for now, revisit the AI history chat to change answers.</p>}
    </div>
  );
}

function ProfileScreen({ user, setUser, notify }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("");

  const save = () => { setUser(form); setEditing(false); notify("Profile updated.", "success"); };

  const Row = ({ label, field, disabled }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: SUB, display: "block", marginBottom: 4 }}>{label}</label>
      {editing && !disabled ? (
        <input value={form[field] || ""} onChange={e => set(field, e.target.value)}
          style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13.5, boxSizing: "border-box" }} />
      ) : (
        <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{user[field] || "—"}</div>
      )}
    </div>
  );

  return (
    <div style={{ padding: 28, maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: TEAL, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 600 }}>{initials}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>{user.name}</div>
          <div style={{ fontSize: 12.5, color: SUB }}>{user.email} · {user.mobile}</div>
          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: TEAL_TINT, padding: "2px 8px", borderRadius: 999, marginTop: 4, display: "inline-block" }}>Patient</span>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>PERSONAL INFORMATION</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Row label="Full name" field="name" />
          <Row label="Date of birth" field="dob" />
          <Row label="Gender" field="gender" />
          <Row label="Phone" field="mobile" />
          <Row label="Email" field="email" disabled />
          <Row label="Address" field="address" />
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>HEALTHCARE INFORMATION</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Row label="ABHA ID" field="abha" />
          <Row label="Blood group" field="bloodGroup" />
          <Row label="Emergency contact" field="emergencyContact" />
          <div>
            <label style={{ fontSize: 12, color: SUB, display: "block", marginBottom: 4 }}>Preferred language</label>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>English</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>CONSENT</h4>
        {["Medical history consent", "Document processing consent", "Data sharing consent"].map(c => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
            <CheckCircle2 size={14} color={GREEN} /> {c}
          </div>
        ))}
      </div>

      {editing ? (
        <PrimaryButton onClick={save}><Check size={15} /> Save changes</PrimaryButton>
      ) : (
        <GhostButton onClick={() => { setForm(user); setEditing(true); }}><Edit3 size={14} /> Edit profile</GhostButton>
      )}
    </div>
  );
}

function SettingsScreen({ language, setLanguage, notify }) {
  const [a11y, setA11y] = useState({ large: false, contrast: false, voice: true });
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} style={{ width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", background: on ? TEAL : "#D8DEDC", position: "relative" }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 21 : 3, transition: "left .15s" }} />
    </button>
  );
  return (
    <div style={{ padding: 28, maxWidth: 560 }}>
      <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: "0 0 20px" }}>Settings</h1>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>LANGUAGE</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLanguage(l.code); notify(`Language set to ${l.native}.`, "success"); }}
              style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${language === l.code ? TEAL : BORDER}`, background: language === l.code ? TEAL_TINT : "#fff", color: language === l.code ? TEAL : INK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {l.native}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>ACCESSIBILITY</h4>
        {[["large", "Large text"], ["contrast", "High contrast"], ["voice", "Voice assistance"]].map(([k, label]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <span style={{ fontSize: 13.5, color: INK }}>{label}</span>
            <Toggle on={a11y[k]} onClick={() => setA11y(s => ({ ...s, [k]: !s[k] }))} />
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>PRIVACY</h4>
        <button onClick={() => notify("Showing your current consent record.", "info")} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "8px 0", fontSize: 13.5, color: INK, cursor: "pointer" }}>View consent</button>
        <button onClick={() => notify("Consent withdrawal noted for this prototype.", "info")} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "8px 0", fontSize: 13.5, color: RED, cursor: "pointer" }}>Withdraw consent</button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ padding: "14px 28px", borderTop: `1px solid ${BORDER}`, fontSize: 11.5, color: "#93A29D", background: "#fff" }}>
      MediKiosk is a clinical intake and record organization prototype. It does not provide autonomous medical diagnosis. All information and AI-generated summaries must be reviewed by a qualified healthcare professional.
    </div>
  );
}

export default function MediKiosk() {
  const [stage, setStage] = useState("login");
  const [users, setUsers] = useState([DEMO_USER]);
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState("en");
  const [screen, setScreen] = useState("dashboard");
  const [documents, setDocuments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [qIndex, setQIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (u, isDemo) => {
    setUser(u);
    if (isDemo) { setDocuments(DEMO_DOCS); notify("Signed in as demo patient.", "success"); }
    else notify(`Welcome back, ${u.name.split(" ")[0]}.`, "success");
    setStage("consent");
  };

  const handleRegister = (form) => {
    setUsers(u => [...u, { ...form, name: form.name }]);
    notify("Account created. Please sign in.", "success");
    setStage("login");
  };

  const handleConsent = () => setStage("language");
  const handleDecline = () => notify("Consent is required to continue.", "error");
  const handleLanguage = (code) => { setLanguage(code); setStage("app"); setScreen("dashboard"); };

  const logout = () => {
    setStage("login"); setUser(null); setScreen("dashboard");
    setAnswers({}); setQIndex(0); setMessages([]); setDocuments([]);
    notify("Signed out.", "info");
  };

  const chatDone = qIndex >= QUESTIONS.length;
  const progressPct = Math.round((3 + (chatDone ? 1 : 0) + (documents.length > 0 ? 1 : 0) + (chatDone && documents.length > 0 ? 1 : 0)) / 6 * 100);

  return (
    <div className="mk-body" style={{ background: BG, minHeight: "100vh" }}>
      {FONT}
      <Toast {...toast} onClose={() => setToast(null)} />

      {stage === "login" && (
        <AuthLayout><LoginScreen users={users} onLogin={handleLogin} onGoRegister={() => setStage("register")} notify={notify} /></AuthLayout>
      )}
      {stage === "register" && (
        <AuthLayout><RegisterScreen onRegister={handleRegister} onGoLogin={() => setStage("login")} /></AuthLayout>
      )}
      {stage === "consent" && <ConsentScreen onAccept={handleConsent} onDecline={handleDecline} />}
      {stage === "language" && <LanguageScreen onContinue={handleLanguage} />}

      {stage === "app" && user && (
        <div style={{ display: "flex" }}>
          <Sidebar screen={screen} setScreen={setScreen} onLogout={logout} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <TopBar title={NAV.find(n => n.key === screen)?.label || ""} user={user} language={language} setLanguage={setLanguage} />
            <div style={{ flex: 1 }}>
              {screen === "dashboard" && <Dashboard user={user} setScreen={setScreen} chatDone={chatDone} docsCount={documents.length} progressPct={progressPct} />}
              {screen === "chat" && (
                <ChatScreen user={user} language={language} answers={answers} setAnswers={setAnswers}
                  qIndex={qIndex} setQIndex={setQIndex} messages={messages} setMessages={setMessages}
                  onFinish={() => setScreen("upload")} />
              )}
              {screen === "upload" && <UploadScreen documents={documents} setDocuments={setDocuments} notify={notify} />}
              {screen === "timeline" && <TimelineScreen events={documents.length ? TIMELINE_SEED : TIMELINE_SEED.slice(2)} />}
              {screen === "report" && <ReportScreen user={user} answers={answers} documents={documents} notify={notify} />}
              {screen === "profile" && <ProfileScreen user={user} setUser={setUser} notify={notify} />}
              {screen === "settings" && <SettingsScreen language={language} setLanguage={setLanguage} notify={notify} />}
            </div>
            <Footer />
          </div>
        </div>
      )}
    </div>
  );
}