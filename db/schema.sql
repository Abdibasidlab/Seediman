-- SeedIman MVP. Only the server (api/) reads or writes these tables.
-- A child's name is never stored here.
create table if not exists seediman_events (
  id bigserial primary key,
  device_id text not null,
  user_id text,
  event text not null,
  topic text,
  level int,
  phase text,
  role text,
  age int,
  stars int,
  created_at timestamptz not null default now()
);
create index if not exists seediman_events_device on seediman_events (device_id);
create index if not exists seediman_events_created on seediman_events (created_at desc);

create table if not exists seediman_ratings (
  id bigserial primary key,
  device_id text not null,
  user_id text,
  display_name text,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists seediman_progress (
  user_id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table seediman_ratings add column if not exists role text;
