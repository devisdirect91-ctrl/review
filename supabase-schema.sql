-- ============================================================
-- ReviewBoost – Schéma Supabase
-- ============================================================

-- Profils utilisateurs (lie auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Les utilisateurs voient leur propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Les utilisateurs modifient leur propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger pour créer un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Restaurants
create table public.restaurants (
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

create policy "Les propriétaires voient leurs restaurants"
  on public.restaurants for select
  using (auth.uid() = owner_id);

create policy "Les propriétaires créent leurs restaurants"
  on public.restaurants for insert
  with check (auth.uid() = owner_id);

create policy "Les propriétaires modifient leurs restaurants"
  on public.restaurants for update
  using (auth.uid() = owner_id);

create policy "Les propriétaires suppriment leurs restaurants"
  on public.restaurants for delete
  using (auth.uid() = owner_id);

-- Lecture publique par code (pour la page de collecte)
create policy "Lecture publique par code"
  on public.restaurants for select
  using (true);

-- Avis (feedbacks)
create table public.feedbacks (
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

-- Les propriétaires lisent les avis de leurs restaurants
create policy "Les propriétaires lisent leurs avis"
  on public.feedbacks for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = feedbacks.restaurant_id
        and r.owner_id = auth.uid()
    )
  );

-- Insertion publique (clients anonymes)
create policy "Insertion publique d'avis"
  on public.feedbacks for insert
  with check (true);

-- Mise à jour publique (pour marquer la redirection Google)
create policy "Mise à jour publique redirection"
  on public.feedbacks for update
  using (true)
  with check (true);

-- Index pour les performances
create index feedbacks_restaurant_id_idx on public.feedbacks (restaurant_id);
create index feedbacks_created_at_idx on public.feedbacks (created_at desc);
create index restaurants_collect_code_idx on public.restaurants (collect_code);
