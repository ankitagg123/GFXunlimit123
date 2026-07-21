import React, { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function AdminEmailQueue() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const send = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/email/enqueue`, { to, subject, body }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Enqueued');
    } catch (err) { console.error(err); alert('Failed'); }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Email Queue</h2>
      <label>To<input value={to} onChange={e => setTo(e.target.value)} /></label>
      <label>Subject<input value={subject} onChange={e => setSubject(e.target.value)} /></label>
      <label>Body<textarea rows={6} value={body} onChange={e => setBody(e.target.value)} /></label>
      <div><button onClick={send}>Enqueue</button></div>
    </div>
  );
}
