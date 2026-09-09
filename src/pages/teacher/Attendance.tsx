import { useMemo, useState } from 'react'
import { Button, Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'
import type { AttendanceStatus } from '../../types'
import { loadDB, markAttendance } from '../../lib/store'

export default function TeacherAttendance() {
  const { session } = useApp()
  const db = loadDB()
  const teacher = db.teachers.find((x) => x.profileId === session?.profileId)
  const sections = teacher
    ? db.sections.filter((s) => teacher.sectionIds.includes(s.id))
    : db.sections.filter((s) => s.schoolId === session?.schoolId).slice(0, 8)
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '')
  const [date, setDate] = useState('2026-09-09')
  const students = db.students.filter((s) => s.sectionId === sectionId)
  const initial = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {}
    for (const st of students) {
      const row = db.attendance.find((a) => a.studentId === st.id && a.date === date)
      map[st.id] = row?.status ?? 'present'
    }
    return map
  }, [sectionId, date, db.attendance.length])
  const [rows, setRows] = useState(initial)
  const section = db.sections.find((s) => s.id === sectionId)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          {sections.map((s) => {
            const c = db.classes.find((x) => x.id === s.classId)
            return <option key={s.id} value={s.id}>Class {c?.name}-{s.name}</option>
          })}
        </select>
        <input type="date" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <Card>
        <div className="space-y-2">
          {students.map((st) => (
            <div key={st.id} className="flex items-center justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
              <div>
                <p className="font-semibold">{st.firstName} {st.lastName}</p>
                <p className="text-xs text-slate-400">Roll {st.rollNo}</p>
              </div>
              <div className="flex gap-1">
                {(['present','absent','late'] as AttendanceStatus[]).map((stt) => (
                  <button key={stt} onClick={() => setRows((r) => ({ ...r, [st.id]: stt }))}
                    className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
                      rows[st.id] === stt ? (stt === 'present' ? 'bg-emerald-600 text-white' : stt === 'absent' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white') : 'bg-slate-100 text-slate-600')}>{stt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-4 w-full" onClick={() => {
          if (!section || !session?.schoolId) return
          markAttendance({
            schoolId: session.schoolId,
            classId: section.classId,
            sectionId,
            date,
            teacherId: teacher?.id ?? 'admin',
            rows: students.map((s) => ({ studentId: s.id, status: rows[s.id] ?? 'present' })),
          })
          alert('Attendance saved. Duplicate dates update in place.')
        }}>Submit attendance</Button>
      </Card>
    </div>
  )
}
