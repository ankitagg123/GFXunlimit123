import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function AdminEmailScheduled() {
  const [scheduled, setScheduled] = useState([]);
  const [name, setName] = useState('');
  const [payloadText, setPayloadText] = useState('{ "to": "", "subject": "", "templateBody": "" }');
  const [cron, setCron] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin/email/scheduled`, { headers: { Authorization: `Bearer ${token}` } });
      setScheduled(res.data || []);
    } catch (err) { console.error(err); }
  };

  const create = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(payloadText || '{}');
      await axios.post(`${API_BASE_URL}/admin/email/scheduled`, { name, payload, cron_expression: cron }, { headers: { Authorization: `Bearer ${token}` } });
      setName(''); setPayloadText('{ "to": "", "subject": "", "templateBody": "" }'); setCron(''); load();
    } catch (err) { console.error(err); alert('Failed to create'); }
  };

  return (
    <div>
      <h3>Scheduled Emails</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Name<input value={name} onChange={e => setName(e.target.value)} /></label>
        <label>Payload (JSON)<textarea rows={6} value={payloadText} onChange={e => setPayloadText(e.target.value)} /></label>
        <label>Cron Expression (optional)<input value={cron} onChange={e => setCron(e.target.value)} placeholder="* * * * *" /></label>
        <div><button onClick={create} style={{ background: '#1976d2', color: 'white', padding: '8px 12px', borderRadius: 8 }}>Create Scheduled</button></div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Existing</h4>
        <ul>
          {scheduled.map(s => (
            <li key={s.id}>{s.name} — next: {s.next_run ? new Date(s.next_run).toLocaleString() : 'n/a'}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
