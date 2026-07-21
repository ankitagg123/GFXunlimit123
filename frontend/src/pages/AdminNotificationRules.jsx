import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const EVENT_OPTIONS = [
  { key: 'new_upload', label: 'New Upload Received' },
  { key: 'sale_completed', label: 'Sale Completed' },
  { key: 'payout_ready', label: 'Payout Ready' },
  { key: 'account_approved', label: 'Account Approved' },
  { key: 'account_rejected', label: 'Account Rejected' }
];

export default function AdminNotificationRules() {
  const [rules, setRules] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin/email/notification-rules`, { headers: { Authorization: `Bearer ${token}` } });
      setRules(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const save = async () => {
    try {
      if (!editing.event_key) {
        setMessage('Please select an event.');
        return;
      }
      const token = localStorage.getItem('token');
      const payload = {
        event_key: editing.event_key,
        enable_email: editing.enable_email,
        enable_internal: editing.enable_internal,
        enable_dashboard: editing.enable_dashboard,
        recipients: Array.isArray(editing.recipients)
          ? editing.recipients
          : (editing.recipients || '').split(',').map((item) => item.trim()).filter(Boolean)
      };
      await axios.post(`${API_BASE_URL}/admin/email/notification-rules`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Rule saved');
      setEditing(null);
      load();
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      console.error(err);
      setMessage('Unable to save rule');
    }
  };

  const startNewRule = () => setEditing({ event_key: '', enable_email: true, enable_internal: false, enable_dashboard: false, recipients: '' });

  return (
    <div style={{ padding: 20, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Notification Rules & Alerts</h2>
        <button onClick={startNewRule} style={{ background: '#43a047', color: 'white', padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>Add Rule</button>
      </div>
      <p style={{ color: '#555', margin: 0 }}>Configure when notifications are sent and which channels receive alerts for each event.</p>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <div style={{ padding: 16, borderRadius: 14, border: '1px solid #e0e0e0', background: 'white' }}>
          <h3 style={{ marginTop: 0 }}>Existing Rules</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {rules.length === 0 ? (
              <div style={{ color: '#777' }}>No notification rules configured yet.</div>
            ) : (
              rules.map((rule) => (
                <div key={rule.event_key} style={{ padding: 12, borderRadius: 10, border: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <div style={{ fontWeight: 600 }}>{EVENT_OPTIONS.find((opt) => opt.key === rule.event_key)?.label || rule.event_key}</div>
                  <div style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
                    Email: {rule.enable_email ? 'Yes' : 'No'} · Internal: {rule.enable_internal ? 'Yes' : 'No'} · Dashboard: {rule.enable_dashboard ? 'Yes' : 'No'}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#333' }}>
                    Recipients: {(Array.isArray(rule.recipients) && rule.recipients.join(', ')) || 'None'}
                  </div>
                  <button onClick={() => setEditing({ ...rule, recipients: Array.isArray(rule.recipients) ? rule.recipients.join(', ') : '' })} style={{ marginTop: 10, background: '#1976d2', color: 'white', padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Edit</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ padding: 16, borderRadius: 14, border: '1px solid #e0e0e0', background: 'white' }}>
          <h3 style={{ marginTop: 0 }}>{editing ? 'Edit Rule' : 'Select a rule to configure'}</h3>
          {editing ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                Event
                <select value={editing.event_key} onChange={(e) => setEditing({ ...editing, event_key: e.target.value })} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}>
                  <option value="">Choose an event</option>
                  {EVENT_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'grid', gap: 10 }}>
                {['enable_email','enable_internal','enable_dashboard'].map((field) => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f7f7f7', padding: 10, borderRadius: 10 }}>
                    <input type="checkbox" checked={!!editing[field]} onChange={(e) => setEditing({ ...editing, [field]: e.target.checked })} />
                    <span style={{ fontSize: 14 }}>{field === 'enable_email' ? 'Send Email' : field === 'enable_internal' ? 'Internal Alert' : 'Dashboard Notification'}</span>
                  </label>
                ))}
              </div>

              <label style={{ display: 'grid', gap: 6 }}>
                Recipients
                <input placeholder="comma-separated emails" value={editing.recipients || ''} onChange={(e) => setEditing({ ...editing, recipients: e.target.value })} style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
              </label>

              <button onClick={save} style={{ background: '#43a047', color: 'white', padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>Save Rule</button>
              <button onClick={() => setEditing(null)} style={{ background: '#757575', color: 'white', padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>Cancel</button>
              {message ? <div style={{ color: '#1976d2' }}>{message}</div> : null}
            </div>
          ) : (
            <div style={{ color: '#777' }}>Click a rule on the left or add a new rule to customize notification behavior.</div>
          )}
        </div>
      </div>
    </div>
  );
}
