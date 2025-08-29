import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Helpers
const filePathFor = (id) => path.join(DATA_DIR, `${id}.json`);

function saveResume(id, data) {
  fs.writeFileSync(filePathFor(id), JSON.stringify(data, null, 2));
}

function loadResume(id) {
  const p = filePathFor(id);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Routes
app.post('/api/resumes', (req, res) => {
  const id = uuidv4();
  const resume = { id, ...req.body, updatedAt: new Date().toISOString() };
  saveResume(id, resume);
  res.status(201).json({ id, resume });
});

app.put('/api/resumes/:id', (req, res) => {
  const { id } = req.params;
  const existing = loadResume(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = { ...existing, ...req.body, id, updatedAt: new Date().toISOString() };
  saveResume(id, updated);
  res.json({ id, resume: updated });
});

app.get('/api/resumes/:id', (req, res) => {
  const { id } = req.params;
  const resume = loadResume(id);
  if (!resume) return res.status(404).json({ error: 'Not found' });
  res.json(resume);
});

// LLM enhancement (optional)
app.post('/api/enhance', async (req, res) => {
  const { text, role = 'software engineer' } = req.body || {};
  const key = process.env.OPENAI_API_KEY;
  if (!text) return res.status(400).json({ error: 'Missing text' });

  // Fallback simple enhancer if no key
  if (!key) {
    const improved = text
      .split(/\n+/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s[0].toUpperCase() + s.slice(1))
      .map(s => s.replace(/\.$/, ''))
      .map(s => s + ' — delivered measurable impact.')
      .join('\n');
    return res.json({ improved, provider: 'built-in', note: 'Set OPENAI_API_KEY for better results.' });
  }

  try {
    // Use OpenAI Responses API (compatible with official SDK or fetch). We avoid adding SDK dependency here.
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: `Improve these resume bullets for a ${role}. Keep them crisp, results-oriented, first person omitted, use strong action verbs, no pronouns, 1-2 lines each. Input:\n${text}`
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'LLM request failed', details: errText });
    }
    const data = await response.json();
    const improved = data.output_text || data.content?.[0]?.text || text;
    res.json({ improved, provider: 'openai' });
  } catch (e) {
    res.status(500).json({ error: 'LLM error', details: e.message });
  }
});

// PDF generation
app.get('/api/resumes/:id/pdf', (req, res) => {
  const { id } = req.params;
  const resume = loadResume(id);
  if (!resume) return res.status(404).json({ error: 'Not found' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="resume-${id}.pdf"`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  const accent = '#0f172a'; // slate-900-ish

  // Header
  doc
    .fillColor(accent).fontSize(22).text(resume.personal?.fullName || 'Your Name', { continued: false })
    .moveDown(0.3);
  doc
    .fontSize(10).fillColor('black')
    .text([resume.personal?.email, resume.personal?.phone, resume.personal?.location, resume.personal?.website].filter(Boolean).join(' • '));

  const section = (title) => {
    doc.moveDown(0.8);
    doc.fillColor(accent).fontSize(12).text(title.toUpperCase());
    doc.moveTo(doc.x, doc.y + 2).lineTo(550, doc.y + 2).strokeColor(accent).lineWidth(0.5).stroke();
    doc.moveDown(0.3);
    doc.fillColor('black');
  };

  if (resume.summary) {
    section('Professional Summary');
    doc.fontSize(10).text(resume.summary);
  }

  if (resume.experience?.length) {
    section('Experience');
    resume.experience.forEach(exp => {
      doc.fontSize(11).fillColor('black').text(`${exp.role || ''} — ${exp.company || ''}`, { continued: true })
      doc.fontSize(10).fillColor('gray').text(`  ${exp.start || ''} - ${exp.end || 'Present'}`);
      if (exp.location) doc.fontSize(10).text(exp.location);
      if (exp.bullets) {
        doc.moveDown(0.2);
        exp.bullets.split(/\n+/).forEach(b => {
          if (b.trim()) doc.fontSize(10).text('• ' + b.trim());
        });
      }
      doc.moveDown(0.4);
    });
  }

  if (resume.projects?.length) {
    section('Projects');
    resume.projects.forEach(p => {
      doc.fontSize(11).text(p.name || 'Project', { continued: true }).fontSize(10).fillColor('gray').text(p.link ? `  ${p.link}` : '');
      doc.fillColor('black').fontSize(10).text(p.description || '');
      doc.moveDown(0.3);
    });
  }

  if (resume.education?.length) {
    section('Education');
    resume.education.forEach(ed => {
      doc.fontSize(11).text(`${ed.degree || ''} — ${ed.school || ''}`, { continued: true })
      doc.fontSize(10).fillColor('gray').text(`  ${ed.start || ''} - ${ed.end || ''}`);
      doc.fillColor('black');
      if (ed.details) doc.fontSize(10).text(ed.details);
      doc.moveDown(0.3);
    });
  }

  if (resume.skills) {
    section('Skills');
    doc.fontSize(10).text(resume.skills);
  }

  doc.end();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Resume Builder API' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
