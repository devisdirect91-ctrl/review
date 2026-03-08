-- ============================================================
-- ReviewBoost – Schéma principal
-- ============================================================

-- ------------------------------------------------------------
-- 1. ESTABLISHMENTS
-- ------------------------------------------------------------
create table if not exists public.establishments (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users on delete cascade,
  name              text        not null,
  short_code        text        not null unique,
  google_review_url text,
  current_rating    decimal(2,1),
  total_reviews     integer     not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.establishments enable row level security;

-- Un utilisateur ne voit que ses établissements
create policy "establishments_select_own"
  on public.establishments for select
  using (auth.uid() = user_id);

-- Lecture publique par short_code (page de collecte /r/[code])
create policy "establishments_select_by_code"
  on public.establishments for select
  using (true);

create policy "establishments_insert_own"
  on public.establishments for insert
  with check (auth.uid() = user_id);

create policy "establishments_update_own"
  on public.establishments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "establishments_delete_own"
  on public.establishments for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 2. FEEDBACKS
-- ------------------------------------------------------------
create table if not exists public.feedbacks (
  id                   uuid        primary key default gen_random_uuid(),
  establishment_id     uuid        not null references public.establishments on delete cascade,
  rating               integer     not null check (rating between 1 and 5),
  comment              text,
  customer_email       text,
  redirected_to_google boolean     not null default false,
  created_at           timestamptz not null default now()
);

alter table public.feedbacks enable row level security;

-- Le propriétaire de l'établissement voit ses feedbacks
create policy "feedbacks_select_own"
  on public.feedbacks for select
  using (
    exists (
      select 1 from public.establishments e
      where e.id = feedbacks.establishment_id
        and e.user_id = auth.uid()
    )
  );

-- Insertion publique (clients anonymes via la page de collecte)
create policy "feedbacks_insert_public"
  on public.feedbacks for insert
  with check (true);

-- Mise à jour publique (pour cocher redirected_to_google après redirection)
create policy "feedbacks_update_redirect"
  on public.feedbacks for update
  using (true)
  with check (true);

-- ------------------------------------------------------------
-- 3. SCANS
-- ------------------------------------------------------------
create table if not exists public.scans (
  id               uuid        primary key default gen_random_uuid(),
  establishment_id uuid        not null references public.establishments on delete cascade,
  scanned_at       timestamptz not null default now()
);

alter table public.scans enable row level security;

-- Le propriétaire voit les scans de ses établissements
create policy "scans_select_own"
  on public.scans for select
  using (
    exists (
      select 1 from public.establishments e
      where e.id = scans.establishment_id
        and e.user_id = auth.uid()
    )
  );

-- Insertion publique (déclenché à chaque scan de QR code)
create policy "scans_insert_public"
  on public.scans for insert
  with check (true);

-- ------------------------------------------------------------
-- 4. FONCTION : mise à jour automatique du rating
-- ------------------------------------------------------------
create or replace function public.update_establishment_rating()
returns trigger as $$
begin
  update public.establishments
  set
    current_rating = (
      select round(avg(rating)::numeric, 1)
      from public.feedbacks
      where establishment_id = new.establishment_id
    ),
    total_reviews = (
      select count(*)
      from public.feedbacks
      where establishment_id = new.establishment_id
    )
  where id = new.establishment_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_feedback_inserted
  after insert on public.feedbacks
  for each row execute procedure public.update_establishment_rating();

-- ------------------------------------------------------------
-- 5. INDEX (performances)
-- ------------------------------------------------------------
create index if not exists establishments_user_id_idx
  on public.establishments (user_id);

create index if not exists establishments_short_code_idx
  on public.establishments (short_code);

create index if not exists feedbacks_establishment_id_idx
  on public.feedbacks (establishment_id);

create index if not exists feedbacks_created_at_idx
  on public.feedbacks (created_at desc);

create index if not exists scans_establishment_id_idx
  on public.scans (establishment_id);

create index if not exists scans_scanned_at_idx
  on public.scans (scanned_at desc);
