import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [sampleData, setSampleData] = useState('{ "customer_name": "Jane Doe", "asset_name": "Mountain Photo" }');
  const BLOCK_TYPES = ['header','text','image','button','divider'];
  const emptyBlock = (type) => {
    switch(type) {
      case 'header': return { type: 'header', text: 'Welcome to our update', align: 'center' };
      case 'text': return { type: 'text', text: 'Write your paragraph here...' };
      case 'image': return { type: 'image', src: '', alt: 'Image description', width: '100%' };
      case 'button': return { type: 'button', text: 'Call To Action', url: '#', bgcolor: '#ED2224', color: '#fff' };
      case 'divider': return { type: 'divider' };
      default: return { type: 'text', text: '' };
    }
  };

  useEffect(() => { load(); }, []);
  const load = async () => { try { const token = localStorage.getItem('token'); const res = await axios.get(`${API_BASE_URL}/admin/email/templates`, { headers: { Authorization: `Bearer ${token}` } }); setTemplates(res.data || []); } catch (err) { console.error(err); } };

  const save = async () => {
    try {
      // render blocks to HTML before saving
      if (editing && Array.isArray(editing.blocks)) {
        const html = renderBlocksToHtml(editing.blocks);
        editing.body = html;
      }
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/email/templates`, editing, { headers: { Authorization: `Bearer ${token}` } });
      setEditing(null); load();
    } catch (err) { console.error(err); }
  };

  const preview = async () => {
    try {
      const token = localStorage.getItem('token');
      // ensure blocks are rendered for preview
      const bodyHtml = (editing && Array.isArray(editing.blocks)) ? renderBlocksToHtml(editing.blocks) : (editing?.body || '');
      const data = JSON.parse(sampleData || '{}');
      const res = await axios.post(`${API_BASE_URL}/admin/email/preview`, { body: bodyHtml, data }, { headers: { Authorization: `Bearer ${token}` } });
      setPreviewHtml(res.data.html || '');
    } catch (err) {
      console.error(err);
      setPreviewHtml('<pre>Error rendering preview</pre>');
    }
  };

  const renderBlocksToHtml = (blocks) => {
    if (!Array.isArray(blocks)) return '';
    return blocks.map((b) => {
      switch(b.type) {
        case 'header': return `<h1 style="text-align:${b.align || 'left'}; font-family: Arial, sans-serif;">${escapeHtml(b.text || '')}</h1>`;
        case 'text': return `<p style="font-family: Arial, sans-serif; line-height:1.6;">${escapeHtml(b.text || '')}</p>`;
        case 'image': return `<div style="text-align:center;"><img src="${escapeAttr(b.src || '')}" alt="${escapeAttr(b.alt||'')}" style="max-width:${escapeAttr(b.width||'100%')}; height:auto;"/></div>`;
        case 'button': return `<div style="text-align:center;"><a href="${escapeAttr(b.url||'#')}" style="background:${escapeAttr(b.bgcolor||'#ED2224')}; color:${escapeAttr(b.color||'#fff')}; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block;">${escapeHtml(b.text||'Click')}</a></div>`;
        case 'divider': return `<hr style="border:none; border-top:1px solid #eee; margin:18px 0;"/>`;
        default: return '';
      }
    }).join('\n');
  };

  const escapeHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const escapeAttr = (s) => escapeHtml(s).replace(/'/g, '&#39;');

  const addBlock = (type) => {
    if (!editing) return;
    const next = { ...editing };
    next.blocks = Array.isArray(next.blocks) ? [...next.blocks, emptyBlock(type)] : [emptyBlock(type)];
    setEditing(next);
  };

  const updateBlock = (idx, patch) => {
    const next = { ...editing };
    next.blocks = next.blocks.map((b,i)=> i===idx ? { ...b, ...patch } : b);
    setEditing(next);
  };

  const removeBlock = (idx) => {
    const next = { ...editing };
    next.blocks = next.blocks.filter((_,i)=>i!==idx);
    setEditing(next);
  };

  const moveBlock = (from, to) => {
    if (!editing) return;
    const arr = [...editing.blocks];
    const [item] = arr.splice(from,1);
    arr.splice(to,0,item);
    setEditing({ ...editing, blocks: arr });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#ED2224' }}>Email Templates</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 300 }}>
          <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
            <button onClick={() => setEditing({ name: '', subject: '', body: '', blocks: [] })} style={{ background: '#ED2224', color: 'white', padding: '8px 12px', borderRadius: 8 }}>New Template</button>
          </div>
          <div style={{ maxHeight: '60vh', overflow: 'auto', padding: 8, border: '1px solid #eee', borderRadius: 8, background: 'white' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {templates.map(t => (
                <li key={t.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{t.name}</strong>
                    <div style={{ fontSize: 12, color: '#666' }}>{t.subject}</div>
                  </div>
                  <div>
                    <button onClick={() => setEditing({ ...t, blocks: [] })} style={{ marginLeft: 8 }}>Edit</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {editing && (
          <div style={{ flex: 1.4, background: '#fafafa', padding: 12, borderRadius: 12 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Name<input style={{ width: '100%', padding: 8, borderRadius: 8 }} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></label>
            <label style={{ display: 'block', marginBottom: 8 }}>Subject<input style={{ width: '100%', padding: 8, borderRadius: 8 }} value={editing.subject} onChange={e => setEditing({ ...editing, subject: e.target.value })} /></label>

            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {BLOCK_TYPES.map(bt => (
                  <button key={bt} onClick={() => addBlock(bt)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>{bt}</button>
                ))}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button onClick={save} style={{ background: '#1976d2', color: 'white', padding: '8px 12px', borderRadius: 8 }}>Save</button>
                <button onClick={() => setEditing(null)} style={{ background: '#757575', color: 'white', padding: '8px 12px', borderRadius: 8 }}>Cancel</button>
                <button onClick={preview} style={{ background: '#43a047', color: 'white', padding: '8px 12px', borderRadius: 8 }}>Preview</button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ border: '1px solid #e8e8e8', padding: 10, borderRadius: 8, maxHeight: 420, overflow: 'auto', background: 'white' }}>
                {(!editing.blocks || editing.blocks.length === 0) && <div style={{ color: '#777' }}>Add blocks using the buttons above.</div>}
                {editing.blocks && editing.blocks.map((b, idx) => (
                  <div key={idx} draggable
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(idx)); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => { e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); moveBlock(from, idx); }}
                    style={{ border: '1px dashed #ddd', padding: 8, borderRadius: 8, marginBottom: 8, background: '#fff', cursor: 'grab' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ textTransform: 'capitalize' }}>{b.type}</strong>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => moveBlock(idx, Math.max(0, idx-1))}>↑</button>
                        <button onClick={() => moveBlock(idx, Math.min(editing.blocks.length-1, idx+1))}>↓</button>
                        <button onClick={() => removeBlock(idx)} style={{ color: '#e53935' }}>Remove</button>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {b.type === 'header' && (
                        <div style={{ display: 'grid', gap: 6 }}>
                          <input value={b.text} onChange={e => updateBlock(idx, { text: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
                          <select value={b.align || 'center'} onChange={e => updateBlock(idx, { align: e.target.value })}>
                            <option value='left'>Left</option>
                            <option value='center'>Center</option>
                            <option value='right'>Right</option>
                          </select>
                        </div>
                      )}
                      {b.type === 'text' && (
                        <textarea rows={4} value={b.text} onChange={e => updateBlock(idx, { text: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
                      )}
                      {b.type === 'image' && (
                        <div style={{ display: 'grid', gap: 6 }}>
                          <input placeholder='Image URL' value={b.src} onChange={e => updateBlock(idx, { src: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
                          <input placeholder='Alt text' value={b.alt} onChange={e => updateBlock(idx, { alt: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
                          <input placeholder='Width (e.g. 100% or 600px)' value={b.width} onChange={e => updateBlock(idx, { width: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
                        </div>
                      )}
                      {b.type === 'button' && (
                        <div style={{ display: 'grid', gap: 6 }}>
                          <input placeholder='Button text' value={b.text} onChange={e => updateBlock(idx, { text: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
                          <input placeholder='URL' value={b.url} onChange={e => updateBlock(idx, { url: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input type='color' value={b.bgcolor || '#ED2224'} onChange={e => updateBlock(idx, { bgcolor: e.target.value })} />
                            <input type='color' value={b.color || '#ffffff'} onChange={e => updateBlock(idx, { color: e.target.value })} />
                          </div>
                        </div>
                      )}
                      {b.type === 'divider' && <div style={{ color: '#777' }}>Divider</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label>Sample Data (JSON)</label>
              <textarea style={{ width: '100%', padding: 8, borderRadius: 8 }} rows={4} value={sampleData} onChange={e => setSampleData(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ width: 420 }}>
          <div style={{ background: 'white', padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
            <h4 style={{ marginTop: 0 }}>Preview</h4>
            <div style={{ minHeight: 200, border: '1px solid #f1f1f1', padding: 12, borderRadius: 6 }} dangerouslySetInnerHTML={{ __html: previewHtml || (editing && Array.isArray(editing.blocks) ? renderBlocksToHtml(editing.blocks) : '') }} />
          </div>
        </div>
      </div>
    </div>
  );
}
