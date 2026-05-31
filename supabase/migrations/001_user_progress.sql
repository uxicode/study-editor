-- 회원 진행 상황 저장 테이블 (auth.users 와 1:1)
create table public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_steps text[] not null default '{}',
  current_step text not null default 'week-1-1',
  attempts jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "Users read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);
