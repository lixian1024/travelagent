create table public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New issue',
  status text not null default 'active',
  turn_count integer not null default 0,
  last_message_preview text not null default '',
  search_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_conversations_title_length check (char_length(title) between 1 and 120),
  constraint agent_conversations_status check (
    status in ('active', 'resolved', 'needs_human', 'archived')
  ),
  constraint agent_conversations_turn_count check (turn_count >= 0)
);

create table public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.agent_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  has_image boolean not null default false,
  used_web_search boolean not null default false,
  model text,
  created_at timestamptz not null default now(),
  constraint agent_messages_role check (role in ('user', 'assistant')),
  constraint agent_messages_content_length check (char_length(content) between 1 and 4000)
);

create index agent_conversations_user_recent_idx
on public.agent_conversations (user_id, updated_at desc);

create index agent_messages_conversation_created_idx
on public.agent_messages (conversation_id, created_at);

alter table public.agent_conversations enable row level security;
alter table public.agent_messages enable row level security;

revoke all on table public.agent_conversations from anon, authenticated;
revoke all on table public.agent_messages from anon, authenticated;

grant select, insert, update, delete on table public.agent_conversations to authenticated;
grant select, insert, update, delete on table public.agent_messages to authenticated;

create policy "Users can read their own agent conversations"
on public.agent_conversations
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own agent conversations"
on public.agent_conversations
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own agent conversations"
on public.agent_conversations
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own agent conversations"
on public.agent_conversations
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own agent messages"
on public.agent_messages
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own agent messages"
on public.agent_messages
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.agent_conversations
    where id = conversation_id
      and user_id = (select auth.uid())
  )
);

create policy "Users can update their own agent messages"
on public.agent_messages
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own agent messages"
on public.agent_messages
for delete
to authenticated
using ((select auth.uid()) = user_id);
