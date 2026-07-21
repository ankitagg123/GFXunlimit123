const { Worker, Queue } = require('bullmq');
const IORedis = require('ioredis');
const pool = require('../db');
const { sendMail, renderTemplate } = require('./mailer');

const connectionString = process.env.REDIS_URL || process.env.REDIS || null;
if (!connectionString) {
  console.warn('No REDIS_URL configured — email queue worker disabled.');
  process.exit(0);
}

const connection = new IORedis(connectionString);
const emailQueue = new Queue('emails', { connection });

const worker = new Worker('emails', async job => {
  const { to, subject, templateBody, templateData, settings } = job.data;
  try {
    const html = templateBody ? renderTemplate(templateBody, templateData) : (templateData && templateData.html) || '';
    await sendMail(settings, { to, subject, html, text: templateData && templateData.text });
    await pool.query('INSERT INTO email_logs(recipient, subject, body, status, created_at) VALUES($1,$2,$3,$4, now())', [to, subject || '', html || '', 'sent']);
    return true;
  } catch (err) {
    console.error('Email job failed', err);
    await pool.query('INSERT INTO email_logs(recipient, subject, body, status, error_message, created_at) VALUES($1,$2,$3,$4,$5, now())', [to, subject || '', templateBody || '', 'failed', err.message]);
    throw err;
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error('Job failed', job.id, err.message || err);
});
