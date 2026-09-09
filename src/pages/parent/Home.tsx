import { format, parseISO } from 'date-fns'
import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Card, Empty, SectionTitle, StatTile } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { inr } from '../../lib/cn'
import {
  attendanceStats, currentStudent, feeSummary, loadDB, pendingHomework, unreadCirculars,
} from '../../lib/store'

export default function ParentHome() {
  const nav = useNavigate()
  const { session } = useApp()
  const db = loadDB()
  const student = session ? currentStudent(session) : null
  if (!session || !student) return <Empty title="No student linked" />
  const att = attendanceStats(student.id)
  const pending = pendingHomework(student.id)
  const fees = feeSummary(student.id)
  const circulars = db.circulars.filter((c) => c.schoolId === student.schoolId).slice(0, 3)
  const exams = db.exams.filter((e) => e.schoolId === student.schoolId && e.startsOn >= '2026-09-09')
  const msgs = db.messages.filter((m) => m.recipientId === session.profileId && (!m.studentId || m.studentId === student.id)).slice(0, 3)
  const lastAbsent = [...db.attendance].reverse().find((a) => a.studentId === student.id && a.status === 'absent')

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">Good evening</p>
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back, {student.firstName}</h1>
      </div>
      {fees.due > 0 && (
        <button onClick={() => nav('/parent/payments')} className="flex w-full items-center justify-between rounded-3xl bg-gradient-to-r from-cyan-600 to-sky-700 p-4 text-left text-white shadow-lg shadow-cyan-700/20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Payment reminder</p>
            <p className="mt-1 text-2xl font-extrabold">{inr(fees.due)} pending</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Pay now</span>
        </button>
      )}
      {lastAbsent && lastAbsent.date >= '2026-09-01' && (
        <Card className="border-amber-100 bg-amber-50">
          <p className="text-sm font-semibold text-amber-950">Attendance alert</p>
          <p className="mt-1 text-sm text-amber-800">{student.firstName} was marked absent on {format(parseISO(lastAbsent.date), 'd MMM')}.</p>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Attendance" value={att.pct + '%'} hint={att.present + ' present days'} accent="bg-emerald-400" onClick={() => nav('/parent/attendance')} />
        <StatTile label="Homework" value={pending.length + ' New'} hint="Pending this week" accent="bg-sky-400" onClick={() => nav('/parent/homework')} />
        <StatTile label="Circulars" value={String(unreadCirculars(student.schoolId).length)} hint="School notices" accent="bg-violet-400" onClick={() => nav('/parent/circulars')} />
        <StatTile label="Fees Due" value={inr(fees.due)} hint={inr(fees.paid) + ' paid'} accent="bg-amber-400" onClick={() => nav('/parent/payments')} />
      </div>
      <div>
        <SectionTitle title="Recent homework" action={<button className="text-xs font-semibold text-cyan-700" onClick={() => nav('/parent/homework')}>See all</button>} />
        {pending.slice(0, 3).map((hw) => {
          const subj = db.subjects.find((s) => s.id === hw.subjectId)
          return (
            <Card key={hw.id} className="mb-2" onClick={() => nav('/parent/homework')}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700"><BookOpen size={16} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{hw.title}</p>
                  <p className="text-xs text-slate-500">{subj?.name} · Due {format(parseISO(hw.dueOn), 'd MMM')}</p>
                </div>
                <Badge tone={hw.dueOn < '2026-09-09' ? 'rose' : 'brand'}>{hw.dueOn < '2026-09-09' ? 'Overdue' : 'Open'}</Badge>
              </div>
            </Card>
          )
        })}
        {pending.length === 0 && <Empty title="No homework available" />}
      </div>
      <SectionTitle title="Upcoming exams" />
      {exams.map((ex) => (
        <Card key={ex.id} className="mb-2" onClick={() => nav('/parent/exams')}>
          <p className="font-semibold">{ex.name}</p>
          <p className="text-xs text-slate-500">{format(parseISO(ex.startsOn), 'd MMM')} – {format(parseISO(ex.endsOn), 'd MMM')}</p>
        </Card>
      ))}
      <SectionTitle title="Recent announcements" />
      {circulars.map((c) => (
        <Card key={c.id} className="mb-2" onClick={() => nav('/parent/circulars')}>
          <p className="font-semibold">{c.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.body}</p>
        </Card>
      ))}
      <SectionTitle title="Messages" />
      {msgs.map((m) => (
        <Card key={m.id} className="mb-2" onClick={() => nav('/parent/messages')}>
          <div className="flex items-center justify-between">
            <p className="font-semibold">{m.subject}</p>
            {!m.readAt && <span className="h-2 w-2 rounded-full bg-cyan-500" />}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{m.body}</p>
        </Card>
      ))}
    </div>
  )
}
