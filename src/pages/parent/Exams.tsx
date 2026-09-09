import { format, parseISO } from 'date-fns'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Card, Empty } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { attendanceStats, currentStudent, loadDB, performance } from '../../lib/store'

export default function Exams() {
  const { session } = useApp()
  const db = loadDB()
  const student = session ? currentStudent(session) : null
  if (!student) return <Empty title="No student selected" />
  const perf = performance(student.id)
  const att = attendanceStats(student.id)
  const chart = perf.subjects.map((s) => ({ name: s.name.split(' ')[0], pct: Math.round((s.got / s.max) * 100) }))
  const avg = chart.length ? Math.round(chart.reduce((s, x) => s + x.pct, 0) / chart.length) : 0
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card><p className="text-xs text-slate-500">Academic</p><p className="text-2xl font-extrabold">{avg}%</p></Card>
        <Card><p className="text-xs text-slate-500">Attendance</p><p className="text-2xl font-extrabold">{att.pct}%</p></Card>
      </div>
      <Card className="h-56">
        <p className="mb-2 font-bold">Subject-wise performance</p>
        {chart.length === 0 ? <Empty title="Results not published yet" /> : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chart}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="pct" fill="#0891b2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
      {db.exams.filter((e) => e.schoolId === student.schoolId).map((ex) => {
        const subs = db.examSubjects.filter((es) => es.examId === ex.id && es.classId === student.classId)
        return (
          <Card key={ex.id}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{ex.name}</h3>
              <Badge tone={ex.published ? 'emerald' : 'slate'}>{ex.published ? 'Published' : 'Upcoming'}</Badge>
            </div>
            <p className="text-xs text-slate-500">{format(parseISO(ex.startsOn), 'd MMM')} – {format(parseISO(ex.endsOn), 'd MMM')}</p>
            <div className="mt-3 space-y-1">
              {subs.map((es) => {
                const subj = db.subjects.find((s) => s.id === es.subjectId)
                const mark = db.marks.find((m) => m.examSubjectId === es.id && m.studentId === student.id)
                return (
                  <div key={es.id} className="flex items-center justify-between text-sm">
                    <span>{subj?.name}</span>
                    <span className="font-semibold">{mark ? `${mark.marks}/${es.maxMarks} · ${mark.grade}` : format(parseISO(es.scheduledOn), 'd MMM')}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
