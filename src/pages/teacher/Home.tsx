import { Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { loadDB } from '../../lib/store'

export default function TeacherHome() {
  const { session } = useApp()
  const db = loadDB()
  const teacher = db.teachers.find((x) => x.profileId === session?.profileId)
  const profile = db.profiles.find((p) => p.id === session?.profileId)
  const classes = db.classes.filter((c) => teacher?.classIds.includes(c.id))
  const students = db.students.filter((s) => teacher && s.schoolId === teacher.schoolId && teacher.classIds.includes(s.classId) && teacher.sectionIds.includes(s.sectionId))
  const hw = db.homework.filter((h) => h.teacherId === teacher?.id)
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Teacher desk</p>
        <h1 className="text-2xl font-extrabold">{profile?.fullName}</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card><p className="text-xs text-slate-500">Assigned classes</p><p className="text-2xl font-extrabold">{classes.map(c => c.name).join(', ') || '—'}</p></Card>
        <Card><p className="text-xs text-slate-500">Students in sections</p><p className="text-2xl font-extrabold">{students.length}</p></Card>
        <Card><p className="text-xs text-slate-500">Homework posted</p><p className="text-2xl font-extrabold">{hw.length}</p></Card>
      </div>
      <Card>
        <h3 className="font-bold">Today’s sections</h3>
        <ul className="mt-2 text-sm text-slate-600">
          {teacher?.sectionIds.map((id) => {
            const sec = db.sections.find((s) => s.id === id)
            const cls = db.classes.find((c) => c.id === sec?.classId)
            const n = db.students.filter((s) => s.sectionId === id).length
            return <li key={id}>Class {cls?.name}-{sec?.name} · {n} students</li>
          })}
        </ul>
      </Card>
    </div>
  )
}
