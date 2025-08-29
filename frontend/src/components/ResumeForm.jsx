import React from 'react'
import { enhance } from '../api'

export default function ResumeForm({ value, onChange }) {
  const v = value
  const set = (path, val) => {
    const updated = structuredClone(v)
    const segs = path.split('.')
    let o = updated
    for (let i=0; i<segs.length-1; i++) o = o[segs[i]] ||= {}
    o[segs.at(-1)] = val
    onChange(updated)
  }

  const addArrayItem = (key, val) => onChange({ ...v, [key]: [...(v[key]||[]), val] })
  const removeArrayItem = (key, idx) => onChange({ ...v, [key]: (v[key]||[]).filter((_,i)=>i!==idx) })

  const enhanceBullets = async (key, idx) => {
    const item = v[key][idx]
    const res = await enhance(item.bullets || item.description || '', item.role || 'professional')
    const updated = structuredClone(v)
    if (item.bullets !== undefined) updated[key][idx].bullets = res.improved
    else updated[key][idx].description = res.improved
    onChange(updated)
  }

  return (
    <div className="card">
      <h2>Resume Editor</h2>
      <div className="section">
        <h3>Personal Info</h3>
        <div className="row">
          <div className="col-6">
            <label>Full Name</label>
            <input value={v.personal.fullName} onChange={e=>set('personal.fullName', e.target.value)} />
          </div>
          <div className="col-6">
            <label>Title</label>
            <input value={v.personal.title} onChange={e=>set('personal.title', e.target.value)} />
          </div>
          <div className="col-6">
            <label>Email</label>
            <input value={v.personal.email} onChange={e=>set('personal.email', e.target.value)} />
          </div>
          <div className="col-6">
            <label>Phone</label>
            <input value={v.personal.phone} onChange={e=>set('personal.phone', e.target.value)} />
          </div>
          <div className="col-6">
            <label>Location</label>
            <input value={v.personal.location} onChange={e=>set('personal.location', e.target.value)} />
          </div>
          <div className="col-6">
            <label>Website/LinkedIn</label>
            <input value={v.personal.website} onChange={e=>set('personal.website', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Professional Summary</h3>
        <textarea rows={4} value={v.summary} onChange={e=>set('summary', e.target.value)} />
      </div>

      <div className="section">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3>Experience</h3>
          <button className="btn secondary" onClick={()=>addArrayItem('experience', { company:'', role:'', start:'', end:'', location:'', bullets:'' })}>+ Add</button>
        </div>
        {(v.experience||[]).map((exp, idx)=>(
          <div key={idx} className="card" style={{padding:'12px', margin:'10px 0'}}>
            <div className="actions" style={{justifyContent:'flex-end'}}>
              <button onClick={()=>enhanceBullets('experience', idx)} className="btn">Enhance</button>
              <button onClick={()=>removeArrayItem('experience', idx)}>Remove</button>
            </div>
            <div className="row">
              <div className="col-6"><label>Company</label><input value={exp.company} onChange={e=>{
                const a=[...v.experience]; a[idx].company=e.target.value; onChange({...v, experience:a})
              }}/></div>
              <div className="col-6"><label>Role</label><input value={exp.role} onChange={e=>{const a=[...v.experience]; a[idx].role=e.target.value; onChange({...v, experience:a})}}/></div>
              <div className="col-6"><label>Start</label><input value={exp.start} onChange={e=>{const a=[...v.experience]; a[idx].start=e.target.value; onChange({...v, experience:a})}}/></div>
              <div className="col-6"><label>End</label><input value={exp.end} onChange={e=>{const a=[...v.experience]; a[idx].end=e.target.value; onChange({...v, experience:a})}}/></div>
              <div className="col-12"><label>Location</label><input value={exp.location} onChange={e=>{const a=[...v.experience]; a[idx].location=e.target.value; onChange({...v, experience:a})}}/></div>
              <div className="col-12"><label>Bullets (one per line)</label><textarea rows={4} value={exp.bullets} onChange={e=>{const a=[...v.experience]; a[idx].bullets=e.target.value; onChange({...v, experience:a})}}/></div>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3>Projects</h3>
          <button className="btn secondary" onClick={()=>addArrayItem('projects', { name:'', link:'', description:'' })}>+ Add</button>
        </div>
        {(v.projects||[]).map((p, idx)=>(
          <div key={idx} className="card" style={{padding:'12px', margin:'10px 0'}}>
            <div className="actions" style={{justifyContent:'flex-end'}}>
              <button onClick={()=>enhanceBullets('projects', idx)} className="btn">Enhance</button>
              <button onClick={()=>removeArrayItem('projects', idx)}>Remove</button>
            </div>
            <div className="row">
              <div className="col-6"><label>Name</label><input value={p.name} onChange={e=>{const a=[...v.projects]; a[idx].name=e.target.value; onChange({...v, projects:a})}}/></div>
              <div className="col-6"><label>Link</label><input value={p.link} onChange={e=>{const a=[...v.projects]; a[idx].link=e.target.value; onChange({...v, projects:a})}}/></div>
              <div className="col-12"><label>Description</label><textarea rows={3} value={p.description} onChange={e=>{const a=[...v.projects]; a[idx].description=e.target.value; onChange({...v, projects:a})}}/></div>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3>Education</h3>
          <button className="btn secondary" onClick={()=>addArrayItem('education', { school:'', degree:'', start:'', end:'', details:'' })}>+ Add</button>
        </div>
        {(v.education||[]).map((ed, idx)=>(
          <div key={idx} className="card" style={{padding:'12px', margin:'10px 0'}}>
            <div className="actions" style={{justifyContent:'flex-end'}}>
              <button onClick={()=>removeArrayItem('education', idx)}>Remove</button>
            </div>
            <div className="row">
              <div className="col-6"><label>School</label><input value={ed.school} onChange={e=>{const a=[...v.education]; a[idx].school=e.target.value; onChange({...v, education:a})}}/></div>
              <div className="col-6"><label>Degree</label><input value={ed.degree} onChange={e=>{const a=[...v.education]; a[idx].degree=e.target.value; onChange({...v, education:a})}}/></div>
              <div className="col-6"><label>Start</label><input value={ed.start} onChange={e=>{const a=[...v.education]; a[idx].start=e.target.value; onChange({...v, education:a})}}/></div>
              <div className="col-6"><label>End</label><input value={ed.end} onChange={e=>{const a=[...v.education]; a[idx].end=e.target.value; onChange({...v, education:a})}}/></div>
              <div className="col-12"><label>Details</label><textarea rows={2} value={ed.details} onChange={e=>{const a=[...v.education]; a[idx].details=e.target.value; onChange({...v, education:a})}}/></div>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <h3>Skills (comma separated)</h3>
        <textarea rows={2} value={v.skills} onChange={e=>set('skills', e.target.value)} />
      </div>
    </div>
  )
}
