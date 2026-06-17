-- Profiles table (extends Supabase's built-in auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now()
);

-- Learning progress: one row per user per topic
create table learning_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic text not null,
  mastery_level text default 'beginner',
  concepts_covered jsonb default '[]'::jsonb,
  last_score int,
  updated_at timestamptz default now(),
  unique (user_id, topic)
);

-- Conversation history: each tutor exchange saved
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic text not null,
  messages jsonb not null,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table learning_progress enable row level security;
alter table conversations enable row level security;

-- Users can only see and edit their OWN rows
create policy "Users manage own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users manage own progress"
  on learning_progress for all using (auth.uid() = user_id);

create policy "Users manage own conversations"
  on conversations for all using (auth.uid() = user_id);

-- Auto-create a profile when someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
