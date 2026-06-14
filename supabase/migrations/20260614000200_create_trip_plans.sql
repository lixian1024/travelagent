create table public.trip_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  start_date date,
  timezone text not null default 'Asia/Shanghai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_plans_timezone_length check (char_length(timezone) between 1 and 80)
);

create table public.trip_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  city text not null,
  title text not null,
  location text not null default '',
  category text not null default 'activity',
  notes text not null default '',
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_itinerary_items_city_length check (char_length(city) between 1 and 100),
  constraint trip_itinerary_items_title_length check (char_length(title) between 1 and 160),
  constraint trip_itinerary_items_location_length check (char_length(location) <= 240),
  constraint trip_itinerary_items_notes_length check (char_length(notes) <= 1000),
  constraint trip_itinerary_items_category check (
    category in ('transport', 'attraction', 'food', 'hotel', 'activity')
  ),
  constraint trip_itinerary_items_status check (
    status in ('planned', 'done', 'skipped')
  )
);

create index trip_itinerary_items_user_schedule_idx
on public.trip_itinerary_items (user_id, scheduled_at);

alter table public.trip_plans enable row level security;
alter table public.trip_itinerary_items enable row level security;

revoke all on table public.trip_plans from anon, authenticated;
revoke all on table public.trip_itinerary_items from anon, authenticated;

grant select, insert, update, delete on table public.trip_plans to authenticated;
grant select, insert, update, delete on table public.trip_itinerary_items to authenticated;

create policy "Users can read their own trip plan"
on public.trip_plans for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own trip plan"
on public.trip_plans for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own trip plan"
on public.trip_plans for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own trip plan"
on public.trip_plans for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own itinerary items"
on public.trip_itinerary_items for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own itinerary items"
on public.trip_itinerary_items for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own itinerary items"
on public.trip_itinerary_items for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own itinerary items"
on public.trip_itinerary_items for delete to authenticated
using ((select auth.uid()) = user_id);
