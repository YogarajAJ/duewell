import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/cn'

const CONFIG = {
  paid: { cls: 'pill-paid', Icon: CheckCircle2, label: 'Paid' },
  pending: { cls: 'pill-pending', Icon: Clock, label: 'Pending' },
  overdue: { cls: 'pill-overdue', Icon: AlertTriangle, label: 'Overdue' },
}

export default function StatusPill({ status, className }) {
  const { cls, Icon, label } = CONFIG[status] ?? CONFIG.pending
  return (
    <span className={cn(cls, className)}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {label}
    </span>
  )
}
