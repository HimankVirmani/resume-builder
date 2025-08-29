import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import ResumeForm from '../components/ResumeForm'
import Preview from '../components/Preview'
import { createResume, getResume, updateResume, downloadPdf } from '../api'

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(()=>{
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : initial
  })
  useEffect(()=>localStorage.setItem(key, JSON.stringify(val)), [key,val])
  return [val, setVal]
}

const emptyResume = {
  personal: { fullName:'', title:'', email:'', phone:'', location:'', website:'' },
  summary: '',
  experience: [],
  projects: [],
  education: [],
  skills: ''
}

function EditorPage() {
  const [resume, setResume] = useLocalStorage('resume', emptyResume)
  const [saveId, setSaveId] = useLocalStorage('resume_id', '')
  const [status, setStatus] = useState('')

  const save = async () => {
    setStatus('Saving...')
    try {
      if (saveId) {
        await updateResume(saveId, resume)
      } else {
        const res = await createResume(resume)
        setSaveId(res.id)
      }
      setStatus('Saved ✅')
    } catch (e) {
      setStatus('Save failed ❌')
    }
  }

  const load = async () => {
    if (!saveId) return
    setStatus('Loading...')
    try {
      const data = await getResume(saveId)
      setResume(data)
      setStatus('Loaded ✅')
    } catch (e) {
      setStatus('Load failed ❌')
    }
  }

  const download = () => {
    if (!saveId) { alert('Save first to get a resume ID.'); return; }
    downloadPdf(saveId)
  }

  return (
    <div className="container">
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <h1>Resume Builder</h1>
        <nav className="actions">
          <button><Link to="/preview" className="btn">Preview</Link></button>
          <button className="btn secondary" onClick={save}>Save</button>
          <button onClick={download}>Download PDF</button>
        </nav>
      </header>

      <div className="card" style={{marginBottom:12}}>
        <div className="row">
          <div className="col-6">
            <label>Your Resume ID (for later edits)</label>
            <input value={saveId} onChange={e=>setSaveId(e.target.value)} />
            <div className="small">Store this ID safely to load your resume later.</div>
          </div>
          <div className="col-6" style={{display:'flex', alignItems:'end', gap:8}}>
            <button onClick={load}>Load by ID</button>
            <button onClick={()=>{ setResume(emptyResume); setSaveId(''); }}>New</button>
          </div>
        </div>
        <div className="small" style={{marginTop:8}}>{status}</div>
      </div>

      <ResumeForm value={resume} onChange={setResume} />
    </div>
  )
}

function PreviewPage() {
  const [resume] = useLocalStorage('resume', emptyResume)
  const [id] = useLocalStorage('resume_id', '')
  return (
    <div className="container">
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <h1>Preview</h1>
        <nav className="actions">
          <button><Link className="btn secondary" to="/">Back to Editor</Link></button>
          {id && <button onClick={()=>window.open(`/api/resumes/${id}/pdf`, '_blank')}>Download PDF</button>}
        </nav>
      </header>
      <Preview data={resume} />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="/preview" element={<PreviewPage />} />
    </Routes>
  )
}
