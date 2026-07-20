-- ============================================================================
--  DueWell — database schema + Row Level Security
--  Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
--  Safe to re-run: it drops/recreates policies and uses IF NOT EXISTS.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------------

-- Bills / loans. One row per bill. For recurring bills this row is the
-- "living" record — its due_date rolls forward each time it's paid, while a
-- payment row is written to history (see mark_bill_paid below).
create table if not exists public.bills (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name        text not null check (char_length(name) between 1 and 120),
  amount      numeric(12, 2) not null check (amount >= 0),
  due_date    date not null,
  category    text not null default 'Other',
  recurrence  text not null default 'monthly' check (recurrence in ('monthly', 'one-time')),
  status      text not null default 'pending' check (status in ('pending', 'paid')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Payment history. Each mark-as-paid appends a row here so history survives
-- even as a recurring bill's due_date advances.
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  bill_id      uuid not null references public.bills (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  amount_paid  numeric(12, 2) not null check (amount_paid >= 0),
  paid_date    date not null default current_date,
  created_at   timestamptz not null default now()
);

-- Helpful indexes for the pending-bills view and dashboard queries.
create index if not exists bills_user_due_idx     on public.bills (user_id, due_date);
create index if not exists bills_user_status_idx  on public.bills (user_id, status);
create index if not exists payments_user_date_idx on public.payments (user_id, paid_date);
create index if not exists payments_bill_idx      on public.payments (bill_id);

-- ---------------------------------------------------------------------------
--  updated_at trigger for bills
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bills_set_updated_at on public.bills;
create trigger bills_set_updated_at
  before update on public.bills
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
--  Row Level Security — each user sees ONLY their own rows
-- ---------------------------------------------------------------------------
alter table public.bills    enable row level security;
alter table public.payments enable row level security;

-- bills policies
drop policy if exists "bills: select own"  on public.bills;
drop policy if exists "bills: insert own"  on public.bills;
drop policy if exists "bills: update own"  on public.bills;
drop policy if exists "bills: delete own"  on public.bills;

create policy "bills: select own" on public.bills
  for select using (auth.uid() = user_id);

create policy "bills: insert own" on public.bills
  for insert with check (auth.uid() = user_id);

create policy "bills: update own" on public.bills
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bills: delete own" on public.bills
  for delete using (auth.uid() = user_id);

-- payments policies
drop policy if exists "payments: select own" on public.payments;
drop policy if exists "payments: insert own" on public.payments;
drop policy if exists "payments: update own" on public.payments;
drop policy if exists "payments: delete own" on public.payments;

create policy "payments: select own" on public.payments
  for select using (auth.uid() = user_id);

-- On insert, require the row belongs to the caller AND references a bill the
-- caller owns — prevents attaching a payment to someone else's bill.
create policy "payments: insert own" on public.payments
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.bills b
      where b.id = bill_id and b.user_id = auth.uid()
    )
  );

create policy "payments: update own" on public.payments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "payments: delete own" on public.payments
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
--  mark_bill_paid — atomic "pay" operation used in Phase 5
--
--  Writes a payment row, then:
--    • monthly  → rolls due_date forward one month, keeps status 'pending'
--                 (so the recurring bill stays alive and history accumulates)
--    • one-time → sets status = 'paid'
--
--  Runs with the caller's rights (SECURITY INVOKER, the default), so RLS is
--  still enforced — a user can only pay their own bills.
-- ---------------------------------------------------------------------------
create or replace function public.mark_bill_paid(
  p_bill_id uuid,
  p_amount  numeric default null,
  p_paid_on date default current_date
)
returns public.bills
language plpgsql
as $$
declare
  v_bill    public.bills;
  v_amount  numeric(12, 2);
begin
  -- RLS ensures this only finds a bill the caller owns.
  select * into v_bill from public.bills where id = p_bill_id;
  if not found then
    raise exception 'Bill not found or not accessible';
  end if;

  v_amount := coalesce(p_amount, v_bill.amount);

  insert into public.payments (bill_id, user_id, amount_paid, paid_date)
  values (v_bill.id, v_bill.user_id, v_amount, p_paid_on);

  if v_bill.recurrence = 'monthly' then
    update public.bills
      set due_date = (v_bill.due_date + interval '1 month')::date,
          status   = 'pending'
      where id = v_bill.id
      returning * into v_bill;
  else
    update public.bills
      set status = 'paid'
      where id = v_bill.id
      returning * into v_bill;
  end if;

  return v_bill;
end;
$$;
