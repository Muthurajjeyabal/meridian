import { Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { loadDB } from '../../lib/store'

export default function AdminSettings() {
  const { session } = useApp()
  const school = loadDB().schools.find((s) => s.id === session?.schoolId)
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="font-bold">School profile</h2>
        <p className="mt-2">{school?.name}</p>
        <p className="text-sm text-slate-500">{school?.address}, {school?.city}</p>
        <p className="text-sm text-slate-500">{school?.email} · {school?.phone}</p>
      </Card>
      <Card>
        <h2 className="font-bold">Grading system</h2>
        <p className="mt-2 text-sm">A+ 90 · A 80 · B+ 70 · B 60 · C 50</p>
        <p className="mt-2 text-sm text-slate-500">Ranks hidden unless enabled per exam.</p>
      </Card>
      <Card>
        <h2 className="font-bold">Permissions</h2>
        <p className="mt-2 text-sm">Teachers may mark attendance, homework and marks for assigned sections only.</p>
        <p className="mt-1 text-sm">Parents may read their linked children only. Health records honour visibility flags.</p>
      </Card>
    </div>
  )
}
