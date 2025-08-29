import React from 'react'

export default function Preview({ data }) {
  const d = data
  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <h2>{d.personal.fullName || 'Your Name'}</h2>
        <span className="small">{[d.personal.email,d.personal.phone,d.personal.location,d.personal.website].filter(Boolean).join(' • ')}</span>
      </div>
      {d.summary && <div className="section"><h3>Summary</h3><p>{d.summary}</p></div>}

      {!!(d.experience||[]).length && <div className="section">
        <h3>Experience</h3>
        {(d.experience||[]).map((e, i)=>(
          <div key={i} className="section" style={{borderTop:0}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <strong>{e.role} — {e.company}</strong>
              <span className="small">{e.start} - {e.end || 'Present'}</span>
            </div>
            {e.location && <div className="small">{e.location}</div>}
            {e.bullets && <ul>{e.bullets.split(/\n+/).map((b, j)=>(b.trim() && <li key={j}>{b}</li>))}</ul>}
          </div>
        ))}
      </div>}

      {!!(d.projects||[]).length && <div className="section">
        <h3>Projects</h3>
        {(d.projects||[]).map((p,i)=>(
          <div key={i} className="section" style={{borderTop:0}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <strong>{p.name}</strong>
              {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="small">{p.link}</a>}
            </div>
            <p>{p.description}</p>
          </div>
        ))}
      </div>}

      {!!(d.education||[]).length && <div className="section">
        <h3>Education</h3>
        {(d.education||[]).map((ed,i)=>(
          <div key={i} className="section" style={{borderTop:0}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <strong>{ed.degree} — {ed.school}</strong>
              <span className="small">{ed.start} - {ed.end}</span>
            </div>
            {ed.details && <div>{ed.details}</div>}
          </div>
        ))}
      </div>}

      {d.skills && <div className="section">
        <h3>Skills</h3>
        <div className="list">
          {d.skills.split(',').map((s,i)=>(<span key={i} className="badge">{s.trim()}</span>))}
        </div>
      </div>}
    </div>
  )
}
