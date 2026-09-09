import { Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { inr } from '../../lib/cn'
import { loadDB } from '../../lib/store'

export default function AdminFees() {
  const { session } = useApp()
  const db = loadDB()
  const structures = db.feeStructures.filter((f) => f.schoolId === session?.schoolId)
  const pays = db.payments.filter((p) => p.schoolId === session?.schoolId)
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <h2 className="font-bold">Fee structures</h2>
        {structures.map((f) => (
          <Card key={f.id} className="flex items-center justify-between">
            <div><p className="font-semibold">{f.name}</p><p className="text-xs capitalize text-slate-500">{f.category} · {f.schedule.replace('_',' ')}</p></div>
            <p className="font-bold">{inr(f.amount)}</p>
          </Card>
        ))}
      </div>
      <div className="space-y-2">
        <h2 className="font-bold">Recent payments</h2>
        {pays.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div><p className="font-semibold">{inr(p.amount)}</p><p className="text-xs">{p.status} · {p.gateway}</p></div>
            <p className="text-xs text-slate-400">{p.receiptNo}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
