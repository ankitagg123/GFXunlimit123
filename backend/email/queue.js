const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const pool = require('../db');

const connectionString = process.env.REDIS_URL || process.env.REDIS || null;

let emailQueue = null;
if (connectionString) {
  const connection = new IORedis(connectionString);
  emailQueue = new Queue('emails', { connection });
}

async function enqueueEmail(jobName, payload, opts = {}) {
  // jobName unused, keep for future
  if (emailQueue) {
    const job = await emailQueue.add('send-email', payload, opts);
    // also persist into email_queue table for record
    try {
      await pool.query('INSERT INTO email_queue(job_id, payload, status, scheduled_at, created_at) VALUES($1,$2,$3,$4, now())', [job.id, payload, 'queued', opts.delay ? new Date(Date.now() + opts.delay) : null]);
    } catch (err) {
      console.error('Failed to persist email queue record', err);
    }
    return job.id;
  }

  // fallback: insert into email_queue table
  try {
    const r = await pool.query('INSERT INTO email_queue(payload, status, scheduled_at, created_at) VALUES($1,$2,$3, now()) RETURNING id', [payload, 'queued', opts.scheduled_at || null]);
    return r.rows[0].id;
  } catch (err) {
    console.error('Failed to insert into email_queue', err);
    throw err;
  }
}

module.exports = { enqueueEmail };
