import { format, parseISO } from 'date-fns'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, Empty } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'
import { currentStudent, loadDB, markHomeworkComplete } from '../../lib/store'

export default function Homework() {
  const { session } = useApp()
  const db = loadDB()
  const student = session ? currentStudent(session) : null
  const [subject, setSubject] = useState('all')
  if (!student) return <Empty title="No student selected" />
  const list = db.homework.filter((h) => h.schoolId === student.schoolId && h.classId === student.classId && (!h.sectionId || h.sectionId === student.sectionId))
  const subjects = db.subjects.filter((s) => s.schoolId === student.schoolId)
  const filtered = list.filter((h) => subject === 'all' || h.subjectId === subject)
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-auto no-scrollbar">
        <button onClick={() => setSubject('all')} className={cn('rounded-full px-3 py-1 text-xs font-semibold', subject === 'all' ? 'bg-cyan-700 text-white' : 'bg-white')}>All</button>
        {subjects.map((s) => (
          <button key={s.id} onClick={() => setSubject(s.id)} className={cn('rounded-full px-3 py-1 text-xs font-semibold', subject === s.id ? 'bg-cyan-700 text-white' : 'bg-white')}>{s.name}</button>
        ))}
      </div>
      {filtered.length === 0 && <Empty title="No homework available" />}
      {filtered.map((hw) => {
        const sub = db.submissions.find((s) => s.homeworkId === hw.id && s.studentId === student.id)
        const subj = db.subjects.find((s) => s.id === hw.subjectId)
        return (
          <Card key={hw.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-cyan-700">{subj?.name}</p>
                <h3 className="font-bold">{hw.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{hw.description}</p>
                <p className="mt-2 text-xs text-slate-400">Due {format(parseISO(hw.dueOn), 'EEE d MMM')}{hw.attachment ? ' · ' + hw.attachment : ''}</p>
              </div>
              {sub?.completed ? <Badge tone="emerald">Done</Badge> : <Badge tone="amber">Pending</Badge>}
            </div>
            {!sub?.completed && (
              <Button className="mt-3 w-full" variant="soft" onClick={() => markHomeworkComplete(hw.id, student.id)}>
                <Check size={16} /> Mark as completed
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
