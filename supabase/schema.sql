-- Esquema de Punto Inmobiliario Hn para Supabase.
-- Se aplica una sola vez en un proyecto nuevo (SQL Editor o migración).

-- ---------- Perfiles y roles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Correos que se convierten en administradores al registrarse.
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case when exists (select 1 from public.admin_emails a where lower(a.email) = lower(new.email)) then 'admin' else 'user' end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un usuario normal no puede cambiarse el rol a sí mismo.
create or replace function public.protect_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar roles';
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

alter table public.profiles enable row level security;
create policy "perfil propio o admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "editar perfil propio o admin" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- ---------- Propiedades ----------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  operation text not null check (operation in ('venta', 'alquiler')),
  type text not null check (type in ('casa', 'apartamento', 'terreno', 'local')),
  price numeric not null default 0,
  currency text not null default 'USD' check (currency in ('USD', 'HNL')),
  city text not null,
  neighborhood text not null default '',
  bedrooms int not null default 0,
  bathrooms numeric not null default 0,
  area_m2 numeric not null default 0,
  lot_m2 numeric,
  parking int not null default 0,
  images text[] not null default '{}',
  features text[] not null default '{}',
  description text not null default '',
  is_new boolean not null default false,
  featured boolean not null default false,
  published boolean not null default true,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.properties enable row level security;
create policy "ver publicadas" on public.properties for select using (published or public.is_admin());
create policy "admin crea" on public.properties for insert with check (public.is_admin());
create policy "admin edita" on public.properties for update using (public.is_admin());
create policy "admin borra" on public.properties for delete using (public.is_admin());

create or replace function public.record_view(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.properties set views = views + 1 where id = p_id and published;
$$;
grant execute on function public.record_view(uuid) to anon, authenticated;

-- ---------- Favoritos ----------
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
alter table public.favorites enable row level security;
create policy "favoritos propios" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin ve favoritos" on public.favorites for select using (public.is_admin());

-- ---------- Consultas ----------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null default '',
  phone text not null default '',
  message text not null,
  status text not null default 'nueva' check (status in ('nueva', 'en_proceso', 'cerrada')),
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
create policy "cualquiera consulta" on public.inquiries for insert with check (user_id is null or user_id = auth.uid());
create policy "ver consultas propias o admin" on public.inquiries for select using (user_id = auth.uid() or public.is_admin());
create policy "admin actualiza consultas" on public.inquiries for update using (public.is_admin());
create policy "admin borra consultas" on public.inquiries for delete using (public.is_admin());

-- ---------- Fotos ----------
insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true)
  on conflict (id) do nothing;
create policy "admin sube fotos" on storage.objects for insert with check (bucket_id = 'property-images' and public.is_admin());
create policy "admin borra fotos" on storage.objects for delete using (bucket_id = 'property-images' and public.is_admin());
