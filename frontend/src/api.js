const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function createResume(data) {
  const res = await fetch(`${API}/api/resumes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to create')
  return res.json()
}

export async function updateResume(id, data) {
  const res = await fetch(`${API}/api/resumes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update')
  return res.json()
}

export async function getResume(id) {
  const res = await fetch(`${API}/api/resumes/${id}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export async function enhance(text, role) {
  const res = await fetch(`${API}/api/enhance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, role }) })
  if (!res.ok) throw new Error('Enhance failed')
  return res.json()
}

export function downloadPdf(id) {
  const url = `${API}/api/resumes/${id}/pdf`
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.click()
}
