const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { compile } = require('handlebars');

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;

function getKey() {
  const secret = process.env.APP_SECRET || process.env.SECRET || 'dev_secret_please_change';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LEN);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(payload) {
  if (!payload) return '';
  const data = Buffer.from(payload, 'base64');
  const iv = data.slice(0, IV_LEN);
  const tag = data.slice(IV_LEN, IV_LEN + 16);
  const enc = data.slice(IV_LEN + 16);
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]);
  return decrypted.toString('utf8');
}

function resolvePassword(storedValue) {
  if (!storedValue || storedValue === '*****') return '';
  try {
    return decrypt(storedValue);
  } catch (err) {
    return storedValue;
  }
}

async function createTransportFromSettings(settings) {
  // settings: { provider, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure }
  const provider = (settings.provider || 'smtp').toLowerCase();
  const pass = resolvePassword(settings.smtp_pass);
  const port = Number(settings.smtp_port) || undefined;
  const secure = typeof settings.smtp_secure === 'boolean'
    ? settings.smtp_secure
    : port === 465;

  // Build nodemailer transport options
  let opts = {
    host: settings.smtp_host || undefined,
    port,
    secure,
    auth: settings.smtp_user ? { user: settings.smtp_user, pass } : undefined,
    tls: { rejectUnauthorized: false }
  };

  // Provider shortcuts
  if (provider === 'gmail') {
    opts = { service: 'gmail', auth: { user: settings.smtp_user, pass } };
  } else if (provider === 'sendgrid') {
    opts = { service: 'SendGrid', auth: { user: settings.smtp_user, pass } };
  } else if (provider === 'ses' || provider === 'amazon ses' || provider === 'aws ses') {
    // SES typically uses SMTP credentials, fallback to host/port
  }

  const transporter = nodemailer.createTransport(opts);
  // Verify connection
  try {
    await transporter.verify();
  } catch (err) {
    // don't throw here; caller may want to report status
  }
  return transporter;
}

async function sendMail(settings, opts) {
  const transporter = await createTransportFromSettings(settings);
  const merged = {
    from: `${settings.sender_name || ''} <${settings.sender_email || settings.smtp_user || 'no-reply@localhost'}>`,
    ...opts
  };
  return transporter.sendMail(merged);
}

function renderTemplate(body, data) {
  try {
    const tmpl = compile(body || '');
    return tmpl(data || {});
  } catch (err) {
    return body || '';
  }
}

module.exports = { encrypt, decrypt, createTransportFromSettings, sendMail, renderTemplate };
