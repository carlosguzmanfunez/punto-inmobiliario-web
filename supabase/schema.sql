-- Esquema de Punto Inmobiliario Hn para Supabase.
-- Se aplica una sola vez en un proyecto nuevo (SQL Editor o migración).
-- Tres tipos de usuario: user (busca propiedades), seller (publica las suyas) y admin.

-- ---------- Perfiles y roles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'seller', 'admin')),
  created_at timestamptz not null default now()
);

-- Correos que se convierten en administradores al registrarse.
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_seller()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('seller', 'admin'));
$$;

-- ---------- Vendedores (datos públicos y vitrina) ----------
create table if not exists public.sellers (
  id uuid primary key references public.profiles(id) on delete cascade,
  slug text not null unique,
  name text not null,
  bio text not null default '',
  whatsapp text not null default '',
  city text not null default '',
  logo text not null default '',
  vitrina_until timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r text;
begin
  r := case
    when exists (select 1 from public.admin_emails a where lower(a.email) = lower(new.email)) then 'admin'
    when new.raw_user_meta_data->>'account_type' = 'vendedor' then 'seller'
    else 'user' end;
  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'phone', ''), r);
  if r = 'seller' then
    insert into public.sellers (id, slug, name, whatsapp)
    values (
      new.id, 'vendedor-' || substr(replace(new.id::text, '-', ''), 1, 8),
      coalesce(nullif(new.raw_user_meta_data->>'business_name', ''), new.raw_user_meta_data->>'full_name', 'Vendedor'),
      coalesce(new.raw_user_meta_data->>'phone', '')
    );
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Solo un administrador cambia roles; la única excepción es que un comprador
-- se convierta él mismo en vendedor.
create or replace function public.protect_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin()
     and not (old.role = 'user' and new.role = 'seller' and new.id = auth.uid()) then
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

-- La vitrina solo la activa un pago confirmado (o un administrador).
create or replace function public.protect_seller()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then new.vitrina_until := null;
    else new.vitrina_until := old.vitrina_until; new.id := old.id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists sellers_protect on public.sellers;
create trigger sellers_protect before insert or update on public.sellers
  for each row execute function public.protect_seller();

alter table public.sellers enable row level security;
create policy "vendedores públicos" on public.sellers for select using (true);
create policy "vendedor crea su ficha" on public.sellers for insert with check (id = auth.uid() and public.is_seller());
create policy "vendedor edita su ficha" on public.sellers for update using (id = auth.uid() or public.is_admin());

-- ---------- Propiedades ----------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  operation text not null check (operation in ('venta', 'alquiler')),
  type text not null check (type in ('casa', 'apartamento', 'terreno', 'local', 'oficina', 'bodega')),
  price numeric not null default 0,
  currency text not null default 'USD' check (currency in ('USD', 'HNL')),
  city text not null,
  department text not null default '',
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
  -- Publicaciones de vendedores. owner_id nulo = propiedad de Punto Inmobiliario.
  owner_id uuid references public.sellers(id) on delete cascade,
  status text not null default 'publicada' check (status in ('borrador', 'pendiente', 'publicada', 'pausada', 'rechazada')),
  paid_until timestamptz,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists properties_owner_idx on public.properties(owner_id);

-- El vendedor no puede darse visibilidad pagada: published, featured y paid_until
-- solo cambian con un pago confirmado o por un administrador.
create or replace function public.protect_listing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Las funciones internas del sistema (visitas, pagos) marcan app.system para saltar esta regla.
  if coalesce(current_setting('app.system', true), '') = 'on' then
    new.published := new.status = 'publicada';
    return new;
  end if;
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.owner_id := auth.uid(); new.featured := false; new.paid_until := null; new.views := 0;
      new.status := 'borrador';
    else
      new.owner_id := old.owner_id; new.featured := old.featured; new.paid_until := old.paid_until; new.views := old.views;
      if new.status is distinct from old.status then
        if not (
          (old.status = 'publicada' and new.status = 'pausada')
          or (old.status = 'pausada' and new.status = 'publicada' and old.paid_until >= now())
          or (old.status = 'rechazada' and new.status = 'borrador')
        ) then
          new.status := old.status;
        end if;
      end if;
    end if;
  end if;
  new.published := new.status = 'publicada';
  return new;
end $$;
drop trigger if exists properties_protect on public.properties;
create trigger properties_protect before insert or update on public.properties
  for each row execute function public.protect_listing();

alter table public.properties enable row level security;
create policy "ver publicadas, propias o admin" on public.properties for select using (
  (published and (owner_id is null or paid_until >= now())) or owner_id = auth.uid() or public.is_admin()
);
create policy "admin o vendedor crea" on public.properties for insert with check (public.is_admin() or (public.is_seller() and owner_id = auth.uid()));
create policy "admin o dueño edita" on public.properties for update using (public.is_admin() or owner_id = auth.uid());
create policy "admin o dueño borra" on public.properties for delete using (public.is_admin() or owner_id = auth.uid());

create or replace function public.record_view(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.system', 'on', true);
  update public.properties set views = views + 1 where id = p_id and published;
  perform set_config('app.system', 'off', true);
end $$;
grant execute on function public.record_view(uuid) to anon, authenticated;

-- ---------- Ajustes del negocio (precios de planes, tipo de cambio, datos bancarios) ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'
);
insert into public.settings (id, data) values (1, '{"usdRate": 26.3, "prices": {"publicacion": 590, "destacada": 990, "vitrina": 2490}, "bankInfo": ""}')
  on conflict (id) do nothing;
alter table public.settings enable row level security;
create policy "ajustes públicos" on public.settings for select using (true);
create policy "admin edita ajustes" on public.settings for update using (public.is_admin());
create policy "admin crea ajustes" on public.settings for insert with check (public.is_admin());

-- ---------- Pagos de planes ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  kind text not null check (kind in ('publicacion', 'destacada', 'vitrina')),
  property_id uuid references public.properties(id) on delete set null,
  amount numeric not null default 0,
  reference text not null default '',
  status text not null default 'pendiente' check (status in ('pendiente', 'pagado', 'rechazado')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
alter table public.payments enable row level security;
create policy "vendedor ve sus pagos" on public.payments for select using (seller_id = auth.uid() or public.is_admin());
create policy "vendedor solicita pago" on public.payments for insert with check (
  seller_id = auth.uid() and status = 'pendiente' and confirmed_at is null
  and (property_id is null or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()))
);

-- El monto lo pone la base de datos según los precios vigentes, nunca el navegador.
create or replace function public.payment_amount()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select coalesce((data->'prices'->>new.kind)::numeric, 0) into new.amount from public.settings where id = 1;
  return new;
end $$;
drop trigger if exists payments_amount on public.payments;
create trigger payments_amount before insert on public.payments
  for each row execute function public.payment_amount();

-- Al pedir el pago, la publicación pasa a "pendiente".
create or replace function public.payment_requested()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.property_id is not null then
    perform set_config('app.system', 'on', true);
    update public.properties set status = 'pendiente'
      where id = new.property_id and status in ('borrador', 'rechazada', 'pendiente');
    perform set_config('app.system', 'off', true);
  end if;
  return new;
end $$;
drop trigger if exists payments_requested on public.payments;
create trigger payments_requested after insert on public.payments
  for each row execute function public.payment_requested();

-- El administrador confirma o rechaza; confirmar activa la publicación o la vitrina por 30 días.
create or replace function public.confirm_payment(p_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  pay public.payments;
begin
  if not public.is_admin() then raise exception 'Solo para administradores'; end if;
  select * into pay from public.payments where id = p_id for update;
  if pay.id is null or pay.status <> 'pendiente' then raise exception 'Ese pago ya fue procesado'; end if;
  update public.payments set status = case when p_approve then 'pagado' else 'rechazado' end, confirmed_at = now() where id = p_id;
  if not p_approve then
    update public.properties set status = 'rechazada' where id = pay.property_id and status = 'pendiente';
  elsif pay.kind = 'vitrina' then
    update public.sellers set vitrina_until = greatest(coalesce(vitrina_until, now()), now()) + interval '30 days' where id = pay.seller_id;
  else
    update public.properties set
      status = 'publicada',
      featured = pay.kind = 'destacada',
      paid_until = greatest(coalesce(paid_until, now()), now()) + interval '30 days'
    where id = pay.property_id;
  end if;
end $$;
grant execute on function public.confirm_payment(uuid, boolean) to authenticated;

-- ---------- Búsquedas guardadas ----------
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mi búsqueda',
  query text not null,
  created_at timestamptz not null default now(),
  unique (user_id, query)
);
alter table public.saved_searches enable row level security;
create policy "búsquedas propias" on public.saved_searches for all using (user_id = auth.uid()) with check (user_id = auth.uid());

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

create or replace function public.owns_property(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.properties where id = p_id and owner_id = auth.uid());
$$;

create policy "cualquiera consulta" on public.inquiries for insert with check (user_id is null or user_id = auth.uid());
create policy "ver consultas propias, recibidas o admin" on public.inquiries for select using (
  user_id = auth.uid() or public.owns_property(property_id) or public.is_admin()
);
create policy "admin o vendedor actualiza consultas" on public.inquiries for update using (public.is_admin() or public.owns_property(property_id));
create policy "admin borra consultas" on public.inquiries for delete using (public.is_admin());

-- ---------- Fotos ----------
insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true)
  on conflict (id) do nothing;
create policy "admin y vendedores suben fotos" on storage.objects for insert with check (bucket_id = 'property-images' and public.is_seller());
create policy "admin borra fotos" on storage.objects for delete using (bucket_id = 'property-images' and public.is_admin());
