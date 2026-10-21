# 🌌 AI-Powered Smart Code Translator & Assistant

An elite, full-stack MERN utility designed for developers. It leverages the high-performance **Groq Qwen 3.8 27B** (`qwen/qwen3.8-27b`) engine via `groq-sdk` to translate, optimize, analyze, and explain code within a premium, high-performance monochrome workspace.

Developed with React 19, Node.js, Express, and MongoDB, this application integrates full token-based JWT security, Google OAuth Single Sign-On (SSO) with direct avatar rendering, pixel-perfect Monaco Editors, an asynchronous BullMQ job queue with real-time SSE streaming, an ephemeral isolated sandbox runner, a closed-loop compiler self-healing verification agent, and robust historical log tracking.

---

## ✨ Features

- **🚀 AI Workspace Dashboard:** A split-screen, distraction-free environment utilizing high-fidelity Monaco coding panes.
- **🔄 Asynchronous Job Queue:** Dual-mode async translation queue powered by BullMQ and Redis with automatic in-memory fallback, decoupling request intake from intensive compilation tasks.
- **📡 Real-Time SSE Event Streaming:** Live Server-Sent Events (`/api/code/jobs/:jobId/events`) streaming step-by-step progress, stages, and terminal logs directly to the frontend.
- **📦 Ephemeral Isolated Sandbox Runner:** Secure, process-isolated subprocess execution environment enforcing an 8-second execution timeout, 128MB memory boundaries, sanitized environment variables (preventing credential leakage), and automatic temporary directory cleanup.
- **🔁 Closed-Loop Self-Healing Agent:** Automated test harness generator synthesizing unit assertions in the target language. If execution or assertions fail, compiler stderr is fed into Qwen 3.8 27B for up to 3 iterative self-repair cycles.
- **📊 Persistent Verification Pipeline Banner:** A 6-stage Zinc Monochrome stepper (Queue → Translate → Test Harness → Sandbox Run → Self-Healing → Verified) that stays visible across the top even after successful compilation with expandable sandbox execution logs.
- **🧠 Workspace State Memory:** Automatic `localStorage` session persistence (`code_translator_workspace`) ensuring user code, language selections, action states, and compiled results are preserved across route transitions to History and page refreshes.
- **📐 Draggable Split Panes:** High-performance, custom-built mouse draggable columns, enabling developers to fluidly resize left/right workspaces based on current focus.
- **🌓 Sleek Monochrome Theme Switcher:** Instant transition between Vercel-style Pitch Black/Zinc dark mode and high-contrast Light mode, fully integrated with Monaco Theme states (`vs-dark` / `vs`)!
- **⚔️ Monaco Visual Diff Viewer:** Built-in side-by-side code diff comparison panel. A quick header toggle switches the output pane to compare original and compiled/optimized code natively!
- **📥 Local File Picker & Drag-Drop Script Uploader:** Select files locally or drop them directly onto the editor. It auto-parses scripts and auto-detects programming languages based on file extensions.
- **💾 Local Script Downloader:** Instantly download translated or optimized output files as native scripts matching their target programming extension!
- **✨ Core AI Assistant Actions:**
  - **Translate:** Flawless logic, formatting, and signature translations across multiple languages (Python, JavaScript, TypeScript, Java, C, C++, C#) with sandbox verification.
  - **Complexity Analysis:** Deep algorithmic analysis computing Big O Time and Space complexities alongside bulletproof structural rationale.
  - **Performance Optimization:** Elite performance-tuning refactoring to reduce memory footprint and execution times.
  - **Step-by-Step Explanation:** Clear, patient technical breakdown of lines and paradigms for developers.
- **🔒 Session & Identity Control:** Standard email/password registrations secured with standard bcrypt hashes, side-by-side with verified Google OAuth SSO endpoints and avatar rendering.
- **🛡️ Endpoint Rate Limiting:** Built-in security shielding via `express-rate-limit` guarding sensitive auth routes and AI compilation endpoints from brute-forcing or automated bot spams.
- **📜 Incremental Log Pagination:** Database-level pagination on `/api/history` using Mongoose offsets, backed by an incremental "Load More Logs" list scrolling system on the client.
- **⚡ Automated Server Keep-Alive:** Includes a `/health` endpoint and pre-configured GitHub Actions `cron` workflow to prevent free-tier cloud platforms (like Render) from sleeping during inactivity.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite (Fast Builds)
- **Editor:** Monaco Editor (`@monaco-editor/react`) + Visual `DiffEditor`
- **Routing:** React Router DOM v6
- **Streaming:** Native `EventSource` (SSE client)
- **State Persistence:** LocalStorage Workspace Memory & Action Cache
- **HTTP Client:** Axios (automatic JWT token interceptors)
- **Aesthetics & Alerts:** Custom Zinc Monochrome Design System, CSS Variables, and React Hot Toast

### Backend
- **Runtime:** Node.js (ES Modules syntax)
- **Framework:** Express.js v5
- **Database:** MongoDB via Mongoose ODM
- **Queue & Workers:** BullMQ + ioredis (with in-memory fallback runner)
- **Execution Sandbox:** Node.js `child_process.spawn` with process isolation, strict timeouts, buffer caps, and memory constraints
- **GenAI Client:** Official Groq SDK (`groq-sdk` model `qwen/qwen3.8-27b` - Qwen 3.8 27B)
- **Security:** `express-rate-limit` (quota protection), `jsonwebtoken` (JWT signatures), `bcryptjs`, `google-auth-library` (Google SSO validations)

---

## 📂 Project Structure

```
├── client/                     # Frontend React Workspace
│   ├── src/
│   │   ├── components/         # ProtectedRoute, Navbar, CodeEditor, OutputPanel, CustomSelect, VerificationPipeline
│   │   ├── context/            # AuthContext, ThemeContext (Global states)
│   │   ├── pages/              # LoginPage, HomePage, HistoryPage
│   │   ├── services/           # api.js, codeService.js, historyService.js
│   │   ├── styles/             # home.css, output.css, history.css, navbar.css, login.css, verification.css
│   │   └── constants/          # language.js (Select templates and bindings)
│   └── index.html
└── server/                     # Backend API Service Workspace
    ├── src/
    │   ├── config/             # db.config.js, google.config.js, groq.config.js, redis.config.js
    │   ├── queue/              # translation.queue.js (BullMQ / In-Memory worker queue)
    │   ├── services/           # gemini.service.js, history.service.js, sandbox.service.js, verification.service.js
    │   ├── models/             # User.model.js, History.model.js
    │   ├── controllers/        # auth.controller.js, code.controller.js, history.controller.js
    │   ├── routes/             # auth.routes.js, code.routes.js, history.routes.js
    │   ├── middleware/         # auth.middleware.js, error.middleware.js, rateLimit.middleware.js
    │   └── worker.js           # Background job execution worker
    └── server.js               # Server Initialization & Worker Boot
└── .github/
    └── workflows/
        └── keep-alive.yml      # GitHub Actions cron job for pinging the /health endpoint
```

---

## ⚙️ Environment Variables Config

### 1. Server Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signature_key_phrase
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GROQ_API_KEY=your_groq_api_key_here

# Optional: External Redis (Falls back gracefully to in-memory queue if omitted)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 2. Client Configuration
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

---

## 🏁 Getting Started (Local Run)

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- MongoDB running locally or a MongoDB Atlas Cloud Cluster
- Redis (optional — falls back automatically to in-memory worker queue)

### Steps

#### 1. Setup the Database & API Service (Server)
From the root directory:
```bash
cd server
npm install
npm run dev
```
The server will boot on `http://localhost:5000`, connect to MongoDB, and register the translation queue worker.

#### 2. Setup the Workstation Interface (Client)
From the root directory:
```bash
cd client
npm install
npm run dev
```
The browser interface will spin up on `http://localhost:5173`. 

---

## 🔒 Security Best Practices

1. **Hidden Configurations:** Local `.env` files are fully excluded in `.gitignore` on both client and server layers to secure private secrets.
2. **Authorized Origins:** Make sure to whitelist `http://localhost:5173` inside the **Authorized JavaScript Origins** panel in the Google Cloud Credentials Console to avoid OAuth `no registered origin` error codes.
3. **Endpoint Shielding:** Built-in rate limiting restricts compilation routes to 20 requests per 15 minutes per IP, and auth routes to 30 requests per 15 minutes to guarantee API stability.
4. **Subprocess Isolation:** Test executions in the sandbox strip all ambient credentials and environment variables, enforcing an 8-second max execution time and 128MB memory ceiling.

---

Enjoy your high-fidelity, monochrome AI-powered developer workstation! 🌌🌟