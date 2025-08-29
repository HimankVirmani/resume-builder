# Resume Builder Backend

Express API for saving resumes, generating PDFs, and (optionally) enhancing text via an LLM.

## Setup

```bash
cd backend
cp .env.example .env   # optionally add OPENAI_API_KEY
npm install
npm run start
```
API runs on `http://localhost:4000` by default.

## Endpoints

- `POST /api/resumes` body: resume JSON -> `{ id, resume }`
- `PUT /api/resumes/:id` body: resume JSON -> `{ id, resume }`
- `GET /api/resumes/:id` -> resume JSON
- `GET /api/resumes/:id/pdf` -> PDF download
- `POST /api/enhance` body: `{ text, role }` -> `{ improved }`
