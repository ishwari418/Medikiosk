# MediKiosk
### AI Clinical Intake & Patient Record Intelligence

**Smart India Hackathon 2026 — Problem Statement 26047**
"Patient Case-Taking Software" · Ministry of Ayush · Theme: MedTech / BioTech / HealthTech
**Team:** MediNova (Team ID: 2042FB)

---

## 1. Overview

MediKiosk is a clinical intake and patient-record organization tool. Before a patient
ever sees a doctor, MediKiosk walks them through a structured, conversational medical
history (in their own words, by typing or speaking), lets them upload their existing
medical documents (prescriptions, lab reports, discharge summaries), and fuses both
into a single, doctor-ready draft history — organized the way a clinician actually
reads a case: chief complaint, history of present illness, past medical/surgical
history, medications, allergies, family history, and a timeline of prior records.

The core idea the product communicates, visually and functionally, is:

```
Patient Conversation  +  Previous Medical Documents
              │
              ▼
      Patient Data Fusion
              │
              ▼
       Medical Timeline
              │
              ▼
      Clinical Summary
              │
              ▼
       Doctor Review
```

**"Two AI pipelines → one complete patient story."**

MediKiosk does **not** diagnose. Every generated report is explicitly labeled a draft
requiring physician verification — see [Section 9, Safety & Disclaimers](#9-safety--disclaimers).

---

## 2. Problem it addresses

Patients arriving for consultation typically explain their symptoms verbally, often
incompletely, while carrying loose paper records (prior prescriptions, lab reports,
discharge summaries) that rarely get reviewed systematically before the consult. This
costs clinician time and risks missed context. MediKiosk's prototype demonstrates a
kiosk/app-based intake step that:

1. Collects a structured history directly from the patient before the appointment.
2. Digitizes and organizes previously scattered paper/PDF records.
3. Combines both into one chronological, physician-reviewable document.

---

## 3. Feature walkthrough (screen by screen)

| # | Screen | What it does |
|---|--------|---------------|
| 1 | **Login** | Email/mobile + password sign-in, show/hide password, "Remember me," a "Forgot password" info modal (prototype-only), and a one-click **Demo Login** pre-loaded with a sample patient for judges. |
| 2 | **Register** | Full name, email, mobile, DOB, gender, password + confirmation, optional ABHA ID, Terms consent checkbox. Full field validation. |
| 3 | **Consent** | Explains what data is collected (medical history, voice, documents, health summary) with individual toggles, a mock "listen to explanation" audio button, and an explicit Accept/Decline gate before any data collection continues. |
| 4 | **Language selection** | English (fully polished), Hindi, Marathi, Gujarati (translated labels; English remains the primary functional experience, honestly represented as such — no pretend multilingual AI). |
| 5 | **Dashboard** | Bento-style overview: a hero "Start medical history" card, a live patient-profile completion tracker, and cards for document upload, report review, and timeline. |
| 6 | **AI History Chat** | A structured, section-by-section interview (Chief Complaint → HPI → Past Medical/Surgical History → Medications → Allergies → Family History → Personal History → Review of Systems) via text input, quick-reply buttons, or a simulated mic ("Listening…" → auto-filled sample response). Live progress bar ("Question 7 of 15"). |
| 7 | **Document Upload** | Drag-and-drop or file-picker upload (PDF/JPG/PNG), a simulated "Analyzing document… → Processed" pipeline, and a mock extracted-fields view (diagnosis, medicines, doctor, lab values) per document. View/remove per document. |
| 8 | **Patient Timeline** | Chronological, filterable (All / Diagnoses / Medicines / Lab Reports / Visits) view combining chat-derived events and uploaded documents. |
| 9 | **Medical Report** | The main output: a doctor-ready draft assembled from the interview + document extractions, with a prominent "AI-generated draft — physician verification required" banner and a Red-Flag/Attention-Items callout. Edit / Confirm / Download (PDF stub) actions. |
| 10 | **Profile** | Editable personal + healthcare info (ABHA ID, blood group, emergency contact, preferred language) and a read-only consent summary. |
| 11 | **Settings** | Language switcher, accessibility toggles (large text, high contrast, voice assistance), and privacy controls (view/withdraw consent). |
| 12 | **Logout** | Clears the active session and in-progress interview/documents; **keeps registered accounts** so the same or another judge can log back in. |

A persistent footer disclaimer is shown throughout the authenticated app (see
[Section 9](#9-safety--disclaimers)).

---

## 4. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI library | React 18 |
| Icons | lucide-react |
| Styling | Inline styles implementing a custom design system (color tokens, type scale); Tailwind CSS is configured and available if you want to extend with utility classes, but the app doesn't depend on it to render correctly |
| State | React hooks (`useState`, `useEffect`) |
| Persistence | Browser `localStorage` (single key, see [Section 7](#7-data--persistence)) — no backend, no database |
| Language | JavaScript (JSX) |

---

## 5. Project structure

```
mediKiosk-prototype/
├── app/
│   ├── layout.js        # Root HTML shell + page metadata
│   ├── page.js          # Renders <MediKiosk />
│   └── globals.css      # Tailwind directives + minimal resets
├── components/
│   └── MediKiosk.jsx    # The entire application: every screen and all logic
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── .gitignore
└── README.md
```

The whole app is intentionally kept in one component file. For a hackathon prototype
this keeps it easy to read top-to-bottom and easy to hand off; it's straightforward to
split into per-route files later (`app/login/page.js`, `app/dashboard/page.js`, etc.)
if the team wants real Next.js routing per screen for a production build.

---

## 6. Data & persistence

All prototype data is stored under a single `localStorage` key: **`medikiosk_v1`**.
It holds:

- Registered user accounts
- The active login session
- Uploaded documents (and their mock extracted fields)
- AI-history chat answers and interview progress
- Selected language and current screen

Because of this:

- Refreshing the browser keeps you logged in and keeps your data.
- **Logout** clears the active session and the current patient's in-progress
  interview/documents, but keeps registered accounts intact.
- To fully reset the prototype (wipe everything, including registered accounts), open
  the browser DevTools console on the page and run:
  ```js
  localStorage.removeItem("medikiosk_v1");
  ```
  then refresh.

No data ever leaves the browser — there is no server to send it to.

---

## 7. What's real vs. simulated

| Feature | Status |
|---|---|
| Login / registration / demo login | Real, persisted to `localStorage` |
| Consent capture | Real |
| Language selection | Real UI switch; only English has full interface coverage |
| AI history interview | Scripted question tree — not a live LLM |
| Voice input | Simulated: mic button shows "Listening…" then inserts a canned sample answer — no real speech recognition |
| Document upload | Real file selection / drag-and-drop; "processing" and "extracted information" are simulated, not real OCR |
| Medical report generation | Assembled locally from your chat answers + mock document data — not generated by an AI model, and never presented as a diagnosis |
| Timeline | Seeded sample events plus whatever you add via chat/upload |

---

## 8. Safety & disclaimers

MediKiosk is **not** a diagnostic tool. This is enforced in the UI, not just in this
document:

- The Medical Report screen always shows: *"AI-generated draft — physician
  verification required."*
- No screen presents an AI-generated diagnosis.
- A persistent footer disclaimer reads: *"MediKiosk is a clinical intake and record
  organization prototype. It does not provide autonomous medical diagnosis. All
  information and AI-generated summaries must be reviewed by a qualified healthcare
  professional."*

---

## 9. Requirements

- Node.js 18.18 or newer (Node 20 LTS recommended)
- npm (bundled with Node)

Check your version:
```bash
node -v
```

---

## 10. Running the project

1. Unzip the project and open a terminal in the folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open **http://localhost:3000**.

For a production build (faster, good for the actual demo day):
```bash
npm run build
npm run start
```
Then open **http://localhost:3000** as usual.

### Demo login (for judges)

On the Login screen, click **"Demo login for judges"**. It signs in as a pre-filled
sample patient (Ishwari Sharma) with sample documents already attached, so the
dashboard, timeline, and report aren't empty during a live demo — no credentials
needed.

To use your own account instead: fill out Register, then sign in with that email and
password on Login.

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `Module not found: lucide-react` | Run `npm install` again — it's listed under dependencies in `package.json`. |
| Port 3000 already in use | Run `npm run dev -- -p 3001` and open that port instead. |
| Styles look unstyled/plain | Confirm `app/globals.css` is imported in `app/layout.js` (it is, by default), and that `npm install` completed before `npm run dev`. |
| Old/inconsistent data while testing | Clear `localStorage` (see [Section 7](#7-data--persistence)) and refresh. |

---

## 12. Roadmap (beyond this prototype)

Not implemented here, but the natural next steps for a production build:

- Replace scripted chat with a real conversational model, with clinician-defined
  question banks per specialty.
- Replace mock document extraction with real OCR + structured-data extraction,
  reviewed against ABDM/FHIR record formats.
- Real speech-to-text for voice input, with support for regional languages end to end.
- A backend + database (replacing `localStorage`) with proper authentication and
  encryption for health data at rest and in transit.
- A physician-facing review/edit interface with audit history on report changes.
<<<<<<< HEAD
- Real PDF export/print of the confirmed report.
=======
- Real PDF export/print of the confirmed report.
>>>>>>> c44784c (Added multilingual added)
