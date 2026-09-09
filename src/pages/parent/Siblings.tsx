import { useNavigate } from 'react-router-dom'
import { Avatar, Badge } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { cn, inr } from '../../lib/cn'
import { attendanceStats, classLabel, feeSummary, parentChildren, studentName, switchStudent } from '../../lib/store'

export default function Siblings() {
  const { session } = useApp()
  const nav = useNavigate()
  if (!session) return null
  const kids = parentChildren(session)
  return (
    <div className="min-h-dvh bg-[#f3f7fb] px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <button onClick={() => nav(-1)} className="text-sm font-semibold text-cyan-700">Close</button>
      <h1 className="mt-4 text-2xl font-extrabold">Switch sibling</h1>
      <p className="mt-1 text-sm text-slate-500">Every number on the dashboard updates to the selected child.</p>
      <div className="mt-6 space-y-3">
        {kids.map((st) => {
          const att = attendanceStats(st.id)
          const fees = feeSummary(st.id)
          return (
            <button key={st.id} onClick={() => { switchStudent(st.id); nav('/parent') }}
              className={cn('flex w-full items-center gap-4 rounded-[1.6rem] bg-white p-4 text-left shadow-sm ring-1 ring-slate-100', session.studentId === st.id && 'ring-2 ring-cyan-500')}>
              <Avatar name={studentName(st)} hue={st.photoHue} size={56} />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{studentName(st)}</p>
                <p className="text-sm text-slate-500">{classLabel(st)}</p>
                <p className="text-xs text-slate-400">Adm {st.admissionNo}</p>
                <p className="mt-1 text-xs text-slate-500">{att.pct}% attendance · {inr(fees.due)} due</p>
              </div>
              {session.studentId === st.id && <Badge>Active</Badge>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
