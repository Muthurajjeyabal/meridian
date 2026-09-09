import { useState } from 'react'
import { Button, Card, Field } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { addHomework, loadDB } from '../../lib/store'

export default function TeacherHomework() {
  const { session } = useApp()
  const db = loadDB()
  const teacher = db.teachers.find((x) => x.profileId === session?.profileId)
  const fallbackSections = db.sections.filter((s) => s.schoolId === session?.schoolId).slice(0, 8)
  const fallbackSubjects = db.subjects.filter((s) => s.schoolId === session?.schoolId)
  const sectionIds = teacher?.sectionIds ?? fallbackSections.map((s) => s.id)
  const subjectIds = teacher?.subjectIds ?? fallbackSubjects.map((s) => s.id)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueOn, setDueOn] = useState('2026-09-16')
  const [subjectId, setSubjectId] = useState(subjectIds[0] ?? '')
  const [sectionId, setSectionId] = useState(sectionIds[0] ?? '')
  const mine = db.homework.filter((h) => h.schoolId === session?.schoolId).slice(0, 20)
  const section = db.sections.find((s) => s.id === sectionId)
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="font-bold">Create homework</h2>
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-semibold uppercase text-slate-500">Section
            <select className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              {sectionIds.map((id) => {
                const s = db.sections.find((x) => x.id === id)
                const c = db.classes.find((x) => x.id === s?.classId)
                return <option key={id} value={id}>Class {c?.name}-{s?.name}</option>
              })}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-500">Subject
            <select className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {subjectIds.map((id) => {
                const s = db.subjects.find((x) => x.id === id)
                return <option key={id} value={id}>{s?.name}</option>
              })}
            </select>
          </label>
          <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Field label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Field label="Due date" type="date" value={dueOn} onChange={(e) => setDueOn(e.target.value)} />
          <Button className="w-full" disabled={!title || !session?.schoolId || !section} onClick={() => {
            addHomework({ schoolId: session!.schoolId!, classId: section!.classId, sectionId, subjectId, teacherId: teacher?.id ?? 'admin', title, description, dueOn })
            setTitle(''); setDescription('')
          }}>Publish to class</Button>
        </div>
      </Card>
      <div className="space-y-2">
        {mine.map((h) => (
          <Card key={h.id}>
            <p className="font-semibold">{h.title}</p>
            <p className="text-sm text-slate-500">{h.description}</p>
            <p className="mt-1 text-xs text-slate-400">Due {h.dueOn}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
