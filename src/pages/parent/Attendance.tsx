import { Card, Empty } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'
import { attendanceStats, currentStudent, loadDB } from '../../lib/store'

export default function Attendance() {
  const { session } = useApp()
  const db = loadDB()
  const student = session ? currentStudent(session) : null
  if (!student) return <Empty title="No student selected" />
  const stats = attendanceStats(student.id)
  const byDate = Object.fromEntries(db.attendance.filter((a) => a.studentId === student.id).map((r) => [r.date, r.status]))
  const days = Array.from({ length: 30 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[[`${stats.pct}%`, 'Overall'], [stats.present, 'Present'], [stats.absent, 'Absent'], [stats.late, 'Late']].map(([v, l]) => (
          <Card key={String(l)} className="text-center">
            <p className="text-lg font-extrabold">{v}</p>
            <p className="text-[11px] text-slate-500">{l}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="font-bold">September 2026</h3>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400">
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={d + i}>{d}</div>)}
          {Array.from({ length: new Date(2026, 8, 1).getDay() }).map((_, i) => <div key={'e'+i} />)}
          {days.map((d) => {
            const st = byDate[d]
            return (
              <div key={d} className={cn('grid h-8 place-items-center rounded-full text-xs font-semibold',
                st === 'present' && 'bg-emerald-100 text-emerald-800',
                st === 'absent' && 'bg-rose-100 text-rose-700',
                st === 'late' && 'bg-amber-100 text-amber-800',
                !st && 'text-slate-600')}>{Number(d.slice(-2))}</div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
