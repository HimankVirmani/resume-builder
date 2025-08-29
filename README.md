# Full-Stack Resume Builder (React + Node.js)

Features:
- Create, edit, and save resumes (server stores JSON by ID).
- Generate downloadable PDF following a clean, industry-standard layout (server-side via PDFKit).
- Sections: Personal Info, Summary, Experience, Projects, Education, Skills.
- Re-open and edit later using your resume ID.
- "Enhance" button for Experience/Projects using an LLM (uses OpenAI if `OPENAI_API_KEY` is set; otherwise a decent offline improver).

## Quick Start

### 1) Backend
```bash
cd backend
cp .env.example .env   # add OPENAI_API_KEY optionally
npm install
npm run start
```

### 2) Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173

## Notes
- PDF downloads from `GET /api/resumes/:id/pdf` (save first to get an ID).
- Data is stored as JSON files under `backend/data/`. For production, swap with a DB easily.
- No error-prone exotic tooling; minimal dependencies to keep it stable.
