import { format, parseISO } from 'date-fns'
import { HeartPulse } from 'lucide-react'
import { Avatar, Card, Empty } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { classLabel, currentStudent, loadDB, studentName } from '../../lib/store'

export default function Profile() {
  const { session } = useApp()
  const db = loadDB()
  const student = session ? currentStudent(session) : null
  if (!student) return <Empty title="No student selected" />
  const profile = db.studentProfiles.find((p) => p.studentId === student.id)
  const health = db.health.find((h) => h.studentId === student.id)
  const bmi = health ? health.weightKg / ((health.heightCm / 100) ** 2) : 0
  return (
    <div className="space-y-4 pb-4">
      <Card className="flex items-center gap-4 bg-gradient-to-br from-cyan-600 to-sky-800 text-white">
        <Avatar name={studentName(student)} hue={student.photoHue} size={72} />
        <div>
          <h1 className="text-xl font-extrabold">{studentName(student)}</h1>
          <p className="text-sm text-cyan-50">{classLabel(student)}</p>
          <p className="mt-1 text-xs text-cyan-100">Roll {student.rollNo} · Adm {student.admissionNo}</p>
        </div>
      </Card>
      <Card>
        <h3 className="font-bold">Personal details</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-slate-500">Date of birth</p><p className="font-medium">{format(parseISO(student.dateOfBirth), 'd MMM yyyy')}</p></div>
          <div><p className="text-xs text-slate-500">Gender</p><p className="font-medium capitalize">{student.gender}</p></div>
          <div><p className="text-xs text-slate-500">Blood group</p><p className="font-medium">{student.bloodGroup}</p></div>
          <div><p className="text-xs text-slate-500">Academic year</p><p className="font-medium">2026-2027</p></div>
        </dl>
      </Card>
      <Card>
        <h3 className="font-bold">Family</h3>
        <div className="mt-3 space-y-2 text-sm">
          <p>Father · {profile?.fatherName} · {profile?.fatherMobile}</p>
          <p>Mother · {profile?.motherName} · {profile?.motherMobile}</p>
          <p>Guardian · {profile?.guardianName} · {profile?.guardianMobile}</p>
        </div>
      </Card>
      <Card>
        <h3 className="font-bold">Contact</h3>
        <p className="mt-2 text-sm">{profile?.address}</p>
        <p className="mt-1 text-sm text-slate-500">{profile?.communicationMobile}</p>
        <p className="text-sm text-slate-500">{profile?.email}</p>
      </Card>
      <Card>
        <div className="flex items-center gap-2"><HeartPulse size={16} className="text-rose-500" /><h3 className="font-bold">Health record</h3></div>
        {!health || !health.visibleToParents ? (
          <p className="mt-3 text-sm text-slate-500">Sensitive health information is restricted by the school.</p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Height</p><p className="font-bold">{health.heightCm} cm</p></div>
            <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Weight</p><p className="font-bold">{health.weightKg} kg</p></div>
            <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">BMI</p><p className="font-bold">{bmi.toFixed(1)}</p></div>
            <div className="col-span-3 text-left text-sm">
              <p className="mt-2"><span className="text-slate-500">Medical · </span>{health.medicalNotes}</p>
              <p><span className="text-slate-500">Allergies · </span>{health.allergies}</p>
              <p><span className="text-slate-500">Emergency · </span>{health.emergencyName} {health.emergencyPhone}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
