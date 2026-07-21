import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function AdminEmailAnalytics() {
  const [data, setData] = useState(null);
  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin/email/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  if (!data) return <div style={{ padding: 20 }}>Loading analytics…</div>;

  const daily = data.daily || [];
  const max = Math.max(1, ...daily.map(d => Number(d.sent_count || 0)));

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#ED2224' }}>Email Analytics</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, background: '#fafafa', padding: 12, borderRadius: 12 }}>
          <h4>Totals</h4>
          <p>Sent: <strong>{data.totals.sent}</strong></p>
          <p>Failed: <strong>{data.totals.failed}</strong></p>
          <p>Queued: <strong>{data.queued}</strong></p>
        </div>
        <div style={{ flex: 3 }}>
          <h4>Last 30 days (sent)</h4>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 140 }}>
            {daily.map(d => (
              <div key={d.day} title={`${d.day}: ${d.sent_count}`} style={{ flex: 1 }}>
                <div style={{ height: `${(Number(d.sent_count) / max) * 100}%`, background: '#ED2224', borderRadius: 6 }}></div>
                <div style={{ fontSize: 10, textAlign: 'center' }}>{d.day.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
