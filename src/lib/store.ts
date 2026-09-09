
import type {
  AppNotification, AttendanceStatus, DB, Homework, Message, Payment,
  PaymentStatus, Role, Session, Student,
} from '../types'
import { uid } from './cn'
import { createSeed } from './seed'

const KEY = 'meridian.db.v1'
const SESSION_KEY = 'meridian.session.v1'

let memory: DB | null = null
const listeners = new Set<() => void>()

export function loadDB(): DB {
  if (memory) return memory
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      memory = JSON.parse(raw) as DB
      return memory
    }
  } catch {
    /* ignore */
  }
  memory = createSeed()
  persist()
  return memory
}

export function resetDemo() {
  memory = createSeed()
  persist()
  emit()
}

function persist() {
  if (!memory) return
  localStorage.setItem(KEY, JSON.stringify(memory))
}

function emit() {
  persist()
  listeners.forEach((l) => l())
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function setSession(s: Session | null) {
  if (!s) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  emit()
}

export function signIn(email: string, password: string): Session {
  const db = loadDB()
  const profile = db.profiles.find(
    (p) => p.email.toLowerCase() === email.trim().toLowerCase() && p.password === password,
  )
  if (!profile) throw new Error('Invalid email or password')
  const role = db.roles.find((r) => r.profileId === profile.id)
  if (!role) throw new Error('No role assigned')
  let studentId: string | null = null
  if (role.role === 'parent' && role.schoolId) {
    const parent = db.parents.find((p) => p.profileId === profile.id && p.schoolId === role.schoolId)
    const kids = db.studentParents.filter((l) => l.parentId === parent?.id).map((l) => l.studentId)
    studentId = kids[0] ?? null
  }
  const session: Session = {
    profileId: profile.id,
    role: role.role,
    schoolId: role.schoolId,
    studentId,
  }
  setSession(session)
  return session
}

export function signOut() {
  setSession(null)
}

export function switchStudent(studentId: string) {
  const s = getSession()
  if (!s) return
  setSession({ ...s, studentId })
}

export function assertSchool(rowSchool: string, session: Session) {
  if (session.role === 'super_admin') return
  if (session.schoolId !== rowSchool) throw new Error('Cross-school access blocked')
}

export function parentChildren(session: Session): Student[] {
  const db = loadDB()
  const parent = db.parents.find((p) => p.profileId === session.profileId && p.schoolId === session.schoolId)
  if (!parent) return []
  const ids = db.studentParents.filter((l) => l.parentId === parent.id).map((l) => l.studentId)
  return db.students.filter((s) => ids.includes(s.id))
}

export function currentStudent(session: Session): Student | null {
  const db = loadDB()
  if (!session.studentId) return null
  const st = db.students.find((s) => s.id === session.studentId) ?? null
  if (st && session.role === 'parent') {
    const allowed = parentChildren(session).some((c) => c.id === st.id)
    if (!allowed) return null
  }
  return st
}

export function studentName(st: Student) {
  return `${st.firstName} ${st.lastName}`
}

export function classLabel(st: Student) {
  const db = loadDB()
  const c = db.classes.find((x) => x.id === st.classId)
  const s = db.sections.find((x) => x.id === st.sectionId)
  return `Class ${c?.name ?? '?'}-${s?.name ?? '?'}`
}

export function attendanceStats(studentId: string) {
  const rows = loadDB().attendance.filter((a) => a.studentId === studentId)
  const present = rows.filter((r) => r.status === 'present').length
  const absent = rows.filter((r) => r.status === 'absent').length
  const late = rows.filter((r) => r.status === 'late').length
  const excused = rows.filter((r) => r.status === 'excused').length
  const total = rows.length || 1
  const pct = Math.round(((present + late * 0.5 + excused) / total) * 100)
  return { present, absent, late, excused, total: rows.length, pct }
}

export function pendingHomework(studentId: string) {
  const db = loadDB()
  const hw = db.homework.filter((h) => {
    const st = db.students.find((s) => s.id === studentId)
    return st && h.schoolId === st.schoolId && h.classId === st.classId && (!h.sectionId || h.sectionId === st.sectionId)
  })
  return hw.filter((h) => {
    const sub = db.submissions.find((s) => s.homeworkId === h.id && s.studentId === studentId)
    return !sub?.completed
  })
}

export function feeSummary(studentId: string) {
  const db = loadDB()
  const charges = db.studentFees.filter((f) => f.studentId === studentId)
  const total = charges.reduce((s, f) => s + f.amount, 0)
  const paid = db.payments
    .filter((p) => p.studentId === studentId && p.status === 'success')
    .reduce((s, p) => s + p.amount, 0)
  return { total, paid, due: Math.max(total - paid, 0), charges }
}

export function unreadMessages(profileId: string, studentId?: string | null) {
  return loadDB().messages.filter(
    (m) => m.recipientId === profileId && !m.readAt && (!studentId || !m.studentId || m.studentId === studentId),
  )
}

export function unreadNotifications(profileId: string, studentId?: string | null) {
  return loadDB().notifications.filter(
    (n) => n.profileId === profileId && !n.readAt && (!studentId || !n.studentId || n.studentId === studentId),
  )
}

export function unreadCirculars(schoolId: string) {
  return loadDB().circulars.filter((c) => c.schoolId === schoolId)
}

export function performance(studentId: string) {
  const db = loadDB()
  const marks = db.marks.filter((m) => m.studentId === studentId)
  const byExam: Record<string, { got: number; max: number }> = {}
  for (const m of marks) {
    const es = db.examSubjects.find((e) => e.id === m.examSubjectId)
    if (!es) continue
    const exam = db.exams.find((e) => e.id === es.examId)
    if (!exam) continue
    byExam[exam.id] ??= { got: 0, max: 0 }
    byExam[exam.id].got += m.marks
    byExam[exam.id].max += es.maxMarks
  }
  const subjectMap: Record<string, { got: number; max: number; name: string }> = {}
  for (const m of marks) {
    const es = db.examSubjects.find((e) => e.id === m.examSubjectId)
    if (!es) continue
    const sub = db.subjects.find((s) => s.id === es.subjectId)
    subjectMap[es.subjectId] ??= { got: 0, max: 0, name: sub?.name ?? 'Subject' }
    subjectMap[es.subjectId].got += m.marks
    subjectMap[es.subjectId].max += es.maxMarks
  }
  return { marks, byExam, subjects: Object.values(subjectMap) }
}

export function markHomeworkComplete(homeworkId: string, studentId: string, note?: string) {
  const db = loadDB()
  let sub = db.submissions.find((s) => s.homeworkId === homeworkId && s.studentId === studentId)
  if (!sub) {
    const hw = db.homework.find((h) => h.id === homeworkId)
    if (!hw) throw new Error('Homework not found')
    sub = {
      id: uid('sub'),
      schoolId: hw.schoolId,
      homeworkId,
      studentId,
      completed: true,
      note,
      submittedAt: new Date().toISOString(),
    }
    db.submissions.push(sub)
  } else {
    sub.completed = true
    sub.note = note
    sub.submittedAt = new Date().toISOString()
  }
  emit()
}

export function markAttendance(payload: {
  schoolId: string
  classId: string
  sectionId: string
  date: string
  teacherId: string
  rows: { studentId: string; status: AttendanceStatus }[]
}) {
  const db = loadDB()
  for (const row of payload.rows) {
    const existing = db.attendance.find(
      (a) => a.studentId === row.studentId && a.date === payload.date,
    )
    if (existing) {
      existing.status = row.status
      existing.markedBy = payload.teacherId
    } else {
      db.attendance.push({
        id: uid('att'),
        schoolId: payload.schoolId,
        studentId: row.studentId,
        classId: payload.classId,
        sectionId: payload.sectionId,
        date: payload.date,
        status: row.status,
        markedBy: payload.teacherId,
      })
    }
  }
  emit()
}

export function addHomework(hw: Omit<Homework, 'id' | 'createdAt'>) {
  const db = loadDB()
  const row: Homework = { ...hw, id: uid('hw'), createdAt: new Date().toISOString() }
  db.homework.unshift(row)
  const students = db.students.filter(
    (s) => s.schoolId === hw.schoolId && s.classId === hw.classId && (!hw.sectionId || s.sectionId === hw.sectionId),
  )
  for (const st of students) {
    db.submissions.push({
      id: uid('sub'),
      schoolId: hw.schoolId,
      homeworkId: row.id,
      studentId: st.id,
      completed: false,
    })
    const links = db.studentParents.filter((l) => l.studentId === st.id)
    for (const link of links) {
      const parent = db.parents.find((p) => p.id === link.parentId)
      if (!parent) continue
      db.notifications.unshift({
        id: uid('nt'),
        schoolId: hw.schoolId,
        profileId: parent.profileId,
        studentId: st.id,
        type: 'homework',
        title: `New homework · ${db.subjects.find((s) => s.id === hw.subjectId)?.name ?? 'Subject'}`,
        body: hw.title,
        link: '/parent/homework',
        createdAt: new Date().toISOString(),
      })
    }
  }
  emit()
  return row
}

export function upsertMark(examSubjectId: string, studentId: string, marks: number) {
  const db = loadDB()
  const es = db.examSubjects.find((e) => e.id === examSubjectId)
  if (!es) throw new Error('Exam subject missing')
  const pct = (marks / es.maxMarks) * 100
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'D'
  const existing = db.marks.find((m) => m.examSubjectId === examSubjectId && m.studentId === studentId)
  if (existing) {
    existing.marks = marks
    existing.grade = grade
  } else {
    db.marks.push({
      id: uid('mk'),
      schoolId: es.schoolId,
      examSubjectId,
      studentId,
      marks,
      grade,
    })
  }
  emit()
}

export function initiatePayment(studentId: string, amount: number, method: string): Payment {
  const db = loadDB()
  const st = db.students.find((s) => s.id === studentId)
  if (!st) throw new Error('Student not found')
  const payment: Payment = {
    id: uid('pay'),
    schoolId: st.schoolId,
    studentId,
    amount,
    method,
    status: 'processing',
    gateway: method === 'upi' ? 'razorpay' : 'cashfree',
    gatewayOrderId: 'order_' + uid('gw'),
    createdAt: new Date().toISOString(),
  }
  db.payments.unshift(payment)
  emit()
  return payment
}

/** Simulates a webhook / edge function. Frontend cannot mark success by itself. */
export function verifyPaymentOnServer(paymentId: string, outcome: 'success' | 'failed') {
  const db = loadDB()
  const pay = db.payments.find((p) => p.id === paymentId)
  if (!pay) throw new Error('Payment not found')
  if (pay.status === 'success') return pay
  if (outcome === 'success') {
    pay.status = 'success'
    pay.verifiedAt = new Date().toISOString()
    pay.gatewayPaymentId = 'pay_' + uid('ok')
    pay.receiptNo = `RCT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${pay.id.slice(-6).toUpperCase()}`
    db.notifications.unshift({
      id: uid('nt'),
      schoolId: pay.schoolId,
      profileId: getSession()?.profileId ?? '',
      studentId: pay.studentId,
      type: 'fees',
      title: 'Payment confirmed',
      body: `Receipt ${pay.receiptNo} is ready.`,
      link: '/parent/payments',
      createdAt: new Date().toISOString(),
    })
  } else {
    pay.status = 'failed'
  }
  emit()
  return pay
}

export function sendMessage(input: Omit<Message, 'id' | 'createdAt'>) {
  const db = loadDB()
  const msg: Message = { ...input, id: uid('msg'), createdAt: new Date().toISOString() }
  db.messages.unshift(msg)
  db.notifications.unshift({
    id: uid('nt'),
    schoolId: input.schoolId,
    profileId: input.recipientId,
    studentId: input.studentId,
    type: 'message',
    title: input.subject,
    body: input.body.slice(0, 80),
    link: input.recipientId === getSession()?.profileId ? '/parent/messages' : '/messages',
    createdAt: msg.createdAt,
  })
  emit()
  return msg
}

export function markMessageRead(id: string) {
  const m = loadDB().messages.find((x) => x.id === id)
  if (m && !m.readAt) {
    m.readAt = new Date().toISOString()
    emit()
  }
}

export function markNotificationRead(id: string) {
  const n = loadDB().notifications.find((x) => x.id === id)
  if (n && !n.readAt) {
    n.readAt = new Date().toISOString()
    emit()
  }
}

export function markAllNotificationsRead(profileId: string) {
  loadDB()
    .notifications.filter((n) => n.profileId === profileId && !n.readAt)
    .forEach((n) => {
      n.readAt = new Date().toISOString()
    })
  emit()
}

export function publishCircular(schoolId: string, title: string, body: string) {
  const db = loadDB()
  db.circulars.unshift({
    id: uid('cir'),
    schoolId,
    title,
    body,
    publishedAt: new Date().toISOString(),
    audience: 'parents',
  })
  emit()
}

export function updateSchool(id: string, patch: Partial<DB['schools'][number]>) {
  const school = loadDB().schools.find((s) => s.id === id)
  if (!school) return
  Object.assign(school, patch)
  emit()
}

export function createSchool(name: string, city: string) {
  const db = loadDB()
  const id = uid('sch')
  db.schools.push({
    id,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    city,
    state: '',
    email: '',
    phone: '',
    address: '',
    currency: 'INR',
    subscriptionStatus: 'trial',
    subscriptionPlan: 'Starter',
    seats: 500,
    studentCount: 0,
    isActive: true,
  })
  emit()
}

export function schoolStats(schoolId: string) {
  const db = loadDB()
  const students = db.students.filter((s) => s.schoolId === schoolId)
  const teachers = db.teachers.filter((t) => t.schoolId === schoolId)
  const parents = db.parents.filter((p) => p.schoolId === schoolId)
  const today = '2026-09-09'
  const todayRows = db.attendance.filter((a) => a.schoolId === schoolId && a.date === today)
  const presentToday = todayRows.filter((a) => a.status === 'present' || a.status === 'late').length
  const fees = db.studentFees.filter((f) => f.schoolId === schoolId)
  const collected = db.payments
    .filter((p) => p.schoolId === schoolId && p.status === 'success')
    .reduce((s, p) => s + p.amount, 0)
  const billed = fees.reduce((s, f) => s + f.amount, 0)
  return {
    students: students.length,
    teachers: teachers.length,
    parents: parents.length,
    presentToday,
    attendanceDenom: todayRows.length || students.length,
    billed,
    collected,
    pending: Math.max(billed - collected, 0),
    homework: db.homework.filter((h) => h.schoolId === schoolId).length,
    exams: db.exams.filter((e) => e.schoolId === schoolId).length,
  }
}

export function appearancePref() {
  return localStorage.getItem('meridian.appearance') || 'light'
}

export function setAppearancePref(v: string) {
  localStorage.setItem('meridian.appearance', v)
}

export function savePrefs(profileId: string, patch: Partial<DB['prefs'][number]>) {
  const db = loadDB()
  const row = db.prefs.find((p) => p.profileId === profileId)
  if (row) Object.assign(row, patch)
  else db.prefs.push({
    profileId,
    homework: true,
    attendance: true,
    circulars: true,
    messages: true,
    fees: true,
    exams: true,
    ...patch,
  })
  emit()
}

export function addStudentWithParent(input: {
  schoolId: string
  firstName: string
  lastName: string
  classId: string
  sectionId: string
  gender: 'male' | 'female' | 'other'
  parentEmail: string
  parentName: string
  parentPhone: string
  relationship?: string
}) {
  const db = loadDB()
  const year = db.years.find((y) => y.schoolId === input.schoolId && y.isCurrent) ?? db.years.find((y) => y.schoolId === input.schoolId)
  if (!year) throw new Error('No academic year')
  const klass = db.classes.find((c) => c.id === input.classId && c.schoolId === input.schoolId)
  const section = db.sections.find((s) => s.id === input.sectionId && s.classId === input.classId)
  if (!klass || !section) throw new Error('Class / section missing')

  const student: Student = {
    id: uid('st'),
    schoolId: input.schoolId,
    academicYearId: year.id,
    classId: input.classId,
    sectionId: input.sectionId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    admissionNo: `ADM${Date.now().toString().slice(-6)}`,
    rollNo: String(db.students.filter((s) => s.sectionId === input.sectionId).length + 1),
    dateOfBirth: '2015-01-01',
    gender: input.gender,
    bloodGroup: 'O+',
    photoHue: 160 + (db.students.length % 40) * 4,
  }
  db.students.push(student)

  const email = input.parentEmail.trim().toLowerCase()
  let profile = db.profiles.find((p) => p.email.toLowerCase() === email)
  if (!profile) {
    profile = {
      id: uid('pr'),
      email,
      password: 'Parent@123',
      fullName: input.parentName.trim(),
      phone: input.parentPhone.trim(),
    }
    db.profiles.push(profile)
  }
  if (!db.roles.some((r) => r.profileId === profile!.id && r.schoolId === input.schoolId && r.role === 'parent')) {
    db.roles.push({ profileId: profile.id, schoolId: input.schoolId, role: 'parent' })
  }
  let parent = db.parents.find((p) => p.profileId === profile.id && p.schoolId === input.schoolId)
  if (!parent) {
    parent = { id: uid('par'), schoolId: input.schoolId, profileId: profile.id, occupation: '' }
    db.parents.push(parent)
  }
  if (!db.studentParents.some((l) => l.studentId === student.id && l.parentId === parent.id)) {
    db.studentParents.push({
      studentId: student.id,
      parentId: parent.id,
      relationship: input.relationship || 'parent',
      schoolId: input.schoolId,
    })
  }

  db.studentProfiles.push({
    studentId: student.id,
    schoolId: input.schoolId,
    fatherName: input.relationship === 'mother' ? '' : input.parentName,
    fatherMobile: input.relationship === 'mother' ? '' : input.parentPhone,
    motherName: input.relationship === 'mother' ? input.parentName : '',
    motherMobile: input.relationship === 'mother' ? input.parentPhone : '',
    guardianName: input.parentName,
    guardianMobile: input.parentPhone,
    communicationMobile: input.parentPhone,
    email,
    address: '',
  })

  const school = db.schools.find((s) => s.id === input.schoolId)
  if (school) school.studentCount = db.students.filter((s) => s.schoolId === input.schoolId).length
  emit()
  return { student, parentEmail: email, parentPassword: profile.password }
}

export function addTeacherWithAssign(input: {
  schoolId: string
  fullName: string
  email: string
  phone: string
  department: string
  classIds: string[]
  sectionIds: string[]
  subjectIds: string[]
}) {
  const db = loadDB()
  const email = input.email.trim().toLowerCase()
  if (db.profiles.some((p) => p.email.toLowerCase() === email)) throw new Error('Email already used')
  const profile = {
    id: uid('pr'),
    email,
    password: 'Teacher@123',
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
  }
  db.profiles.push(profile)
  db.roles.push({ profileId: profile.id, schoolId: input.schoolId, role: 'teacher' })
  const teacher: Teacher = {
    id: uid('tch'),
    schoolId: input.schoolId,
    profileId: profile.id,
    employeeCode: `EMP${Date.now().toString().slice(-5)}`,
    department: input.department.trim() || 'General',
    classIds: input.classIds,
    sectionIds: input.sectionIds,
    subjectIds: input.subjectIds,
  }
  db.teachers.push(teacher)
  emit()
  return { teacher, email, password: profile.password }
}
