create table if not exists contact_submissions (
  id bigserial primary key,
  name text not null,
  email text not null,
  organization text,
  interest text,
  message text not null,
  submitted_at timestamptz not null default now()
);

create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Optional: store the profile JSON in Neon instead of data/profile.json.
-- Insert a row with key = 'profile' and value = the JSON object from data/profile.json.
