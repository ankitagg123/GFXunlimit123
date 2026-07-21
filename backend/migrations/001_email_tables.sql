-- Email system schema for GFXunlimit
CREATE TABLE IF NOT EXISTS email_settings (
  id SERIAL PRIMARY KEY,
  sender_name TEXT,
  sender_email TEXT,
  reply_to TEXT,
  provider TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_pass TEXT,
  smtp_secure BOOLEAN DEFAULT FALSE,
  auth_required BOOLEAN DEFAULT TRUE,
  connection_timeout INTEGER DEFAULT 10000,
  daily_limit INTEGER DEFAULT 1000,
  max_per_minute INTEGER DEFAULT 60,
  enable_queue BOOLEAN DEFAULT TRUE,
  enable_logging BOOLEAN DEFAULT TRUE,
  enable_retry BOOLEAN DEFAULT TRUE,
  retry_attempts INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 60000,
  enable_bounce_handling BOOLEAN DEFAULT FALSE,
  enable_tracking_pixel BOOLEAN DEFAULT FALSE,
  enable_click_tracking BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  subject TEXT,
  body TEXT,
  variables TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  template_id INTEGER REFERENCES email_templates(id),
  subject TEXT,
  body TEXT,
  status TEXT,
  error_message TEXT,
  retries INTEGER DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_queue (
  id SERIAL PRIMARY KEY,
  job_id TEXT,
  payload JSONB,
  status TEXT DEFAULT 'queued',
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  segments TEXT[],
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id SERIAL PRIMARY KEY,
  title TEXT,
  subject TEXT,
  body TEXT,
  sender_name TEXT,
  sender_email TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_rules (
  id SERIAL PRIMARY KEY,
  event_key TEXT UNIQUE NOT NULL,
  enable_email BOOLEAN DEFAULT TRUE,
  enable_internal BOOLEAN DEFAULT TRUE,
  enable_dashboard BOOLEAN DEFAULT TRUE,
  recipients TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheduled_emails (
  id SERIAL PRIMARY KEY,
  name TEXT,
  payload JSONB,
  cron_expression TEXT,
  next_run TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
