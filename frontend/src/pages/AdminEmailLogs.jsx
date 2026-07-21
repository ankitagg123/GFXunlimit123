import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function AdminEmailLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => { load(); }, []);
  const load = async () => { try { const token = localStorage.getItem('token'); const res = await axios.get(`${API_BASE_URL}/admin/email/logs`, { headers: { Authorization: `Bearer ${token}` } }); setLogs(res.data || []); } catch (err) { console.error(err); } };

  return (
    <div style={{ padding: 20 }}>
      <h2>Email Logs</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>When</th><th>Recipient</th><th>Subject</th><th>Status</th></tr></thead>
        <tbody>
          {logs.map(l => <tr key={l.id}><td>{new Date(l.created_at).toLocaleString()}</td><td>{l.recipient}</td><td>{l.subject}</td><td>{l.status}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
