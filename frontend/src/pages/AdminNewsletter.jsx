import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function AdminNewsletter() {
  const [subs, setSubs] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [segmentsInput, setSegmentsInput] = useState('customer');
  const fileRef = useRef();

  useEffect(() => { load(); }, []);
  const load = async () => { try { const token = localStorage.getItem('token'); const res = await axios.get(`${API_BASE_URL}/admin/email/newsletter/subscribers`, { headers: { Authorization: `Bearer ${token}` } }); setSubs(res.data || []); } catch (err) { console.error(err); } };

  const add = async () => {
    try { const token = localStorage.getItem('token'); await axios.post(`${API_BASE_URL}/admin/email/newsletter/subscribers`, { email, name, segments: segmentsInput.split(',').map(s => s.trim()) }, { headers: { Authorization: `Bearer ${token}` } }); setEmail(''); setName(''); load(); } catch (err) { console.error(err); }
  };

  const exportCsv = () => {
    const rows = subs.map(s => `${s.email},${s.name || ''},${(s.segments || []).join('|')}`);
    const csv = 'email,name,segments\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const importCsv = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).slice(1).filter(Boolean);
      for (const line of lines) {
        const [emailCol, nameCol, segmentsCol] = line.split(',');
        try {
          const token = localStorage.getItem('token');
          await axios.post(`${API_BASE_URL}/admin/email/newsletter/subscribers`, { email: emailCol.trim(), name: nameCol?.trim(), segments: segmentsCol ? segmentsCol.split('|').map(s=>s.trim()) : [] }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) { console.error('import failed for', line, err); }
      }
      load();
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#ED2224' }}>Newsletter Manager</h2>
      <div style={{ display: 'grid', gap: 8, maxWidth: 720 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="segments (comma)" value={segmentsInput} onChange={e => setSegmentsInput(e.target.value)} />
          <button onClick={add} style={{ background: '#1976d2', color: 'white', padding: '8px 12px', borderRadius: 8 }}>Add</button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCsv} style={{ padding: '8px 12px' }}>Export CSV</button>
          <input ref={fileRef} type="file" accept="text/csv" style={{ display: 'none' }} onChange={e => importCsv(e.target.files[0])} />
          <button onClick={() => fileRef.current.click()} style={{ padding: '8px 12px' }}>Import CSV</button>
        </div>

        <div>
          <h4>Subscribers</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Email</th><th>Name</th><th>Segments</th></tr></thead>
            <tbody>
              {subs.map(s => (<tr key={s.email}><td>{s.email}</td><td>{s.name}</td><td>{(s.segments||[]).join(', ')}</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
