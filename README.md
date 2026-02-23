
# OptiProcure: AI-Powered B2B Procurement System



OptiProcure is a full-stack enterprise application built with the **MERN stack** (MongoDB, Express, React, Node) and integrated with **Google Gemini AI**. It automates the Request for Proposal (RFP) lifecycle by transforming unstructured natural language into structured, actionable business data.

---

## 🚀 The Core Problem & Solution
Manual procurement is slow. Managers spend hours drafting RFPs and manually comparing messy vendor emails.
* **OptiProcure** uses an "Invisible AI" pattern: The user provides a simple prompt, and the system generates a structured RFP, sends it to vendors, parses their replies, and evaluates the best bid—all within a single dashboard.

## ✨ Technical Highlights
* **Deterministic AI Parsing:** Engineered a backend pipeline that forces the Gemini LLM to return strict JSON schemas, allowing natural language to be reliably saved into MongoDB.
* **Automated Bid Evaluation:** Implemented a logic engine that compares multiple vendor proposals against original budgets, returning ranked scores and pros/cons.
* **Secure Communications:** Integrated Nodemailer with secure SMTP protocols for automated distribution to vendor directories.
* **Modern UX/UI:** Developed a stateful React frontend using Tailwind CSS, featuring glassmorphism design, dynamic dashboard filtering, and real-time notifications via React Hot Toast.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Lucide Icons, Vite
* **Backend:** Node.js, Express.js
* **AI:** Google Gemini AI (Generative AI SDK)
* **Database:** MongoDB & Mongoose ODM
* **Email:** Nodemailer (SMTP Integration)

## 📂 Project Structure
```text
├── client/          # React + Tailwind frontend
├── server/          # Node.js + Express + Gemini AI backend
│   ├── models/      # Mongoose Schemas (RFP, Vendor, Proposal)
│   └── server.js    # API Routes and AI logic
├── .gitignore       # Root-level security gatekeeper
└── .env.example     # Environment variable template
