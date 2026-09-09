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
  const [classFilter, setClassFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [tab, setTab] = useState<'students' | 'teachers' | 'parents'>('students')
  const [form, setForm] = useState<'none' | 'student' | 'teacher'>('none')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const classes = db.classes.filter((c) => c.schoolId === schoolId)
  const sections = db.sections.filter((s) => s.schoolId === schoolId)
  const subjects = db.subjects.filter((s) => s.schoolId === schoolId)
  const allStudents = db.students.filter((s) => s.schoolId === schoolId)
  const students = allStudents.filter((s) => {
    const text = `${studentName(s)} ${s.admissionNo} ${s.enrollmentNo ?? ''}`.toLowerCase()
    const okQ = !q.trim() || text.includes(q.trim().toLowerCase())
    const okC = !classFilter || s.classId === classFilter
    const okS = !sectionFilter || s.sectionId === sectionFilter
    return okQ && okC && okS
  })
  const filterSections = sections.filter((s) => !classFilter || s.classId === classFilter)
  const showStudents = q.trim().length >= 2 || !!classFilter || !!sectionFilter
  const teachers = db.teachers.filter((t) => t.schoolId === schoolId)
  const parents = db.parents.filter((p) => p.schoolId === schoolId)

  const [sf, setSf] = useState({
    firstName: '', lastName: '', classId: classes[0]?.id ?? '', sectionId: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dateOfBirth: '', bloodGroup: 'O+', admissionNo: '', enrollmentNo: '', photoUrl: '',
    parentName: '', parentEmail: '', parentPhone: '', relationship: 'father',
    heightCm: '', weightKg: '', allergies: '', medicalNotes: '', emergencyName: '', emergencyPhone: '',
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
            <Field label="Date of birth" type="date" value={sf.dateOfBirth} onChange={(e) => setSf({ ...sf, dateOfBirth: e.target.value })} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={sf.gender}
                onChange={(e) => setSf({ ...sf, gender: e.target.value as 'male' | 'female' | 'other' })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <Field label="Admission number" value={sf.admissionNo} onChange={(e) => setSf({ ...sf, admissionNo: e.target.value })} placeholder="Leave blank to auto" />
            <Field label="Enrollment number" value={sf.enrollmentNo} onChange={(e) => setSf({ ...sf, enrollmentNo: e.target.value })} />
            <Field label="Blood group" value={sf.bloodGroup} onChange={(e) => setSf({ ...sf, bloodGroup: e.target.value })} />
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Photo</span>
              <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setSf((s) => ({ ...s, photoUrl: String(reader.result || '') }))
                reader.readAsDataURL(file)
              }} />
              {sf.photoUrl && <img src={sf.photoUrl} alt="" className="mt-2 h-16 w-16 rounded-2xl object-cover" />}
            </label>
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
            <Field label="Height (cm)" value={sf.heightCm} onChange={(e) => setSf({ ...sf, heightCm: e.target.value })} />
            <Field label="Weight (kg)" value={sf.weightKg} onChange={(e) => setSf({ ...sf, weightKg: e.target.value })} />
            <Field label="Allergies" value={sf.allergies} onChange={(e) => setSf({ ...sf, allergies: e.target.value })} />
            <Field label="Medical notes" value={sf.medicalNotes} onChange={(e) => setSf({ ...sf, medicalNotes: e.target.value })} />
            <Field label="Emergency name" value={sf.emergencyName} onChange={(e) => setSf({ ...sf, emergencyName: e.target.value })} />
            <Field label="Emergency phone" value={sf.emergencyPhone} onChange={(e) => setSf({ ...sf, emergencyPhone: e.target.value })} />
          </div>
          <p className="text-xs text-slate-500">Use parent@northridge.edu to attach a third child to the demo parent. New email gets password Parent@123.</p>
          <div className="flex gap-2">
            <Button disabled={!sf.firstName || !sf.sectionId || !sf.parentEmail} onClick={() => {
              try {
                const res = addStudentWithParent({
                  schoolId, firstName: sf.firstName, lastName: sf.lastName, classId: sf.classId, sectionId: sf.sectionId,
                  gender: sf.gender, dateOfBirth: sf.dateOfBirth, bloodGroup: sf.bloodGroup,
                  admissionNo: sf.admissionNo, enrollmentNo: sf.enrollmentNo, photoUrl: sf.photoUrl || undefined,
                  parentEmail: sf.parentEmail, parentName: sf.parentName, parentPhone: sf.parentPhone,
                  relationship: sf.relationship,
                  heightCm: Number(sf.heightCm) || 0, weightKg: Number(sf.weightKg) || 0,
                  allergies: sf.allergies, medicalNotes: sf.medicalNotes,
                  emergencyName: sf.emergencyName, emergencyPhone: sf.emergencyPhone,
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(['students', 'teachers', 'parents'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1 text-sm capitalize ${tab === t ? 'bg-cyan-700 text-white' : 'bg-white'}`}>{t}</button>
        ))}
        {tab === 'students' && (
          <>
            <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setSectionFilter('') }} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">
              <option value="">All classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">
              <option value="">All sections</option>
              {filterSections.map((s) => {
                const c = classes.find((x) => x.id === s.classId)
                return <option key={s.id} value={s.id}>{c?.name}-{s.name}</option>
              })}
            </select>
          </>
        )}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === 'students' ? 'Search name or admission no' : 'Search'} className="min-w-[12rem] flex-1 rounded-full border border-slate-200 px-3 py-1 text-sm" />
      </div>
      <div className="mt-4 grid gap-2">
        {tab === 'students' && !showStudents && (
          <Card>
            <p className="font-semibold">{allStudents.length} students</p>
            <p className="mt-1 text-sm text-slate-500">Class + section தேர்வு பண்ணுங்க, அல்லது பெயர் சர்ச் பண்ணுங்க.</p>
          </Card>
        )}
        {tab === 'students' && showStudents && students.length === 0 && (
          <Card><p className="text-sm text-slate-500">No student matches this search.</p></Card>
        )}
        {tab === 'students' && showStudents && students.map((s) => (
          <Card key={s.id} className="flex items-center gap-3">
            {s.photoUrl ? <img src={s.photoUrl} alt="" className="h-12 w-12 rounded-2xl object-cover" /> : null}
            <div>
              <p className="font-semibold">{studentName(s)}</p>
              <p className="text-xs text-slate-500">{classLabel(s)} · Adm {s.admissionNo}{s.enrollmentNo ? ` · Enr ${s.enrollmentNo}` : ''}</p>
            </div>
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
