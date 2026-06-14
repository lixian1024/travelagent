alter table public.agent_conversations
add column session_type text not null default 'problem',
add column context_snapshot jsonb not null default '{}'::jsonb;

alter table public.agent_conversations
add constraint agent_conversations_session_type check (
  session_type in ('problem', 'sight', 'menu', 'sign', 'driver')
),
add constraint agent_conversations_context_object check (
  jsonb_typeof(context_snapshot) = 'object'
),
add constraint agent_conversations_context_size check (
  octet_length(context_snapshot::text) <= 16000
);

alter table public.agent_conversations
alter column title set default 'New session';

update public.agent_conversations
set title = 'New session'
where title = 'New issue';

create index agent_conversations_user_type_recent_idx
on public.agent_conversations (user_id, session_type, updated_at desc);
