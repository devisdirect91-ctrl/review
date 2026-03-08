-- ============================================================
-- ReviewBoost – Migration initiale
-- ============================================================

-- Profils utilisateurs
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger auto-création profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Restaurants
create table if not exists public.restaurants (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  google_place_id text,
  google_review_url text,
  collect_code text unique not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.restaurants enable row level security;

create policy "restaurants_select_owner"
  on public.restaurants for select
  using (auth.uid() = owner_id);

create policy "restaurants_select_public"
  on public.restaurants for select
  using (true);

create policy "restaurants_insert_owner"
  on public.restaurants for insert
  with check (auth.uid() = owner_id);

create policy "restaurants_update_owner"
  on public.restaurants for update
  using (auth.uid() = owner_id);

create policy "restaurants_delete_owner"
  on public.restaurants for delete
  using (auth.uid() = owner_id);

-- Avis clients
create table if not exists public.feedbacks (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants on delete cascade not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  customer_name text,
  customer_email text,
  redirected_to_google boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.feedbacks enable row level security;

create policy "feedbacks_select_owner"
  on public.feedbacks for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = feedbacks.restaurant_id
        and r.owner_id = auth.uid()
    )
  );

create policy "feedbacks_insert_public"
  on public.feedbacks for insert
  with check (true);

create policy "feedbacks_update_public"
  on public.feedbacks for update
  using (true)
  with check (true);

-- Index
create index if not exists feedbacks_restaurant_id_idx on public.feedbacks (restaurant_id);
create index if not exists feedbacks_created_at_idx on public.feedbacks (created_at desc);
create index if not exists restaurants_collect_code_idx on public.restaurants (collect_code);
create index if not exists restaurants_owner_id_idx on public.restaurants (owner_id);
