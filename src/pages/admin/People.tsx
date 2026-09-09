import { useMemo, useState } from 'react'
import { Button, Card, Field } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { addStudentWithParent, addTeacherWithAssign, classLabel, loadDB, studentName } from '../../lib/store'

export default function People() {
  const { session, tick } = useApp()
  void tick
  const db = loadDB()
  const schoolId = session?.schoolId
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'students' | 'teachers' | 'parents'>('students')
  const [form, setForm] = useState<'none' | 'student' | 'teacher'>('none')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const classes = db.classes.filter((c) => c.schoolId === schoolId)
  const sections = db.sections.filter((s) => s.schoolId === schoolId)
  const subjects = db.subjects.filter((s) => s.schoolId === schoolId)
  const students = db.students.filter((s) => s.schoolId === schoolId && studentName(s).toLowerCase().includes(q.toLowerCase()))
  const teachers = db.teachers.filter((t) => t.schoolId === schoolId)
  const parents = db.parents.filter((p) => p.schoolId === schoolId)

  const [sf, setSf] = useState({
    firstName: '', lastName: '', classId: classes[0]?.id ?? '', sectionId: '', gender: 'male' as const,
    parentName: '', parentEmail: '', parentPhone: '', relationship: 'father',
  })
  const classSections = useMemo(() => sections.filter((s) => s.classId === sf.classId), [sections, sf.classId])

  const [tf, setTf] = useState({
    fullName: '', email: '', phone: '', department: 'Mathematics',
    classId: classes[0]?.id ?? '', sectionId: '', subjectId: subjects[0]?.id ?? '',
  })

  if (!schoolId) return <p>No school on this account.</p>

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold">People</h1>
        <Button className="ml-auto" onClick={() => { setForm('student'); setMsg(''); setErr('') }}>Add student</Button>
        <Button variant="soft" onClick={() => { setForm('teacher'); setMsg(''); setErr('') }}>Add teacher</Button>
      </div>
      {msg && <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}
      {err && <p className="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</p>}

      {form === 'student' && (
        <Card className="mt-4 space-y-3">
          <h2 className="font-bold">Add student and link parent</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name" value={sf.firstName} onChange={(e) => setSf({ ...sf, firstName: e.target.value })} />
            <Field label="Last name" value={sf.lastName} onChange={(e) => setSf({ ...sf, lastName: e.target.value })} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Class</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={sf.classId}
                onChange={(e) => setSf({ ...sf, classId: e.target.value, sectionId: '' })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Section</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={sf.sectionId}
                onChange={(e) => setSf({ ...sf, sectionId: e.target.value })}>
                <option value="">Select</option>
                {classSections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <Field label="Parent name" value={sf.parentName} onChange={(e) => setSf({ ...sf, parentName: e.target.value })} />
            <Field label="Parent email" value={sf.parentEmail} onChange={(e) => setSf({ ...sf, parentEmail: e.target.value })} />
            <Field label="Parent phone" value={sf.parentPhone} onChange={(e) => setSf({ ...sf, parentPhone: e.target.value })} />
          </div>
          <p className="text-xs text-slate-500">Use parent@northridge.edu to attach a third child to the demo parent. New email gets password Parent@123.</p>
          <div className="flex gap-2">
            <Button disabled={!sf.firstName || !sf.sectionId || !sf.parentEmail} onClick={() => {
              try {
                const res = addStudentWithParent({
                  schoolId, firstName: sf.firstName, lastName: sf.lastName, classId: sf.classId, sectionId: sf.sectionId,
                  gender: 'male', parentEmail: sf.parentEmail, parentName: sf.parentName, parentPhone: sf.parentPhone,
                  relationship: sf.relationship,
                })
                setMsg(`${res.student.firstName} added. Parent login ${res.parentEmail} / ${res.parentPassword}`)
                setErr('')
                setForm('none')
              } catch (e) { setErr(e instanceof Error ? e.message : 'Failed') }
            }}>Save student</Button>
            <Button variant="ghost" onClick={() => setForm('none')}>Cancel</Button>
          </div>
        </Card>
      )}

      {form === 'teacher' && (
        <Card className="mt-4 space-y-3">
          <h2 className="font-bold">Add teacher and assign class</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" value={tf.fullName} onChange={(e) => setTf({ ...tf, fullName: e.target.value })} />
            <Field label="Email" value={tf.email} onChange={(e) => setTf({ ...tf, email: e.target.value })} />
            <Field label="Phone" value={tf.phone} onChange={(e) => setTf({ ...tf, phone: e.target.value })} />
            <Field label="Department" value={tf.department} onChange={(e) => setTf({ ...tf, department: e.target.value })} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Class</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={tf.classId}
                onChange={(e) => setTf({ ...tf, classId: e.target.value, sectionId: '' })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Section</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={tf.sectionId}
                onChange={(e) => setTf({ ...tf, sectionId: e.target.value })}>
                <option value="">Select</option>
                {sections.filter((s) => s.classId === tf.classId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={tf.subjectId}
                onChange={(e) => setTf({ ...tf, subjectId: e.target.value })}>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          </div>
          <p className="text-xs text-slate-500">New teacher password is Teacher@123.</p>
          <div className="flex gap-2">
            <Button disabled={!tf.fullName || !tf.email || !tf.sectionId} onClick={() => {
              try {
                const res = addTeacherWithAssign({
                  schoolId, fullName: tf.fullName, email: tf.email, phone: tf.phone, department: tf.department,
                  classIds: [tf.classId], sectionIds: [tf.sectionId], subjectIds: tf.subjectId ? [tf.subjectId] : [],
                })
                setMsg(`${tf.fullName} added. Login ${res.email} / ${res.password}`)
                setErr('')
                setForm('none')
              } catch (e) { setErr(e instanceof Error ? e.message : 'Failed') }
            }}>Save teacher</Button>
            <Button variant="ghost" onClick={() => setForm('none')}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="mt-4 flex gap-2">
        {(['students', 'teachers', 'parents'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1 text-sm capitalize ${tab === t ? 'bg-cyan-700 text-white' : 'bg-white'}`}>{t}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-sm" />
      </div>
      <div className="mt-4 grid gap-2">
        {tab === 'students' && students.map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div><p className="font-semibold">{studentName(s)}</p><p className="text-xs text-slate-500">{classLabel(s)} · {s.admissionNo}</p></div>
          </Card>
        ))}
        {tab === 'teachers' && teachers.map((t) => {
          const p = db.profiles.find((x) => x.id === t.profileId)
          const assigned = t.classIds.map((id) => db.classes.find((c) => c.id === id)?.name).filter(Boolean).join(', ')
          return <Card key={t.id}><p className="font-semibold">{p?.fullName}</p><p className="text-xs text-slate-500">{t.department} · {t.employeeCode} · {assigned}</p></Card>
        })}
        {tab === 'parents' && parents.map((p) => {
          const pr = db.profiles.find((x) => x.id === p.profileId)
          const kids = db.studentParents.filter((l) => l.parentId === p.id).length
          return <Card key={p.id}><p className="font-semibold">{pr?.fullName}</p><p className="text-xs text-slate-500">{pr?.email} · {kids} child</p></Card>
        })}
      </div>
    </div>
  )
}
