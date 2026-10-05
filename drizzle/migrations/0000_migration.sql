create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.admin_emails (email text primary key);
grant all on public.admin_emails to service_role;
alter table public.admin_emails enable row level security;
insert into public.admin_emails (email) values ('thalytan876@gmail.com');

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = public as $$
declare _email text; _confirmed timestamptz;
begin
  if auth.uid() is null then return false; end if;
  select lower(email), email_confirmed_at into _email, _confirmed from auth.users where id = auth.uid();
  if _confirmed is null then return false; end if;
  if exists (select 1 from public.admin_emails where lower(email) = _email) then
    insert into public.user_roles (user_id, role) values (auth.uid(), 'admin') on conflict do nothing;
    return true;
  end if;
  return public.has_role(auth.uid(), 'admin');
end $$;
revoke all on function public.claim_admin() from public, anon;
grant execute on function public.claim_admin() to authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "admin write categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0 check (price >= 0),
  image text,
  available boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read products" on public.products for select to anon, authenticated using (true);
create policy "admin write products" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create table public.restaurant_settings (
  id int primary key default 1 check (id = 1),
  restaurant_name text not null default 'Restaurante Koruja''s',
  tagline text not null default 'Sabor caseiro, feito com carinho.',
  logo text,
  cover_image text,
  whatsapp text not null default '5521968869897',
  address text not null default '',
  opening_hours text not null default '',
  instagram text not null default '',
  google_maps text not null default 'https://www.google.com/maps/place/Restaurante+Koruja''s/',
  updated_at timestamptz not null default now()
);
grant select on public.restaurant_settings to anon, authenticated;
grant update on public.restaurant_settings to authenticated;
grant all on public.restaurant_settings to service_role;
alter table public.restaurant_settings enable row level security;
create policy "public read settings" on public.restaurant_settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.restaurant_settings for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger settings_touch before update on public.restaurant_settings for each row execute function public.touch_updated_at();
insert into public.restaurant_settings (id) values (1);

insert into public.categories (name, sort_order) values
 ('Pratos',1),('Refeições',2),('Lanches',3),('Porções',4),('Acompanhamentos',5),('Bebidas',6),('Sobremesas',7);

insert into public.products (category_id, name, description, price, featured)
select c.id, p.name, p.descr, p.price, p.featured from (values
 ('Pratos','[Exemplo] Prato da casa','Produto demonstrativo — edite no painel com o prato real.',0.00,true),
 ('Refeições','[Exemplo] Refeição completa','Produto demonstrativo — edite no painel.',0.00,false),
 ('Lanches','[Exemplo] Lanche especial','Produto demonstrativo — edite no painel.',0.00,true),
 ('Porções','[Exemplo] Porção para compartilhar','Produto demonstrativo — edite no painel.',0.00,false),
 ('Acompanhamentos','[Exemplo] Acompanhamento','Produto demonstrativo — edite no painel.',0.00,false),
 ('Bebidas','[Exemplo] Bebida','Produto demonstrativo — edite no painel.',0.00,false),
 ('Sobremesas','[Exemplo] Sobremesa','Produto demonstrativo — edite no painel.',0.00,false)
) as p(cat,name,descr,price,featured) join public.categories c on c.name = p.cat;

create policy "read menu images" on storage.objects for select to anon, authenticated using (bucket_id = 'menu');
create policy "admin upload menu images" on storage.objects for insert to authenticated with check (bucket_id = 'menu' and public.has_role(auth.uid(),'admin'));
create policy "admin update menu images" on storage.objects for update to authenticated using (bucket_id = 'menu' and public.has_role(auth.uid(),'admin'));
create policy "admin delete menu images" on storage.objects for delete to authenticated using (bucket_id = 'menu' and public.has_role(auth.uid(),'admin'));