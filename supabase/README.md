# DueWell — Supabase setup

## 1. Run the schema

1. Open your project → **SQL Editor** → **New query**.
2. Paste the full contents of [`schema.sql`](./schema.sql) and click **Run**.
3. You should see `Success. No rows returned`.

This creates the `bills` and `payments` tables, indexes, an `updated_at`
trigger, **Row Level Security** policies (each user can only touch their own
rows), and the `mark_bill_paid()` function used for payment tracking.

## 2. Verify RLS is on

**Database → Tables** → `bills` and `payments` should each show the
**RLS enabled** shield. **Authentication → Policies** should list 4 policies
per table.

## 3. Auth settings (for Phase 3)

**Authentication → Providers → Email** is enabled by default. For easy local
testing you can turn **"Confirm email"** *off* (Authentication → Sign In / Up)
so signups log in immediately. Leave it **on** for production and users will
get a confirmation email first.

## Data model

```
bills                          payments
------                         --------
id           uuid pk           id           uuid pk
user_id      uuid  ──┐         bill_id      uuid ── bills.id
name         text    │         user_id      uuid  ─ auth.users.id
amount       numeric │         amount_paid  numeric
due_date     date    │         paid_date    date
category     text    │         created_at   timestamptz
recurrence   text    │
status       text    │
created_at   ts      │
updated_at   ts      │
             auth.users.id
```

Recurring bills stay as a single living `bills` row whose `due_date` rolls
forward each time `mark_bill_paid()` is called; every payment is appended to
`payments`, so history is never lost.
