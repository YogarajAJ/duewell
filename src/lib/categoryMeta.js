import {
  Home,
  Zap,
  Wifi,
  CreditCard,
  Car,
  ShoppingCart,
  HeartPulse,
  Landmark,
  Receipt,
} from 'lucide-react'

// Category → icon + tint classes. Keep keys in sync with lib/categories.js.
export const CATEGORY_META = {
  Housing: { Icon: Home, tint: 'bg-indigo-100 text-indigo-700' },
  Utilities: { Icon: Zap, tint: 'bg-amber-100 text-amber-700' },
  Internet: { Icon: Wifi, tint: 'bg-sky-100 text-sky-700' },
  Loan: { Icon: Landmark, tint: 'bg-rose-100 text-rose-700' },
  Card: { Icon: CreditCard, tint: 'bg-violet-100 text-violet-700' },
  Transport: { Icon: Car, tint: 'bg-cyan-100 text-cyan-700' },
  Shopping: { Icon: ShoppingCart, tint: 'bg-pink-100 text-pink-700' },
  Health: { Icon: HeartPulse, tint: 'bg-emerald-100 text-emerald-700' },
  Subscription: { Icon: Receipt, tint: 'bg-teal-100 text-teal-700' },
}

export function categoryMeta(category) {
  return (
    CATEGORY_META[category] ?? { Icon: Receipt, tint: 'bg-ink-100 text-ink-600' }
  )
}
