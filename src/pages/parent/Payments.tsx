import { format, parseISO } from 'date-fns'
import { useState } from 'react'
import { Badge, Button, Card, Empty, SectionTitle } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { inr } from '../../lib/cn'
import { currentStudent, feeSummary, initiatePayment, loadDB, verifyPaymentOnServer } from '../../lib/store'

export default function Payments() {
  const { session } = useApp()
  const db = loadDB()
  const student = session ? currentStudent(session) : null
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  if (!student) return <Empty title="No student selected" />
  const sum = feeSummary(student.id)
  async function pay() {
    setBusy(true); setMsg('')
    const created = initiatePayment(student!.id, Math.min(sum.due, 5000), 'upi')
    await new Promise((r) => setTimeout(r, 700))
    verifyPaymentOnServer(created.id, 'success')
    setMsg('Payment verified by the gateway. Receipt issued.')
    setBusy(false)
  }
  return (
    <div className="space-y-4">
      <Card className="bg-slate-950 text-white">
        <p className="text-xs uppercase tracking-wide text-slate-400">Fee summary</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div><p className="text-[11px] text-slate-400">Total</p><p className="font-bold">{inr(sum.total)}</p></div>
          <div><p className="text-[11px] text-slate-400">Paid</p><p className="font-bold text-emerald-300">{inr(sum.paid)}</p></div>
          <div><p className="text-[11px] text-slate-400">Due</p><p className="font-bold text-amber-300">{inr(sum.due)}</p></div>
        </div>
        {sum.due > 0 && (
          <Button className="mt-4 w-full bg-white text-slate-900 hover:bg-slate-100" onClick={pay} disabled={busy}>
            {busy ? 'Verifying with gateway…' : `Pay ${inr(Math.min(sum.due, 5000))} now`}
          </Button>
        )}
        {msg && <p className="mt-2 text-xs text-emerald-200">{msg}</p>}
        <p className="mt-2 text-[11px] text-slate-400">The device never marks a payment successful. A server-style verify step issues the receipt.</p>
      </Card>
      <SectionTitle title="Charges" />
      {sum.charges.map((c) => {
        const fs = db.feeStructures.find((f) => f.id === c.feeStructureId)
        return (
          <Card key={c.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{fs?.name ?? 'Fee'}</p>
              <p className="text-xs capitalize text-slate-500">{fs?.category} · {(fs?.schedule ?? '').replace('_', ' ')}</p>
            </div>
            <p className="font-bold">{inr(c.amount)}</p>
          </Card>
        )
      })}
      <SectionTitle title="Payment history" />
      {db.payments.filter((p) => p.studentId === student.id).map((p) => (
        <Card key={p.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{inr(p.amount)}</p>
              <p className="text-xs text-slate-500">{format(parseISO(p.createdAt), 'd MMM yyyy, h:mm a')} · {p.method} · {p.gateway}</p>
              {p.receiptNo && <p className="text-xs text-cyan-700">{p.receiptNo}</p>}
            </div>
            <Badge tone={p.status === 'success' ? 'emerald' : p.status === 'failed' ? 'rose' : 'amber'}>{p.status}</Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
