import { useState } from 'react'
import { Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { loadDB, upsertMark } from '../../lib/store'

export default function TeacherMarks() {
  const { session } = useApp()
  const db = loadDB()
  const teacher = db.teachers.find((x) => x.profileId === session?.profileId)
  const examSubjects = db.examSubjects.filter((es) => teacher && es.schoolId === teacher.schoolId && teacher.subjectIds.includes(es.subjectId) && teacher.classIds.includes(es.classId))
  const [esId, setEsId] = useState(examSubjects[0]?.id ?? '')
  const es = db.examSubjects.find((e) => e.id === esId)
  const students = db.students.filter((s) => es && s.classId === es.classId && teacher?.sectionIds.includes(s.sectionId))
  return (
    <div className="space-y-4">
      <select className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" value={esId} onChange={(e) => setEsId(e.target.value)}>
        {examSubjects.map((row) => {
          const exam = db.exams.find((e) => e.id === row.examId)
          const sub = db.subjects.find((s) => s.id === row.subjectId)
          return <option key={row.id} value={row.id}>{exam?.name} · {sub?.name}</option>
        })}
      </select>
      <Card>
        {students.map((st) => {
          const mark = db.marks.find((m) => m.examSubjectId === esId && m.studentId === st.id)
          return (
            <div key={st.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
              <p className="text-sm font-semibold">{st.firstName} {st.lastName}</p>
              <input type="number" defaultValue={mark?.marks ?? ''} max={es?.maxMarks} className="w-24 rounded-xl border border-slate-200 px-2 py-1 text-sm"
                onBlur={(e) => upsertMark(esId, st.id, Number(e.target.value))} />
            </div>
          )
        })}
      </Card>
    </div>
  )
}
