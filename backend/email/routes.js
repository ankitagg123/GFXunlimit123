const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt, sendMail, renderTemplate, createTransportFromSettings } = require('./mailer');
const { enqueueEmail } = require('./queue');

function verifyAdminLocal(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json('Access denied');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'secretkey');
    // basic check
    pool.query('SELECT role FROM users WHERE id = $1', [decoded.user]).then(result => {
      if (result.rows.length === 0) return res.status(404).json('User not found');
      if (result.rows[0].role !== 'admin') return res.status(403).json('Admin access only');
      req.user = decoded.user;
      next();
    }).catch(err => {
      console.error(err);
      res.status(500).json('Server error');
    });
  } catch (err) {
    console.error(err);
    res.status(401).json('Invalid token');
  }
}

function preserveStoredPassword(body, stored) {
  if (!stored || !stored.smtp_pass) return body.smtp_pass;
  const sentPass = body?.smtp_pass;
  if (sentPass === '*****' || sentPass === undefined || sentPass === null || sentPass === '') {
    return stored.smtp_pass;
  }
  return sentPass;
}

function normalizeSmtpUser(settings) {
  if (!settings.smtp_user && settings.sender_email) {
    settings.smtp_user = settings.sender_email;
  }
  return settings;
}

// Get or create settings (single row)
router.get('/settings', verifyAdminLocal, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1');
    if (r.rows.length === 0) return res.json({});
    const s = r.rows[0];
    // do not reveal passwords in plain text
    s.smtp_pass = s.smtp_pass ? '*****' : '';
    s.imap_pass = s.imap_pass ? '*****' : '';
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.post('/settings', verifyAdminLocal, async (req, res) => {
  try {
    const body = req.body || {};
    let encrypted = null;

    if (body.smtp_pass && body.smtp_pass !== '*****') {
      encrypted = encrypt(body.smtp_pass);
    } else {
      const current = await pool.query('SELECT smtp_pass FROM email_settings ORDER BY id DESC LIMIT 1');
      if (current.rows.length > 0 && current.rows[0].smtp_pass && current.rows[0].smtp_pass !== '*****') {
        encrypted = current.rows[0].smtp_pass;
      }
    }

    const q = `INSERT INTO email_settings(sender_name, sender_email, reply_to, provider, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, imap_host, imap_port, imap_user, imap_pass, imap_secure, auth_required, connection_timeout, daily_limit, max_per_minute, enable_queue, enable_logging, enable_retry, retry_attempts, retry_delay, enable_bounce_handling, enable_tracking_pixel, enable_click_tracking, updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26, now()) RETURNING *`;
    const vals = [
      body.sender_name || null,
      body.sender_email || null,
      body.reply_to || null,
      body.provider || 'smtp',
      body.smtp_host || null,
      body.smtp_port || null,
      body.smtp_user || null,
      encrypted,
      !!body.smtp_secure,
      body.imap_host || null,
      body.imap_port || null,
      body.imap_user || null,
      body.imap_pass || null,
      !!body.imap_secure,
      body.auth_required !== false,
      body.connection_timeout || 10000,
      body.daily_limit || 1000,
      body.max_per_minute || 60,
      body.enable_queue !== false,
      body.enable_logging !== false,
      body.enable_retry !== false,
      body.retry_attempts || 3,
      body.retry_delay || 60000,
      !!body.enable_bounce_handling,
      !!body.enable_tracking_pixel,
      !!body.enable_click_tracking
    ];
    const r = await pool.query(q, vals);
    const inserted = r.rows[0];
    inserted.smtp_pass = inserted.smtp_pass ? '*****' : '';
    inserted.imap_pass = inserted.imap_pass ? '*****' : '';
    res.json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Verify SMTP connection using current settings
router.post('/verify', verifyAdminLocal, async (req, res) => {
  try {
    const body = req.body || {};
    const r = await pool.query('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1');
    const stored = r.rows[0];
    if (!stored && !body.smtp_host) return res.status(400).json({ status: 'no_settings' });

    const settings = normalizeSmtpUser({ ...stored, ...body });
    settings.smtp_pass = preserveStoredPassword(body, stored);

    const okTransport = await createTransportFromSettings(settings);
    try {
      await okTransport.verify();
      res.json({ status: 'connected' });
    } catch (err) {
      res.status(400).json({ status: 'failed', error: err.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verify failed', detail: err.message });
  }
});

// Send test email
router.post('/send-test', verifyAdminLocal, async (req, res) => {
  try {
    const { to, subject, body, ...bodySettings } = req.body || {};
    if (!to) return res.status(400).json({ error: 'Missing recipient' });
    const r = await pool.query('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1');
    const stored = r.rows[0];
    if (!stored && !bodySettings.smtp_host) return res.status(400).json({ error: 'No email settings configured' });

    const settings = normalizeSmtpUser({ ...stored, ...bodySettings });
    settings.smtp_pass = preserveStoredPassword(bodySettings, stored);

    const finalSubject = subject || 'GFXunlimit: Test Email';
    const finalBody = body || '<p>GFXunlimit test email content.</p>';
    const result = await sendMail(settings, {
      to,
      subject: finalSubject,
      text: finalBody.replace(/<[^>]*>/g, ''),
      html: finalBody,
    });
    // log
    await pool.query('INSERT INTO email_logs(recipient, subject, body, status, created_at) VALUES($1,$2,$3,$4, now())', [to, finalSubject, finalBody, 'sent']);
    res.json({ ok: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send test email', detail: err.message });
  }
});

// Templates CRUD
router.get('/templates', verifyAdminLocal, async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, subject, body, variables, created_at, updated_at FROM email_templates ORDER BY name');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

router.get('/templates/:id', verifyAdminLocal, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM email_templates WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load template' });
  }
});

router.post('/templates', verifyAdminLocal, async (req, res) => {
  try {
    const { id, name, subject, body, variables } = req.body || {};
    if (id) {
      const r = await pool.query('UPDATE email_templates SET name=$1, subject=$2, body=$3, variables=$4, updated_at=now() WHERE id=$5 RETURNING *', [name, subject, body, variables || [], id]);
      return res.json(r.rows[0]);
    }
    const r = await pool.query('INSERT INTO email_templates(name, subject, body, variables) VALUES($1,$2,$3,$4) RETURNING *', [name, subject, body, variables || []]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

router.delete('/templates/:id', verifyAdminLocal, async (req, res) => {
  try {
    await pool.query('DELETE FROM email_templates WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Enqueue email
router.post('/enqueue', verifyAdminLocal, async (req, res) => {
  try {
    const { to, subject, templateId, templateData, body, scheduledAt } = req.body || {};
    if (!to) return res.status(400).json({ error: 'Missing recipient' });
    let templateBody = body || null;
    if (templateId) {
      const t = await pool.query('SELECT body FROM email_templates WHERE id = $1', [templateId]);
      if (t.rows[0]) templateBody = t.rows[0].body;
    }
    const settingsRes = await pool.query('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1');
    const settings = settingsRes.rows[0] || {};
    const payload = { to, subject, templateBody, templateData, settings };
    if (scheduledAt) {
      // insert into DB scheduled
      await pool.query('INSERT INTO email_queue(payload, status, scheduled_at, created_at) VALUES($1,$2,$3, now())', [payload, 'scheduled', scheduledAt]);
      return res.json({ ok: true, scheduled: true });
    }
    const jobId = await enqueueEmail('send-email', payload);
    res.json({ ok: true, jobId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to enqueue' });
  }
});

// Logs
router.get('/logs', verifyAdminLocal, async (req, res) => {
  try {
    const { q, status, limit = 100, offset = 0 } = req.query;
    let base = 'SELECT * FROM email_logs';
    const where = [];
    const vals = [];
    if (q) { vals.push(`%${q}%`); where.push(`(recipient ILIKE $${vals.length} OR subject ILIKE $${vals.length} OR body ILIKE $${vals.length})`); }
    if (status) { vals.push(status); where.push(`status = $${vals.length}`); }
    if (where.length) base += ' WHERE ' + where.join(' AND ');
    base += ' ORDER BY created_at DESC LIMIT ' + Number(limit) + ' OFFSET ' + Number(offset);
    const r = await pool.query(base, vals);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load logs' });
  }
});

// Newsletter subscribers
router.post('/newsletter/subscribers', verifyAdminLocal, async (req, res) => {
  try {
    const { email, name, segments } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const r = await pool.query('INSERT INTO newsletter_subscribers(email, name, segments) VALUES($1,$2,$3) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, segments=EXCLUDED.segments RETURNING *', [email, name || null, segments || []]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add subscriber' });
  }
});

router.get('/newsletter/subscribers', verifyAdminLocal, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load subscribers' });
  }
});

// Newsletter campaigns
router.post('/newsletter/campaigns', verifyAdminLocal, async (req, res) => {
  try {
    const { title, subject, body, scheduled_at } = req.body || {};
    const r = await pool.query('INSERT INTO newsletter_campaigns(title, subject, body, scheduled_at) VALUES($1,$2,$3,$4) RETURNING *', [title, subject, body, scheduled_at || null]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.post('/newsletter/send-campaign/:id', verifyAdminLocal, async (req, res) => {
  try {
    const id = req.params.id;
    const c = await pool.query('SELECT * FROM newsletter_campaigns WHERE id = $1', [id]);
    if (!c.rows[0]) return res.status(404).json({ error: 'Campaign not found' });
    const campaign = c.rows[0];
    const subs = await pool.query('SELECT email, name FROM newsletter_subscribers WHERE subscribed = true');
    const settingsRes = await pool.query('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1');
    const settings = settingsRes.rows[0] || {};
    for (const s of subs.rows) {
      const payload = { to: s.email, subject: campaign.subject, templateBody: campaign.body, templateData: { subscriber_name: s.name } , settings };
      await enqueueEmail('send-email', payload);
    }
    res.json({ ok: true, queued: subs.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Notification rules CRUD
router.get('/notification-rules', verifyAdminLocal, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM notification_rules ORDER BY event_key');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load rules' });
  }
});

router.post('/notification-rules', verifyAdminLocal, async (req, res) => {
  try {
    const { event_key, enable_email, enable_internal, enable_dashboard, recipients } = req.body || {};
    if (!event_key) {
      return res.status(400).json({ error: 'Event key is required' });
    }
    const recipientList = Array.isArray(recipients)
      ? recipients
      : typeof recipients === 'string'
      ? recipients.split(',').map((item) => item.trim()).filter(Boolean)
      : [];
    const r = await pool.query(
      'INSERT INTO notification_rules(event_key, enable_email, enable_internal, enable_dashboard, recipients) VALUES($1,$2,$3,$4,$5) ON CONFLICT (event_key) DO UPDATE SET enable_email=EXCLUDED.enable_email, enable_internal=EXCLUDED.enable_internal, enable_dashboard=EXCLUDED.enable_dashboard, recipients=EXCLUDED.recipients, updated_at=now() RETURNING *',
      [event_key, enable_email !== false, enable_internal !== false, enable_dashboard !== false, recipientList]
    );
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save rule' });
  }
});

// Scheduled emails
router.get('/scheduled', verifyAdminLocal, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM scheduled_emails ORDER BY id DESC');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load scheduled emails' });
  }
});

router.post('/scheduled', verifyAdminLocal, async (req, res) => {
  try {
    const { name, payload, cron_expression, next_run, active } = req.body || {};
    const r = await pool.query('INSERT INTO scheduled_emails(name, payload, cron_expression, next_run, active) VALUES($1,$2,$3,$4,$5) RETURNING *', [name, payload || {}, cron_expression || null, next_run || null, active !== false]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create scheduled email' });
  }
});

// Preview template rendering
router.post('/preview', verifyAdminLocal, async (req, res) => {
  try {
    const { body, data } = req.body || {};
    const html = renderTemplate(body || '', data || {});
    res.json({ html });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to render preview' });
  }
});

// Analytics: basic aggregates and daily counts for last 30 days
router.get('/analytics', verifyAdminLocal, async (req, res) => {
  try {
    const totals = await pool.query("SELECT COUNT(*) FILTER (WHERE status = 'sent') AS sent, COUNT(*) FILTER (WHERE status = 'failed') AS failed, COUNT(*) AS total FROM email_logs");
    const queueCount = await pool.query("SELECT COUNT(*) AS queued FROM email_queue WHERE status = 'queued'");
    const daily = await pool.query("SELECT to_char(created_at, 'YYYY-MM-DD') AS day, COUNT(*) FILTER (WHERE status = 'sent') AS sent_count FROM email_logs WHERE created_at >= now() - interval '30 days' GROUP BY day ORDER BY day");
    res.json({ totals: totals.rows[0], queued: queueCount.rows[0].queued, daily: daily.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});


module.exports = router;
