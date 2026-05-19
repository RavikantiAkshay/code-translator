# 🌌 AI-Powered Smart Code Translator & Assistant

An elite, full-stack MERN utility designed for developers. It leverages the high-performance **Groq Llama-3.3-70b-versatile** engine (`groq-sdk`) to translate, optimize, analyze, and explain code within a premium, high-performance monochrome workspace.

Developed with React 19, Node.js, Express, and MongoDB, this application integrates full token-based JWT security, Google OAuth Single Sign-On (SSO), pixel-perfect Monaco Editors, and robust historical log tracking.

---

## ✨ Features

- **🚀 AI Workspace Dashboard:** A split-screen, distraction-free environment utilizing high-fidelity Monaco coding panes.
- **✨ Core AI Assistant Engines:**
  - **Translate:** Flawless logic, format, and signature translations across multiple languages.
  - **Complexity Analysis:** Deep algorithmic analysis computing Big O Time and Space complexities alongside bulletproof structural rationale.
  - **Performance Optimization:** Elite performance-tuning refactoring to reduce memory footprint and execution times.
  - **Step-by-Step Explanation:** Clear, patient technical breakdown of lines and paradigms for beginners.
- **🔒 Session & Identity Control:** Standard email/password registrations secured with standard bcrypt hashes, side-by-side with verified Google OAuth SSO endpoints.
- **🛡️ Request Isolation & Safety Middlewares:** Complete JWT authorization middlewares caching tokens and protecting API scopes.
- **📜 Transactional Logger (History):** A beautiful log viewer displaying cards of past queries with side-by-side expanded input/output editors, single record flushes, and full database clears.
- **🎨 Elite Monochrome UI:** A stunning, state-of-the-art Vercel-like dark theme utilizing strict shades of black, zinc-950, deep charcoal, and glowing white active highlights.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite (Fast Builds)
- **Editor:** Monaco Editor (`@monaco-editor/react`)
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios (automatic JWT token interceptors)
- **Aesthetics & Alerts:** Vanilla CSS variables + React Hot Toast notifications

### Backend
- **Runtime:** Node.js (ES Modules syntax)
- **Framework:** Express.js v5
- **Database:** MongoDB via Mongoose ODM
- **GenAI Client:** Official Groq SDK (`groq-sdk` model `llama-3.3-70b-versatile`)
- **Security:** `jsonwebtoken` (JWT signatures), `bcryptjs`, `google-auth-library` (Google SSO validations)

---

## 📂 Project Structure

```
├── client/                 # Frontend React Workspace
│   ├── src/
│   │   ├── components/     # ProtectedRoute, Navbar, CodeEditor, OutputPanel
│   │   ├── context/        # AuthContext (Identity states)
│   │   ├── pages/          # LoginPage, HomePage, HistoryPage
│   │   ├── services/       # api.js, codeService.js, historyService.js
│   │   ├── styles/         # home.css, output.css, history.css, navbar.css, login.css
│   │   └── constants/      # language.js (Select templates and bindings)
│   └── index.html
└── server/                 # Backend API Service Workspace
    ├── src/
    │   ├── config/         # db.config.js, google.config.js, gemini.config.js
    │   ├── models/         # User.model.js, History.model.js
    │   ├── services/       # gemini.service.js, history.service.js
    │   ├── controllers/    # auth.controller.js, code.controller.js, history.controller.js
    │   ├── routes/         # auth.routes.js, code.routes.js, history.routes.js
    │   └── middleware/     # auth.middleware.js, error.middleware.js
    └── server.js           # Server Initialization Entry point
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

### Steps

#### 1. Setup the Database & API Service (Server)
From the root directory:
```bash
cd server
npm install
npm run dev
```
The server will boot on `http://localhost:5000`.

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

---

Enjoy your high-fidelity, monochrome AI-powered developer workstation! 🌌🌟