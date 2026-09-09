import { useMemo, useState } from 'react'
import { Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { classLabel, loadDB, studentName } from '../../lib/store'

export default function People() {
  const { session } = useApp()
  const db = loadDB()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'students'|'teachers'|'parents'>('students')
  const students = db.students.filter((s) => s.schoolId === session?.schoolId && studentName(s).toLowerCase().includes(q.toLowerCase())).slice(0, 40)
  const teachers = db.teachers.filter((t) => t.schoolId === session?.schoolId)
  const parents = db.parents.filter((p) => p.schoolId === session?.schoolId)
  return (
    <div>
      <h1 className="text-2xl font-extrabold">People</h1>
      <div className="mt-3 flex gap-2">
        {(['students','teachers','parents'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1 text-sm capitalize ${tab===t?'bg-cyan-700 text-white':'bg-white'}`}>{t}</button>
        ))}
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search" className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-sm" />
      </div>
      <div className="mt-4 grid gap-2">
        {tab==='students' && students.map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div><p className="font-semibold">{studentName(s)}</p><p className="text-xs text-slate-500">{classLabel(s)} · {s.admissionNo}</p></div>
          </Card>
        ))}
        {tab==='teachers' && teachers.map((t) => {
          const p = db.profiles.find(x => x.id === t.profileId)
          return <Card key={t.id}><p className="font-semibold">{p?.fullName}</p><p className="text-xs text-slate-500">{t.department} · {t.employeeCode}</p></Card>
        })}
        {tab==='parents' && parents.map((p) => {
          const pr = db.profiles.find(x => x.id === p.profileId)
          return <Card key={p.id}><p className="font-semibold">{pr?.fullName}</p><p className="text-xs text-slate-500">{pr?.email}</p></Card>
        })}
      </div>
    </div>
  )
}
