-- GOJIKKA: users, parent_profiles, conversations

create table users (
  id uuid primary key default gen_random_uuid(),
  line_user_id text unique not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table parent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  consult_target text,
  name text,
  age text,
  personality text,
  relationship text,
  hobbies text,
  avoid_topics text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index conversations_user_id_created_at
  on conversations(user_id, created_at);
