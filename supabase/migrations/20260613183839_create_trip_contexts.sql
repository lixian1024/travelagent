create table public.trip_contexts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  device text not null default '',
  network text not null default '',
  payment_methods text[] not null default '{}',
  food_needs text[] not null default '{}',
  spice_level text not null default '',
  trip_days smallint not null default 1,
  traveler_count smallint not null default 1,
  cities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_contexts_device_length check (char_length(device) <= 100),
  constraint trip_contexts_network_length check (char_length(network) <= 100),
  constraint trip_contexts_spice_level_length check (char_length(spice_level) <= 100),
  constraint trip_contexts_trip_days_range check (trip_days between 1 and 365),
  constraint trip_contexts_traveler_count_range check (traveler_count between 1 and 50),
  constraint trip_contexts_payment_methods_count check (cardinality(payment_methods) <= 20),
  constraint trip_contexts_food_needs_count check (cardinality(food_needs) <= 20),
  constraint trip_contexts_cities_count check (cardinality(cities) <= 50)
);

alter table public.trip_contexts enable row level security;

grant select, insert, update on table public.trip_contexts to authenticated;

create policy "Users can read their own trip context"
on public.trip_contexts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own trip context"
on public.trip_contexts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own trip context"
on public.trip_contexts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
