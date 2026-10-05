// @ts-nocheck
// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from "react";
import enLocale from "../locales/en.json";
import hiLocale from "../locales/hi.json";
import mrLocale from "../locales/mr.json";
import guLocale from "../locales/gu.json";
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

const LOCALES = {
  en: enLocale,
  hi: hiLocale,
  mr: mrLocale,
  gu: guLocale,
};

const STORAGE_KEY = "medikiosk_language";

const translateValue = (language, key, fallback = key) => {
  const locale = LOCALES[language] || LOCALES.en;
  const path = key.split(".");
  let value = locale;
  for (const segment of path) {
    if (value && typeof value === "object" && segment in value) {
      value = value[segment];
    } else {
      value = undefined;
      break;
    }
  }
  if (typeof value === "string") return value;

  let fallbackValue = LOCALES.en;
  for (const segment of path) {
    if (fallbackValue && typeof fallbackValue === "object" && segment in fallbackValue) {
      fallbackValue = fallbackValue[segment];
    } else {
      fallbackValue = undefined;
      break;
    }
  }
  return typeof fallbackValue === "string" ? fallbackValue : fallback;
};

const getStoredLanguage = () => {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved && LOCALES[saved] ? saved : "en";
};

const safeTranslate = (language, key, fallback = key) => translateValue(language || "en", key, fallback);

const getLanguageLabel = (code) => LANGS.find(item => item.code === code)?.native || "English";

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

const QUESTION_DEFS = [
  { field: "chiefComplaint", sectionKey: "questions.sections.chiefComplaint", sectionFallback: "Chief Complaint", questionKey: "questions.chiefComplaint", questionFallback: "Hello Ishwari. What brings you to the hospital today?", type: "text", mockKey: "questions.mocks.chiefComplaint", mockFallback: "I have pain since yesterday evening." },
  { field: "onset", sectionKey: "questions.sections.historyIllness", sectionFallback: "History of Present Illness", questionKey: "questions.onset", questionFallback: "I understand. When did the pain start?", type: "quick", optionKeys: [["questions.options.today", "Today"], ["questions.options.yesterday", "Yesterday"], ["questions.options.thisWeek", "This week"], ["questions.options.longerAgo", "Longer ago"]] },
  { field: "location", sectionKey: "questions.sections.historyIllness", sectionFallback: "History of Present Illness", questionKey: "questions.location", questionFallback: "Where exactly do you feel the pain?", type: "text", mockKey: "questions.mocks.location", mockFallback: "Center of my chest, slightly to the left." },
  { field: "character", sectionKey: "questions.sections.historyIllness", sectionFallback: "History of Present Illness", questionKey: "questions.character", questionFallback: "How would you describe the pain?", type: "quick", optionKeys: [["questions.options.pressure", "Pressure"], ["questions.options.sharp", "Sharp"], ["questions.options.burning", "Burning"], ["questions.options.dull", "Dull"], ["questions.options.other", "Other"]] },
  { field: "radiation", sectionKey: "questions.sections.historyIllness", sectionFallback: "History of Present Illness", questionKey: "questions.radiation", questionFallback: "Does the pain spread to your arm, shoulder, back or jaw?", type: "quick", optionKeys: [["questions.options.yes", "Yes"], ["questions.options.no", "No"], ["questions.options.notSure", "Not sure"]] },
  { field: "modifying", sectionKey: "questions.sections.historyIllness", sectionFallback: "History of Present Illness", questionKey: "questions.modifying", questionFallback: "What makes it better or worse?", type: "text", mockKey: "questions.mocks.modifying", mockFallback: "It feels worse when I climb stairs, better when I rest." },
  { field: "breathing", sectionKey: "questions.sections.reviewSystems", sectionFallback: "Review of Systems", questionKey: "questions.breathing", questionFallback: "Do you have difficulty breathing?", type: "quick", optionKeys: [["questions.options.yes", "Yes"], ["questions.options.no", "No"], ["questions.options.sometimes", "Sometimes"]] },
  { field: "pastMedical", sectionKey: "questions.sections.pastMedicalHistory", sectionFallback: "Past Medical History", questionKey: "questions.pastMedical", questionFallback: "Do you have any known medical conditions?", type: "text", mockKey: "questions.mocks.pastMedical", mockFallback: "Mild hypertension, diagnosed last year." },
  { field: "medicines", sectionKey: "questions.sections.medicines", sectionFallback: "Medicines", questionKey: "questions.medicines", questionFallback: "Are you currently taking any medicines?", type: "text", mockKey: "questions.mocks.medicines", mockFallback: "Amlodipine 5 mg once daily." },
  { field: "allergies", sectionKey: "questions.sections.allergies", sectionFallback: "Allergies", questionKey: "questions.allergies", questionFallback: "Do you have any allergies?", type: "quick", optionKeys: [["questions.options.noKnownAllergies", "No known allergies"], ["questions.options.yes", "Yes"], ["questions.options.notSure", "Not sure"]] },
  { field: "family", sectionKey: "questions.sections.familyHistory", sectionFallback: "Family History", questionKey: "questions.family", questionFallback: "Has anyone in your family had a similar condition?", type: "text", mockKey: "questions.mocks.family", mockFallback: "My father had a heart condition in his 50s." },
  { field: "surgical", sectionKey: "questions.sections.pastSurgicalHistory", sectionFallback: "Past Surgical History", questionKey: "questions.surgical", questionFallback: "Have you had any surgeries in the past?", type: "quick", optionKeys: [["questions.options.yes", "Yes"], ["questions.options.no", "No"]] },
  { field: "personal", sectionKey: "questions.sections.personalHistory", sectionFallback: "Personal History", questionKey: "questions.personal", questionFallback: "Do you smoke or consume alcohol?", type: "quick", optionKeys: [["questions.options.neither", "Neither"], ["questions.options.smoke", "Smoke"], ["questions.options.alcohol", "Alcohol"], ["questions.options.both", "Both"]] },
  { field: "lifestyle", sectionKey: "questions.sections.personalHistory", sectionFallback: "Personal History", questionKey: "questions.lifestyle", questionFallback: "How would you describe your sleep and diet lately?", type: "text", mockKey: "questions.mocks.lifestyle", mockFallback: "Sleep has been irregular, diet is mostly home-cooked." },
  { field: "additional", sectionKey: "questions.sections.reviewSystems", sectionFallback: "Review of Systems", questionKey: "questions.additional", questionFallback: "Anything else you'd like to add before we finish?", type: "text", mockKey: "questions.mocks.additional", mockFallback: "No, that covers it." },
];

const getLocalizedQuestions = (language) => {
  return QUESTION_DEFS.map((item) => ({
    ...item,
    section: safeTranslate(language, item.sectionKey, item.sectionFallback),
    q: safeTranslate(language, item.questionKey, item.questionFallback),
    mock: item.mockKey ? safeTranslate(language, item.mockKey, item.mockFallback) : undefined,
    options: item.optionKeys ? item.optionKeys.map(([key, fallback]) => safeTranslate(language, key, fallback)) : undefined,
  }));
};

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

function AuthLayout({ children, t }) {
  const benefits = [
    t("auth.benefit1", "Tell us how you feel"),
    t("auth.benefit2", "Upload your old records"),
    t("auth.benefit3", "Get a doctor-ready summary")
  ];

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
          {t("auth.heroTitle", "Your complete patient story")}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, marginTop: 18, color: "rgba(255,255,255,.85)", maxWidth: 320 }}>
          {t("auth.heroBody", "Record your symptoms, organize your medical records, and prepare a complete history before your consultation.")}
        </p>
        <div style={{ marginTop: 8 }}>
          <div style={{ position: "relative", paddingLeft: 22, marginTop: 36 }}>
            <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 2, background: "rgba(255,255,255,.35)", borderRadius: 2 }} />
            {benefits.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, position: "relative" }}>
                <div style={{ position: "absolute", left: -22, width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
                <span style={{ fontSize: 13.5, color: "rgba(255,255,255,.85)" }}>{item}</span>
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

function LoginScreen({ users, onLogin, onGoRegister, notify, language, t }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [showForgot, setShowForgot] = useState(false);

  const submit = () => {
    const errs = {};
    if (!email.trim()) errs.email = t("validation.emailRequired", "Enter your email or mobile number.");
    if (!password.trim()) errs.password = t("validation.passwordRequired", "Enter your password.");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const found = users.find(u => (u.email === email || u.mobile === email) && u.password === password);
    if (found) {
      onLogin(found);
    } else {
      setErrors({ password: t("validation.invalidCredentials", "We couldn't match that email and password.") });
      notify(t("auth.loginFailed", "Login failed. Check your details or try Demo Login."), "error");
    }
  };

  return (
    <div className="mk-fade">
      <h2 className="mk-display" style={{ fontSize: 24, fontWeight: 600, color: INK, marginBottom: 4 }}>{t("auth.signIn", "Sign in")}</h2>
      <p style={{ fontSize: 13.5, color: SUB, marginBottom: 24 }}>{t("auth.welcomeBack", "Welcome back. Let's continue your patient story.")}</p>

      <TextField label={t("auth.emailOrMobile", "Email or mobile number")} placeholder="name@email.com" value={email}
        onChange={e => setEmail(e.target.value)} error={errors.email} />

      <div style={{ marginBottom: 6, position: "relative" }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>{t("auth.password", "Password")}</label>
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
          {t("auth.rememberMe", "Remember me")}
        </label>
        <button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: TEAL, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {t("auth.forgotPassword", "Forgot password?")}
        </button>
      </div>

      <PrimaryButton onClick={submit} full>{t("auth.signIn", "Sign in")}</PrimaryButton>
      <div style={{ margin: "12px 0" }}>
        <GhostButton full onClick={() => onLogin(DEMO_USER, true)}>
          <Sparkles size={15} /> {t("auth.demoLogin", "Demo login for judges")}
        </GhostButton>
      </div>

      <p style={{ textAlign: "center", fontSize: 13.5, color: SUB, marginTop: 20 }}>
        {t("auth.dontHaveAccount", "Don't have an account?")}{" "}
        <button onClick={onGoRegister} style={{ background: "none", border: "none", color: TEAL, fontWeight: 600, cursor: "pointer" }}>{t("auth.register", "Register")}</button>
      </p>

      {showForgot && (
        <Modal onClose={() => setShowForgot(false)} title={t("auth.passwordResetTitle", "Password reset")}>
          <p style={{ fontSize: 13.5, color: SUB, lineHeight: 1.6 }}>
            {t("auth.passwordResetMessage", "Password reset isn't available in this prototype. Use Demo Login or your registered password to continue.")}
          </p>
          <PrimaryButton onClick={() => setShowForgot(false)} style={{ marginTop: 12 }} full>{t("auth.gotIt", "Got it")}</PrimaryButton>
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

function RegisterScreen({ onRegister, onGoLogin, t }) {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", dob: "", gender: "", password: "", confirm: "", abha: "", agree: false });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t("validation.fullNameRequired", "Full name is required.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = t("validation.emailInvalid", "Enter a valid email address.");
    if (!/^\d{10}$/.test(form.mobile)) errs.mobile = t("validation.mobileInvalid", "Enter a valid 10-digit mobile number.");
    if (!form.dob) errs.dob = t("validation.dobRequired", "Date of birth is required.");
    if (!form.gender) errs.gender = t("validation.genderRequired", "Select a gender.");
    if (form.password.length < 6) errs.password = t("validation.passwordMin", "Password must be at least 6 characters.");
    if (form.confirm !== form.password) errs.confirm = t("validation.passwordsMatch", "Passwords don't match.");
    if (!form.agree) errs.agree = t("validation.agreeRequired", "You must agree to continue.");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onRegister({ ...form });
  };

  return (
    <div className="mk-fade">
      <h2 className="mk-display" style={{ fontSize: 24, fontWeight: 600, color: INK, marginBottom: 4 }}>{t("auth.createAccount", "Create your account")}</h2>
      <p style={{ fontSize: 13.5, color: SUB, marginBottom: 22 }}>{t("auth.takesAboutTwoMinutes", "Takes about two minutes.")}</p>

      <TextField label={t("auth.fullName", "Full name")} value={form.name} onChange={e => set("name", e.target.value)} error={errors.name} placeholder="Ishwari Sharma" />
      <TextField label={t("auth.email", "Email")} value={form.email} onChange={e => set("email", e.target.value)} error={errors.email} placeholder="name@email.com" />
      <TextField label={t("auth.mobile", "Mobile number")} value={form.mobile} onChange={e => set("mobile", e.target.value)} error={errors.mobile} placeholder="9876543210" />
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TextField label={t("auth.dateOfBirth", "Date of birth")} type="date" value={form.dob} onChange={e => set("dob", e.target.value)} error={errors.dob} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>{t("auth.gender", "Gender")}</label>
          <select value={form.gender} onChange={e => set("gender", e.target.value)}
            style={{ width: "100%", padding: "11px 13px", borderRadius: 9, border: `1px solid ${errors.gender ? RED : BORDER}`, fontSize: 14, background: "#fff" }}>
            <option value="">{t("auth.selectGender", "Select")}</option>
            <option>{t("auth.female", "Female")}</option><option>{t("auth.male", "Male")}</option><option>{t("auth.other", "Other")}</option>
          </select>
          {errors.gender && <div style={{ fontSize: 12, color: RED, marginTop: 4 }}>{errors.gender}</div>}
        </div>
      </div>
      <TextField label={t("auth.password", "Password")} type="password" value={form.password} onChange={e => set("password", e.target.value)} error={errors.password} placeholder={t("auth.passwordHint", "At least 6 characters")} />
      <TextField label={t("auth.confirmPassword", "Confirm password")} type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} error={errors.confirm} />
      <TextField label={t("auth.abhaId", "ABHA ID (optional)")} value={form.abha} onChange={e => set("abha", e.target.value)} placeholder="14-xxxx-xxxx-xxxx" />

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: SUB, marginBottom: 6, cursor: "pointer" }}>
        <input type="checkbox" checked={form.agree} onChange={e => set("agree", e.target.checked)} style={{ marginTop: 2 }} />
        {t("auth.agreeTerms", "I agree to the Terms and Privacy Policy.")}
      </label>
      {errors.agree && <div style={{ fontSize: 12, color: RED, marginBottom: 10 }}>{errors.agree}</div>}

      <PrimaryButton onClick={submit} full style={{ marginTop: 8 }}>{t("auth.createAccount", "Create account")}</PrimaryButton>
      <p style={{ textAlign: "center", fontSize: 13.5, color: SUB, marginTop: 18 }}>
        {t("auth.alreadyRegistered", "Already registered?")}{" "}
        <button onClick={onGoLogin} style={{ background: "none", border: "none", color: TEAL, fontWeight: 600, cursor: "pointer" }}>{t("auth.signInLink", "Sign in")}</button>
      </p>
    </div>
  );
}

function ConsentScreen({ onAccept, onDecline, t }) {
  const [consent, setConsent] = useState({ history: true, voice: true, docs: true, summary: true });
  const [playing, setPlaying] = useState(false);
  const allOn = Object.values(consent).every(Boolean);

  const play = () => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2200);
  };

  const items = [
    { key: "history", label: t("consent.history", "Medical history"), desc: t("consent.descriptionHistory", "The symptoms and history you share in conversation.") },
    { key: "voice", label: t("consent.voice", "Voice / conversation"), desc: t("consent.descriptionVoice", "Your spoken responses during the interview, where used.") },
    { key: "docs", label: t("consent.docs", "Medical documents"), desc: t("consent.descriptionDocs", "Prescriptions, lab reports and discharge summaries you upload.") },
    { key: "summary", label: t("consent.summary", "Health summary"), desc: t("consent.descriptionSummary", "The combined report generated for your doctor.") },
  ];

  return (
    <div className="mk-body" style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mk-fade" style={{ background: "#fff", borderRadius: 16, padding: 40, maxWidth: 560, width: "100%", border: `1px solid ${BORDER}` }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <ShieldCheck size={22} color={TEAL} />
        </div>
        <h1 className="mk-display" style={{ fontSize: 24, fontWeight: 600, color: INK, margin: 0 }}>{t("consent.title", "Your data, your consent")}</h1>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 12 }}>
          <p style={{ fontSize: 14, color: SUB, lineHeight: 1.6, margin: 0, flex: 1 }}>
            {t("consent.intro", "MediKiosk collects your health information to prepare a structured medical history for your healthcare provider.")}
          </p>
          <button onClick={play} title={t("consent.listen", "Listen to consent explanation")} style={{ background: TEAL_TINT, border: "none", borderRadius: 8, padding: 8, cursor: "pointer", flexShrink: 0 }}>
            <Volume2 size={16} color={TEAL} style={playing ? { animation: "mkPulse 1s infinite" } : {}} />
          </button>
        </div>
        {playing && <div style={{ fontSize: 12.5, color: TEAL, marginTop: 6 }}>{t("consent.playConsent", "Playing consent explanation…")}</div>}

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
          {t("consent.info", "Your information will only be used with your permission, and only to prepare your patient story for review by a qualified healthcare professional.")}
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <GhostButton onClick={onDecline} style={{ flex: 1 }}>{t("consent.decline", "Decline")}</GhostButton>
          <PrimaryButton onClick={() => onAccept(consent)} disabled={!allOn} style={{ flex: 1.4 }}>
            <Check size={15} /> {t("consent.accept", "I understand and give consent")}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function LanguageScreen({ onContinue, language, t }) {
  const [sel, setSel] = useState(language || "en");
  return (
    <div className="mk-body" style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mk-fade" style={{ background: "#fff", borderRadius: 16, padding: 40, maxWidth: 480, width: "100%", border: `1px solid ${BORDER}`, textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Globe size={22} color={TEAL} />
        </div>
        <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>{t("language.title", "Choose your preferred language")}</h1>
        <p style={{ fontSize: 13.5, color: SUB, marginTop: 8 }}>{t("language.subtitle", "You can change your language anytime from your profile.")}</p>

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
              <div style={{ fontSize: 12, color: SUB }}>{l.label}{l.code !== "en" ? ` · ${t("language.basicLabels", "basic labels")}` : ` · ${t("language.fullExperience", "full experience")}`}</div>
            </button>
          ))}
        </div>

        <PrimaryButton onClick={() => onContinue(sel)} full style={{ marginTop: 26 }}>
          {t("language.continueTo", "Continue to MediKiosk")} <ChevronRight size={16} />
        </PrimaryButton>
      </div>
    </div>
  );
}

const getNavItems = (t) => [
  { key: "dashboard", label: t("nav.dashboard", "Dashboard"), icon: Home },
  { key: "chat", label: t("nav.chat", "AI History Chat"), icon: MessageSquare },
  { key: "upload", label: t("nav.upload", "Medical Documents"), icon: FileText },
  { key: "report", label: t("nav.report", "Medical Report"), icon: ClipboardList },
  { key: "timeline", label: t("nav.timeline", "Patient Timeline"), icon: Clock },
  { key: "profile", label: t("nav.profile", "Profile"), icon: User },
  { key: "settings", label: t("nav.settings", "Settings"), icon: SettingsIcon },
];

function Sidebar({ screen, setScreen, onLogout, t }) {
  return (
    <div style={{ width: 232, flexShrink: 0, background: "#fff", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", padding: "20px 14px", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "0 8px 22px" }}><Logo size={18} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {getNavItems(t).map(n => {
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
        <span style={{ fontSize: 13.5, fontWeight: 500, color: RED }}>{t("common.logout", "Log out")}</span>
      </button>
    </div>
  );
}

function TopBar({ title, user, language, setLanguage, t }) {
  const [open, setOpen] = useState(false);
  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
      <h2 className="mk-display" style={{ fontSize: 18, fontWeight: 600, color: INK, margin: 0 }}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12.5, color: INK }}>
            <Globe size={14} /> {getLanguageLabel(language)}
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

function Dashboard({ user, setScreen, chatDone, docsCount, progressPct, language, t }) {
  return (
    <div style={{ padding: 28 }}>
      <h1 className="mk-display" style={{ fontSize: 24, fontWeight: 600, color: INK, margin: 0 }}>{t("dashboard.welcome", "Welcome")}, {user.name.split(" ")[0]} 👋</h1>
      <p style={{ fontSize: 14, color: SUB, marginTop: 4 }}>{t("dashboard.prepareStory", "Let's prepare your complete patient story.")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginTop: 24 }}>
        <div onClick={() => setScreen("chat")} style={{ cursor: "pointer", background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`, borderRadius: 16, padding: 28, color: "#fff", position: "relative", overflow: "hidden" }}>
          <MessageSquare size={22} />
          <h3 className="mk-display" style={{ fontSize: 19, fontWeight: 600, margin: "14px 0 4px" }}>{t("dashboard.startInterview", "Start medical history")}</h3>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.85)", margin: 0, maxWidth: 320 }}>{t("dashboard.prepareStory", "Let's prepare your complete patient story.")}</p>
          <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.15)", padding: "9px 16px", borderRadius: 9, fontSize: 13.5, fontWeight: 600 }}>
            {chatDone ? t("dashboard.reviewInterview", "Review interview") : t("dashboard.startInterview", "Start interview")} <ChevronRight size={14} />
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: `1px solid ${BORDER}` }}>
          <h4 style={{ fontSize: 13.5, fontWeight: 600, color: INK, margin: "0 0 12px" }}>{t("dashboard.patientProfile", "Your patient profile")}</h4>
          <ProgressRow label={t("dashboard.personalInfo", "Personal information")} done />
          <ProgressRow label={t("dashboard.consent", "Consent")} done />
          <ProgressRow label={t("dashboard.language", "Language")} done />
          <ProgressRow label={t("dashboard.medicalHistory", "Medical history")} done={chatDone} />
          <ProgressRow label={t("dashboard.documents", "Medical documents")} done={docsCount > 0} />
          <ProgressRow label={t("dashboard.finalReport", "Final report")} done={chatDone && docsCount > 0} />
          <div style={{ marginTop: 12, height: 6, background: "#EDF2F1", borderRadius: 999 }}>
            <div style={{ height: 6, width: `${progressPct}%`, background: TEAL, borderRadius: 999, transition: "width .3s" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
        {[
          { icon: Upload, title: t("dashboard.uploadRecords", "Upload medical records"), desc: t("dashboard.uploadDescription", "Add prescriptions, lab reports or discharge summaries."), btn: t("dashboard.uploadAction", "Upload documents"), go: "upload" },
          { icon: ClipboardList, title: t("dashboard.reportTitle", "Your medical report"), desc: t("dashboard.reportDescription", "Review your AI-generated patient history."), btn: t("dashboard.reportAction", "View report"), go: "report" },
          { icon: Clock, title: t("dashboard.timelineTitle", "Health timeline"), desc: t("dashboard.timelineDescription", "See your medical history organized by date."), btn: t("dashboard.timelineAction", "View timeline"), go: "timeline" },
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

function ChatScreen({ user, language, answers, setAnswers, qIndex, setQIndex, messages, setMessages, onFinish, t }) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);
  const questions = getLocalizedQuestions(language);
  const done = qIndex >= questions.length;
  const current = !done ? questions[qIndex] : null;
  const pct = Math.round((qIndex / questions.length) * 100);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && current) {
      setMessages([{ sender: "ai", text: current.q, section: current.section }]);
    }
  }, []);

  const advance = (answerText) => {
    const q = questions[qIndex];
    if (!q) return;
    setAnswers(a => ({ ...a, [q.field]: answerText }));
    const userMsg = { sender: "user", text: answerText };
    const nextIndex = qIndex + 1;
    const next = questions[nextIndex];
    setMessages(m => [...m, userMsg, ...(next ? [{ sender: "ai", text: next.q, section: next.section }] : [{ sender: "ai", text: t("chat.recorded", "Your medical history has been recorded."), section: t("chat.historyComplete", "Complete") }])]);
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
        <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>{t("chat.title", "AI medical history")}</h1>
        <p style={{ fontSize: 13.5, color: SUB, margin: "4px 0 14px" }}>{t("chat.subtitle", "Tell us about your health in your own words.")}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, color: SUB }}>{user.name} · {getLanguageLabel(language)}</span>
          <span style={{ fontSize: 12.5, color: TEAL, fontWeight: 600 }}>{done ? t("chat.historyComplete", "Complete") : `${t("chat.historyProgress", "History")} ${pct}%`}</span>
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
        {!done && <div style={{ fontSize: 11.5, color: SUB, alignSelf: "flex-start", paddingLeft: 4 }}>{t("chat.questionLabel", "Question")} {qIndex + 1} {t("chat.of", "of")} {questions.length}</div>}
      </div>

      {!done ? (
        <div style={{ marginTop: 14 }}>
          {current.type === "quick" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {current.options.map(o => (
                <button key={o} onClick={() => advance(o)} style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid ${TEAL}`, background: "#fff", color: TEAL, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{o}</button>
              ))}
              <button onClick={() => advance("Skip")} style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid ${BORDER}`, background: "#fff", color: SUB, fontSize: 13, cursor: "pointer" }}>{t("common.skip", "Skip")}</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={simulateVoice} title={t("chat.voiceTooltip", "Speak your answer")}
              style={{
                width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0, cursor: "pointer",
                background: listening ? RED : TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center",
                animation: listening ? "mkPulse 1s infinite" : "none"
              }}>
              <Mic size={18} color={listening ? "#fff" : TEAL} />
            </button>
            <input value={listening ? t("chat.listening", "Listening…") : input} disabled={listening}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder={t("chat.placeholder", "Type your answer…")}
              style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 14 }} />
            <PrimaryButton onClick={send} disabled={listening || !input.trim()}><Send size={15} /></PrimaryButton>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <PrimaryButton onClick={onFinish} full>{t("chat.continue", "Continue to medical records")} <ChevronRight size={15} /></PrimaryButton>
        </div>
      )}
    </div>
  );
}

const toSummaryItems = value => value == null || value === "" ? [] : Array.isArray(value) ? value : [value];

const getSummaryText = value => {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (!value || typeof value !== "object") return "";
  return [value.name, value.value, value.diagnosis, value.test_name, value.test, value.result, value.allergen, value.instruction, value.advice]
    .find(item => item != null && item !== "")?.toString().trim() || "";
};

const normalizeDiagnosis = value => {
  const phrase = getSummaryText(value).replace(/\s+/g, " ").replace(/[.!?]+$/, "");
  if (!phrase) return "";
  return phrase.toLowerCase()
    .replace(/^([a-z])/, letter => letter.toUpperCase())
    .replace(/\b(hiv|aids|copd|tb|gerd|uti|dvt|ckd)\b/gi, acronym => acronym.toUpperCase());
};

const normalizeFrequency = value => {
  const frequency = getSummaryText(value).toLowerCase().replace(/\s+/g, " ");
  const numberWords = { one: "1", two: "2", three: "3", four: "4" };
  const timesPerDay = frequency.match(/^(\d+|one|two|three|four)\s+times?\s+(?:a day|daily)$/);
  if (timesPerDay) return `${numberWords[timesPerDay[1]] || timesPerDay[1]} times/day`;

  const daily = frequency.match(/^(once|twice|thrice)\s+(?:daily|a day)(\s+at night)?$/);
  if (daily) return `${daily[1]}/day${daily[2] || ""}`;
  return frequency;
};

const getDocumentSummary = document => {
  const response = document.apiResponse || {};
  const result = document.result || response.result || {};
  const information = document.extracted_information || response.extracted_information || {};
  const legacy = document.extracted || {};
  const firstAvailable = (...values) => values.find(value => value != null
    && value !== ""
    && (!Array.isArray(value) || value.length > 0)
    && (typeof value !== "object" || Array.isArray(value) || Object.keys(value).length > 0));

  const diagnosisSource = firstAvailable(result.diagnoses, result.diagnosis, information.diagnosis, legacy.Diagnosis);
  const diagnosis = toSummaryItems(diagnosisSource).map(normalizeDiagnosis).find(Boolean) || "";
  const medicationSource = firstAvailable(result.medications, information.medications, legacy.Medicines);
  const seenMedications = new Set();
  const medications = toSummaryItems(medicationSource).map(item => {
    if (typeof item === "string") {
      const text = item.trim();
      return { key: text.toLowerCase(), text };
    }
    const name = getSummaryText(item?.medication || item?.name);
    const strength = getSummaryText(item?.strength);
    const frequency = normalizeFrequency(item?.frequency);
    const duration = getSummaryText(item?.duration);
    const details = [name, strength, frequency, duration].filter(Boolean);
    return { key: `${name.toLowerCase()}|${strength.toLowerCase()}`, text: details.join(" — ") };
  }).filter(item => {
    if (!item.text || seenMedications.has(item.key)) return false;
    seenMedications.add(item.key);
    return true;
  });

  const knownLabNames = new Set(["blood pressure", "blood sugar", "cbc", "glucose", "haemoglobin", "hemoglobin", "hba1c"]);
  const legacyLabs = Object.entries(legacy)
    .filter(([name]) => knownLabNames.has(name.toLowerCase()))
    .map(([name, value]) => ({ name, value }));
  const labSource = firstAvailable(result.lab_results, information.lab_results, legacyLabs);
  const labResults = toSummaryItems(labSource).map(item => {
    if (typeof item === "string" || typeof item === "number") return String(item).trim();
    const name = getSummaryText(item?.test_name || item?.test || item?.name || item?.lab_test);
    const value = getSummaryText(item?.value || item?.result);
    const unit = getSummaryText(item?.unit);
    const measurement = [value, unit].filter(Boolean).join(" ");
    return [name, measurement].filter(Boolean).join(": ");
  }).filter(Boolean);

  const allergies = toSummaryItems(firstAvailable(result.allergies, information.allergies))
    .map(getSummaryText).filter(Boolean);
  const adviceSource = firstAvailable(result.advice, result.doctor_notes, information.advice, information.doctor_notes);
  const advice = toSummaryItems(adviceSource).map(getSummaryText)
    .filter(value => value && !/^advice\s*:?$/i.test(value));
  const followUp = getSummaryText(firstAvailable(result.follow_up, information.follow_up));
  const doctor = getSummaryText(firstAvailable(
    result.document?.doctor,
    result.doctor?.name,
    information.document?.doctor,
    information.doctor?.name,
    information.doctor,
    legacy.Doctor,
  ));
  const date = getSummaryText(firstAvailable(result.document?.date, information.document?.date, legacy.Date));
  const warnings = toSummaryItems(firstAvailable(document.warnings, response.warnings));
  const hasSummaryData = Boolean(diagnosis || medications.length || doctor || date || labResults.length || allergies.length || advice.length || followUp);
  const needsReview = document.status === "needs_review"
    || document.backendStatus === "needs_review"
    || response.status === "needs_review"
    || result.status === "needs_review"
    || result.needs_review === true
    || warnings.length > 0
    || (!hasSummaryData && document.status !== "failed");

  return {
    diagnosis,
    medications,
    doctor,
    date,
    labResults,
    allergies,
    advice,
    followUp,
    needsReview,
    rawOcrText: document.raw_ocr_text || response.raw_ocr_text || result.raw_ocr_text || result.raw_text || "",
  };
};

function UploadScreen({ documents, setDocuments, notify, language, t }) {
  const [dragOver, setDragOver] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const fileRef = useRef(null);
  const summary = viewDoc ? getDocumentSummary(viewDoc) : null;

  const handleFiles = (files) => {
    const list = Array.from(files || []);
    list.forEach((file, index) => {
      const id = "u" + Date.now() + index;
      const doc = { id, name: file.name, date: t("upload.uploadedToday", "Today"), status: "processing" };
      setDocuments(d => [...d, doc]);

      const headers = new Headers();
      headers.append("Accept", "application/json");
      const formData = new FormData();
      formData.append("file", file);
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001").replace(/\/+$/, "");

      fetch(`${apiBaseUrl}/documents/extract`, {
        method: "POST",
        body: formData,
        headers,
      })
        .then(async response => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(payload?.detail || payload?.result?.error || "Unable to reliably extract information from this document.");
          }

          const result = payload?.result || {};
          setDocuments(d => d.map(x => x.id === id ? {
            ...x,
            status: result?.needs_review === true ? "needs_review" : "processed",
            backendStatus: payload?.status,
            warnings: payload?.warnings,
            raw_ocr_text: payload?.raw_ocr_text,
            extracted_information: payload?.extracted_information,
            result: payload?.result,
            apiResponse: payload,
            extracted: payload?.extracted_information ?? payload?.result,
          } : x));
          notify(`${file.name} processed`, "success");
        })
        .catch(error => {
          setDocuments(d => d.map(x => x.id === id ? {
            ...x,
            status: "failed",
            error: error.message || "Unable to reliably extract information from this document.",
          } : x));
          notify(error.message || "Unable to reliably extract information from this document.", "error");
        });
    });
  };

  return (
    <div style={{ padding: 28 }}>
      <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>{t("upload.title", "Medical records")}</h1>
      <p style={{ fontSize: 13.5, color: SUB, margin: "4px 0 20px" }}>{t("upload.subtitle", "Upload your previous medical documents to build your complete patient story.")}</p>

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
        <p style={{ fontSize: 14.5, fontWeight: 600, color: INK, margin: "0 0 4px" }}>{t("upload.dropzoneTitle", "Drag and drop files, or click to browse")}</p>
        <p style={{ fontSize: 12.5, color: SUB, margin: 0 }}>{t("upload.dropzoneSubtitle", "Prescriptions · Lab reports · Discharge summaries · Medical reports")}</p>
        <p style={{ fontSize: 11.5, color: "#9AA8A4", marginTop: 8 }}>{t("upload.dropzoneMeta", "PDF, JPG, PNG up to 10MB")}</p>
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
            {doc.status === "processing" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: AMBER }}>
                <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Processing...
              </span>
            ) : doc.status === "needs_review" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: AMBER, fontWeight: 600 }}>
                <ShieldAlert size={14} /> Needs review
              </span>
            ) : doc.status === "failed" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: RED, fontWeight: 600 }}>
                <ShieldAlert size={14} /> Failed
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: GREEN, fontWeight: 600 }}>
                <CheckCircle2 size={14} /> {t("upload.processed", "Processed")}
              </span>
            )}
            <button onClick={() => setViewDoc(doc)} disabled={doc.status === "processing"} style={{ background: "none", border: "none", cursor: doc.status === "processing" ? "not-allowed" : "pointer", color: SUB }}><Eye size={16} /></button>
            <button onClick={() => setDocuments(d => d.filter(x => x.id !== doc.id))} style={{ background: "none", border: "none", cursor: "pointer", color: RED }}><Trash2 size={16} /></button>
          </div>
        ))}
        {documents.length === 0 && <p style={{ fontSize: 13, color: SUB, textAlign: "center" }}>{t("upload.noDocuments", "No documents uploaded yet.")}</p>}
      </div>

      {viewDoc && (
        <Modal onClose={() => setViewDoc(null)} title={viewDoc.name}>
          {viewDoc.error && (
            <div style={{ background: RED_TINT, borderRadius: 10, padding: "10px 12px", color: RED, fontWeight: 600, marginBottom: 14 }}>
              {viewDoc.error}
            </div>
          )}
          <div style={{ fontSize: 12.5, fontWeight: 700, color: TEAL, marginBottom: 8 }}>{t("upload.extractedInfo", "EXTRACTED INFORMATION")}</div>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {summary.needsReview && (
              <div style={{ background: "#FFF4DF", borderRadius: 8, padding: "8px 10px", color: AMBER, fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>
                Needs review
              </div>
            )}
            {summary.diagnosis && (
              <div style={{ padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                <div style={{ color: SUB, fontWeight: 600, marginBottom: 3 }}>Diagnosis</div>
                <div style={{ color: INK }}>{summary.diagnosis}</div>
              </div>
            )}
            {summary.medications.length > 0 && (
              <div style={{ padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                <div style={{ color: SUB, fontWeight: 600, marginBottom: 3 }}>Medicines</div>
                <ul style={{ color: INK, margin: 0, paddingLeft: 18 }}>
                  {summary.medications.map((medication, index) => <li key={`${medication.key}-${index}`}>{medication.text}</li>)}
                </ul>
              </div>
            )}
            {summary.doctor && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                <span style={{ color: SUB }}>Doctor</span><span style={{ color: INK, fontWeight: 600, textAlign: "right" }}>{summary.doctor}</span>
              </div>
            )}
            {summary.date && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                <span style={{ color: SUB }}>Date</span><span style={{ color: INK, fontWeight: 600, textAlign: "right" }}>{summary.date}</span>
              </div>
            )}
            {summary.labResults.length > 0 && (
              <div style={{ padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                <div style={{ color: SUB, fontWeight: 600, marginBottom: 3 }}>Lab results</div>
                <ul style={{ color: INK, margin: 0, paddingLeft: 18 }}>
                  {summary.labResults.map((result, index) => <li key={`${result}-${index}`}>{result}</li>)}
                </ul>
              </div>
            )}
            {summary.allergies.length > 0 && (
              <div style={{ padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                <div style={{ color: SUB, fontWeight: 600, marginBottom: 3 }}>Allergies</div>
                <div style={{ color: INK }}>{summary.allergies.join(", ")}</div>
              </div>
            )}
            {summary.advice.length > 0 && (
              <div style={{ padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                <div style={{ color: SUB, fontWeight: 600, marginBottom: 3 }}>Instructions</div>
                <ul style={{ color: INK, margin: 0, paddingLeft: 18 }}>
                  {summary.advice.map((instruction, index) => <li key={`${instruction}-${index}`}>{instruction}</li>)}
                </ul>
              </div>
            )}
            {summary.followUp && (
              <div style={{ padding: "7px 0", fontSize: 13 }}>
                <div style={{ color: SUB, fontWeight: 600, marginBottom: 3 }}>Follow-up</div>
                <div style={{ color: INK }}>{summary.followUp}</div>
              </div>
            )}
            {!summary.diagnosis && summary.medications.length === 0 && !summary.doctor && !summary.date
              && summary.labResults.length === 0 && summary.allergies.length === 0 && summary.advice.length === 0 && !summary.followUp && (
                <div style={{ color: SUB, fontSize: 13, padding: "7px 0" }}>No structured clinical information available.</div>
              )}
          </div>
          {summary.rawOcrText && (
            <details style={{ marginTop: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
              <summary style={{ color: TEAL, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>View OCR details</summary>
              <pre style={{ maxHeight: 220, overflowY: "auto", whiteSpace: "pre-wrap", overflowWrap: "anywhere", font: "inherit", color: SUB, fontSize: 11.5, margin: "8px 0 0" }}>
                {summary.rawOcrText}
              </pre>
            </details>
          )}
        </Modal>
      )}
    </div>
  );
}

function TimelineScreen({ events, language, t }) {
  const [filter, setFilter] = useState("All");
  const filters = [t("timeline.all", "All"), t("timeline.diagnoses", "Diagnoses"), t("timeline.medicines", "Medicines"), t("timeline.labReports", "Lab Reports"), t("timeline.visits", "Visits")];
  const typeMatch = { [t("timeline.diagnoses", "Diagnoses")]: "Prescription", [t("timeline.labReports", "Lab Reports")]: "Lab Report", [t("timeline.visits", "Visits")]: "Visit" };
  const shown = filter === t("timeline.all", "All") ? events : events.filter(e => e.type === typeMatch[filter]);
  const colorFor = type => type === "Prescription" ? TEAL : type === "Lab Report" ? AMBER : "#6B7FD7";

  return (
    <div style={{ padding: 28 }}>
      <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>{t("timeline.title", "Medical timeline")}</h1>
      <p style={{ fontSize: 13.5, color: SUB, margin: "4px 0 18px" }}>{t("timeline.subtitle", "Your health journey, organized in one place.")}</p>

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
        {shown.length === 0 && <p style={{ fontSize: 13, color: SUB }}>{t("timeline.noEntries", "No entries in this category yet.")}</p>}
      </div>
    </div>
  );
}

function ReportScreen({ user, answers, documents, notify, language, t }) {
  const [editing, setEditing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const has = f => answers[f] && answers[f] !== "Skip";

  const downloadMedicalReport = async () => {
    setGeneratingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentBottom = pageHeight - 22;
      const lineHeight = size => size * 0.3528 * 1.35;
      let y = margin;

      const addPageIfNeeded = (height = lineHeight(10)) => {
        if (y + height > contentBottom) {
          pdf.addPage();
          y = margin;
        }
      };

      const addText = (value, { size = 10, bold = false, color = [18, 35, 31], gap = 0 } = {}) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(String(value ?? ""), pageWidth - margin * 2);
        const height = lineHeight(size);
        lines.forEach(line => {
          addPageIfNeeded(height);
          pdf.text(line, margin, y);
          y += height;
        });
        y += gap;
      };

      const addSection = (title, fields) => {
        addText(title, { size: 12, bold: true, color: [14, 110, 99], gap: 1 });
        fields.forEach(([label, value]) => addText(`${label}: ${value}`));
        y += 3;
      };

      const birthDate = user.dob ? new Date(`${user.dob}T00:00:00`) : null;
      let age = "—";
      if (birthDate && !Number.isNaN(birthDate.getTime())) {
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear()
          - (today.getMonth() < birthDate.getMonth()
            || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      }

      const notRecorded = t("report.notRecorded", "Not yet recorded.");
      const noneReported = t("report.noneReported", "None reported.");
      const optionalValue = field => has(field) ? answers[field] : notRecorded;
      const clinicalFields = [
        ["Chief Complaint", optionalValue("chiefComplaint")],
        ["Onset", answers.onset || "—"],
        ["Location", answers.location || "—"],
        ["Character", answers.character || "—"],
        ["Radiation", answers.radiation || "—"],
        ["Modifying factors", answers.modifying || "—"],
        ["Past medical history", answers.pastMedical || noneReported],
        ["Past surgical history", answers.surgical || noneReported],
        ["Family history", answers.family || noneReported],
        ["Personal history", `${answers.personal || "—"}${answers.lifestyle ? `. ${answers.lifestyle}` : ""}`],
        ["Allergies", answers.allergies || noneReported],
        ["Current medications", answers.medicines || noneReported],
        ["Breathing difficulty", answers.breathing || t("report.notAssessed", "Not assessed")],
        ["Other information", answers.additional || notRecorded],
      ];

      addText("MEDIKIOSK", { size: 18, bold: true, color: [14, 110, 99], gap: 1 });
      addText("AI Clinical Intake & Patient Record Intelligence", { size: 10, color: [91, 110, 105], gap: 5 });
      addText("Medical Report", { size: 16, bold: true, gap: 6 });
      addSection("Patient Information", [
        ["Patient Name", user.name || "—"],
        ["Age", age === "—" ? age : `${age} years`],
        ["Gender", user.gender || "—"],
        ["Date", new Date().toLocaleDateString(language)],
        ["Preferred language", getLanguageLabel(language)],
      ]);
      addSection("Clinical Information", clinicalFields);

      const extractedDocuments = documents.filter(document => document.extracted);
      addText("Previous Medical Documents", { size: 12, bold: true, color: [14, 110, 99], gap: 1 });
      if (extractedDocuments.length) {
        extractedDocuments.forEach(document => {
          addText(`${document.name} (${document.date})`, { bold: true });
          Object.entries(document.extracted).forEach(([label, value]) => addText(`${label}: ${value}`));
        });
      } else {
        addText(documents.length === 0
          ? t("report.noPreviousDocuments", "No previous documents uploaded.")
          : "No verified extracted information available.");
      }
      y += 3;

      const summary = clinicalFields
        .filter(([, value]) => value !== notRecorded && value !== noneReported && value !== "—")
        .map(([label, value]) => `${label}: ${value}`);
      addSection("Clinical Summary", [
        ["Summary", summary.length ? summary.join("; ") : "No consultation details have been recorded."],
      ]);
      addText("Review Status: Needs Doctor Verification", { size: 11, bold: true, color: [177, 105, 25], gap: 4 });

      const pageCount = pdf.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 130, 127);
        pdf.text(`Page ${page} of ${pageCount}`, pageWidth / 2, pageHeight - 9, { align: "center" });
      }

      const safeName = (user.name || "Patient")
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^\.+|\.+$/g, "") || "Patient";
      pdf.save(`MediKiosk_Medical_Report_${safeName}.pdf`);
    } catch (error) {
      console.error("Unable to generate medical report PDF:", error);
      notify(t("report.downloadFailed", "Unable to generate the medical report PDF."), "error");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: TEAL, letterSpacing: ".02em", marginBottom: 8 }}>{title.toUpperCase()}</div>
      <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.6 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ padding: 28, maxWidth: 780 }}>
      <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: 0 }}>{t("report.title", "Complete patient story")}</h1>
      <p style={{ fontSize: 13.5, color: SUB, margin: "4px 0 16px" }}>{t("report.subtitle", "AI-generated clinical history for physician review.")}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FDF3E7", border: `1px solid #F0D9AE`, borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
        <AlertTriangle size={16} color={AMBER} />
        <span style={{ fontSize: 12.5, color: "#7A5A1E", fontWeight: 600 }}>{t("report.banner", "AI-generated draft — physician verification required.")}</span>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 26 }}>
        <Section title={t("report.patientInfo", "Patient information")}>
          {user.name} · {user.gender || "—"} · {t("profile.preferredLanguage", "Preferred language")}: {getLanguageLabel(language)}
        </Section>
        <Section title={t("report.chiefComplaint", "Chief complaint")}>
          {has("chiefComplaint") ? answers.chiefComplaint : t("report.notRecorded", "Not yet recorded.")}
        </Section>
        <Section title={t("report.historyPresentIllness", "History of present illness")}>
          {t("report.onset", "Onset")}: {answers.onset || "—"} &nbsp;·&nbsp; {t("report.location", "Location")}: {answers.location || "—"} &nbsp;·&nbsp; {t("report.character", "Character")}: {answers.character || "—"}<br/>
          {t("report.radiates", "Radiates")}: {answers.radiation || "—"} &nbsp;·&nbsp; {t("report.modifying", "Modifying factors")}: {answers.modifying || "—"}
        </Section>
        <Section title={t("report.pastMedicalHistory", "Past medical history")}>{answers.pastMedical || t("report.noneReported", "None reported.")}</Section>
        <Section title={t("report.pastSurgicalHistory", "Past surgical history")}>{answers.surgical || t("report.noneReported", "None reported.")}</Section>
        <Section title={t("report.currentMedications", "Current medications")}>{answers.medicines || t("report.noneReported", "None reported.")}</Section>
        <Section title={t("report.allergies", "Allergies")}>{answers.allergies || t("report.noneReported", "None reported.")}</Section>
        <Section title={t("report.familyHistory", "Family history")}>{answers.family || t("report.noneReported", "None reported.")}</Section>
        <Section title={t("report.personalHistory", "Personal history")}>{answers.personal || "—"}. {answers.lifestyle || ""}</Section>
        <Section title={t("report.reviewOfSystems", "Review of systems")}>{t("report.breathingDifficulty", "Breathing difficulty")}: {answers.breathing || t("report.notAssessed", "Not assessed")}. {answers.additional || ""}</Section>
        <Section title={t("report.previousInvestigations", "Previous investigations")}>
          {documents.filter(d => d.extracted).map(d => (
            <div key={d.id} style={{ marginBottom: 6 }}>
              <strong>{d.name}</strong> ({d.date}): {Object.entries(d.extracted).map(([k, v]) => `${k} — ${v}`).join(", ")}
            </div>
          ))}
          {documents.length === 0 && t("report.noPreviousDocuments", "No previous documents uploaded.")}
        </Section>

        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: RED, letterSpacing: ".02em", marginBottom: 8 }}>{t("report.attentionTitle", "RED FLAG / ATTENTION ITEMS")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: RED_TINT, padding: "10px 14px", borderRadius: 8 }}>
            <ShieldAlert size={15} color={RED} />
            <span style={{ fontSize: 13, color: RED }}>
              {has("chiefComplaint") ? t("report.chestWarning", "Chest discomfort reported — requires physician review.") : t("report.noUrgentFindings", "No urgent findings flagged from the interview so far.")}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <GhostButton onClick={() => setEditing(e => !e)}><Edit3 size={14} /> {editing ? t("report.doneEditing", "Done editing") : t("report.editReport", "Edit report")}</GhostButton>
        <PrimaryButton onClick={() => { setConfirmed(true); notify(t("report.reportConfirmed", "Report confirmed for physician review."), "success"); }}>
          <Check size={15} /> {t("report.confirmReport", "Confirm report")}
        </PrimaryButton>
        <button type="button" disabled={generatingPdf} onClick={downloadMedicalReport}
          style={{ background: "#fff", color: INK, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, cursor: generatingPdf ? "not-allowed" : "pointer", opacity: generatingPdf ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Download size={14} /> {generatingPdf ? t("report.generatingPdf", "Generating PDF...") : t("report.downloadPdf", "Download PDF")}
        </button>
      </div>
      {confirmed && <p style={{ fontSize: 12.5, color: GREEN, marginTop: 10 }}>{t("report.confirmed", "Confirmed and ready to share with your doctor.")}</p>}
      {editing && <p style={{ fontSize: 12.5, color: SUB, marginTop: 10 }}>{t("report.prototypeNote", "Prototype note: full inline editing of each field will be enabled in the production build — for now, revisit the AI history chat to change answers.")}</p>}
    </div>
  );
}

function ProfileScreen({ user, setUser, notify, language, t }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("");

  const save = () => { setUser(form); setEditing(false); notify(t("profile.updated", "Profile updated."), "success"); };

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
          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: TEAL_TINT, padding: "2px 8px", borderRadius: 999, marginTop: 4, display: "inline-block" }}>{t("profile.patient", "Patient")}</span>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>{t("profile.title", "PERSONAL INFORMATION")}</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Row label={t("profile.fullName", "Full name")} field="name" />
          <Row label={t("profile.dateOfBirth", "Date of birth")} field="dob" />
          <Row label={t("profile.gender", "Gender")} field="gender" />
          <Row label={t("profile.phone", "Phone")} field="mobile" />
          <Row label={t("profile.email", "Email")} field="email" disabled />
          <Row label={t("profile.address", "Address")} field="address" />
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>{t("profile.healthcareTitle", "HEALTHCARE INFORMATION")}</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Row label={t("profile.abhaId", "ABHA ID")} field="abha" />
          <Row label={t("profile.bloodGroup", "Blood group")} field="bloodGroup" />
          <Row label={t("profile.emergencyContact", "Emergency contact")} field="emergencyContact" />
          <div>
            <label style={{ fontSize: 12, color: SUB, display: "block", marginBottom: 4 }}>{t("profile.preferredLanguage", "Preferred language")}</label>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{getLanguageLabel(language || "en")}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>{t("profile.consentTitle", "CONSENT")}</h4>
        {[t("profile.consentEntries.0", "Medical history consent"), t("profile.consentEntries.1", "Document processing consent"), t("profile.consentEntries.2", "Data sharing consent")].map(c => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
            <CheckCircle2 size={14} color={GREEN} /> {c}
          </div>
        ))}
      </div>

      {editing ? (
        <PrimaryButton onClick={save}><Check size={15} /> {t("profile.saveChanges", "Save changes")}</PrimaryButton>
      ) : (
        <GhostButton onClick={() => { setForm(user); setEditing(true); }}><Edit3 size={14} /> {t("profile.editProfile", "Edit profile")}</GhostButton>
      )}
    </div>
  );
}

function SettingsScreen({ language, setLanguage, notify, t }) {
  const [a11y, setA11y] = useState({ large: false, contrast: false, voice: true });
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} style={{ width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", background: on ? TEAL : "#D8DEDC", position: "relative" }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 21 : 3, transition: "left .15s" }} />
    </button>
  );
  return (
    <div style={{ padding: 28, maxWidth: 560 }}>
      <h1 className="mk-display" style={{ fontSize: 22, fontWeight: 600, color: INK, margin: "0 0 20px" }}>{t("settings.title", "Settings")}</h1>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>{t("settings.languageSection", "LANGUAGE")}</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLanguage(l.code); notify(`${t("settings.languageSet", "Language set to")} ${l.native}.`, "success"); }}
              style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${language === l.code ? TEAL : BORDER}`, background: language === l.code ? TEAL_TINT : "#fff", color: language === l.code ? TEAL : INK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {l.native}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>{t("settings.accessibilitySection", "ACCESSIBILITY")}</h4>
        {[["large", t("settings.largeText", "Large text")], ["contrast", t("settings.highContrast", "High contrast")], ["voice", t("settings.voiceAssistance", "Voice assistance")]].map(([k, label]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <span style={{ fontSize: 13.5, color: INK }}>{label}</span>
            <Toggle on={a11y[k]} onClick={() => setA11y(s => ({ ...s, [k]: !s[k] }))} />
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 12px" }}>{t("settings.privacySection", "PRIVACY")}</h4>
        <button onClick={() => notify(t("settings.showingConsent", "Showing your current consent record."), "info")} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "8px 0", fontSize: 13.5, color: INK, cursor: "pointer" }}>{t("settings.viewConsent", "View consent")}</button>
        <button onClick={() => notify(t("settings.withdrawnConsent", "Consent withdrawal noted for this prototype."), "info")} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "8px 0", fontSize: 13.5, color: RED, cursor: "pointer" }}>{t("settings.withdrawConsent", "Withdraw consent")}</button>
      </div>
    </div>
  );
}

function Footer({ t }) {
  return (
    <div style={{ padding: "14px 28px", borderTop: `1px solid ${BORDER}`, fontSize: 11.5, color: "#93A29D", background: "#fff" }}>
      {t("footer.disclaimer", "MediKiosk is a clinical intake and record organization prototype. It does not provide autonomous medical diagnosis. All information and AI-generated summaries must be reviewed by a qualified healthcare professional.")}
    </div>
  );
}

export default function MediKiosk() {
  const [stage, setStage] = useState("login");
  const [users, setUsers] = useState([DEMO_USER]);
  const [user, setUser] = useState(null);
  const [language, setLanguageValue] = useState("en");
  const [screen, setScreen] = useState("dashboard");
  const [documents, setDocuments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [qIndex, setQIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = getStoredLanguage();
      if (savedLanguage && LOCALES[savedLanguage]) {
        setLanguageValue(savedLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const t = (key, fallback = key) => safeTranslate(language, key, fallback);

  const setLanguage = (code) => {
    if (LOCALES[code]) setLanguageValue(code);
  };

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (u, isDemo) => {
    setUser(u);
    if (isDemo) { setDocuments(DEMO_DOCS); notify(t("auth.signedInDemo", "Signed in as demo patient."), "success"); }
    else notify(`${t("auth.welcomeBackName", "Welcome back")}, ${u.name.split(" ")[0]}.`, "success");
    setStage("consent");
  };

  const handleRegister = (form) => {
    setUsers(u => [...u, { ...form, name: form.name }]);
    notify(t("auth.accountCreated", "Account created. Please sign in."), "success");
    setStage("login");
  };

  const handleConsent = () => setStage("language");
  const handleDecline = () => notify(t("consent.consentRequired", "Consent is required to continue."), "error");
  const handleLanguage = (code) => { setLanguage(code); setStage("app"); setScreen("dashboard"); };

  const logout = () => {
    setStage("login"); setUser(null); setScreen("dashboard");
    setAnswers({}); setQIndex(0); setMessages([]); setDocuments([]);
    notify(t("common.logout", "Signed out."), "info");
  };

  const interviewQuestions = getLocalizedQuestions(language);
  const chatDone = qIndex >= interviewQuestions.length;
  const progressPct = Math.round((3 + (chatDone ? 1 : 0) + (documents.length > 0 ? 1 : 0) + (chatDone && documents.length > 0 ? 1 : 0)) / 6 * 100);

  return (
    <div className="mk-body" style={{ background: BG, minHeight: "100vh" }}>
      {FONT}
      <Toast {...toast} onClose={() => setToast(null)} />

      {stage === "login" && (
        <AuthLayout t={t}><LoginScreen users={users} onLogin={handleLogin} onGoRegister={() => setStage("register")} notify={notify} t={t} /></AuthLayout>
      )}
      {stage === "register" && (
        <AuthLayout t={t}><RegisterScreen onRegister={handleRegister} onGoLogin={() => setStage("login")} t={t} /></AuthLayout>
      )}
      {stage === "consent" && <ConsentScreen onAccept={handleConsent} onDecline={handleDecline} t={t} />}
      {stage === "language" && <LanguageScreen onContinue={handleLanguage} language={language} t={t} />}

      {stage === "app" && user && (
        <div style={{ display: "flex" }}>
          <Sidebar screen={screen} setScreen={setScreen} onLogout={logout} t={t} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <TopBar title={getNavItems(t).find(n => n.key === screen)?.label || ""} user={user} language={language} setLanguage={setLanguage} t={t} />
            <div style={{ flex: 1 }}>
              {screen === "dashboard" && <Dashboard user={user} setScreen={setScreen} chatDone={chatDone} docsCount={documents.length} progressPct={progressPct} language={language} t={t} />}
              {screen === "chat" && (
                <ChatScreen user={user} language={language} answers={answers} setAnswers={setAnswers}
                  qIndex={qIndex} setQIndex={setQIndex} messages={messages} setMessages={setMessages}
                  onFinish={() => setScreen("upload")} t={t} />
              )}
              {screen === "upload" && <UploadScreen documents={documents} setDocuments={setDocuments} notify={notify} language={language} t={t} />}
              {screen === "timeline" && <TimelineScreen events={documents.length ? TIMELINE_SEED : TIMELINE_SEED.slice(2)} language={language} t={t} />}
              {screen === "report" && <ReportScreen user={user} answers={answers} documents={documents} notify={notify} language={language} t={t} />}
              {screen === "profile" && <ProfileScreen user={user} setUser={setUser} notify={notify} language={language} t={t} />}
              {screen === "settings" && <SettingsScreen language={language} setLanguage={setLanguage} notify={notify} t={t} />}
            </div>
            <Footer t={t} />
          </div>
        </div>
      )}
    </div>
  );
}