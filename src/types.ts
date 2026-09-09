export type Role = 'super_admin' | 'school_admin' | 'teacher' | 'parent'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type PaymentStatus = 'initiated' | 'pending' | 'processing' | 'success' | 'failed' | 'refunded'
export type FeeCategory = 'admission' | 'tuition' | 'term' | 'transport' | 'activity' | 'exam' | 'other'

export interface School {
  id: string
  slug: string
  name: string
  city: string
  state: string
  email: string
  phone: string
  address: string
  currency: string
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'paused' | 'cancelled'
  subscriptionPlan: string
  seats: number
  studentCount: number
  isActive: boolean
}

export interface Profile {
  id: string
  email: string
  password: string
  fullName: string
  phone: string
  avatar?: string
}

export interface UserRole {
  profileId: string
  schoolId: string | null
  role: Role
}

export interface AcademicYear {
  id: string
  schoolId: string
  name: string
  startsOn: string
  endsOn: string
  isCurrent: boolean
}

export interface Klass {
  id: string
  schoolId: string
  name: string
  order: number
}

export interface Section {
  id: string
  schoolId: string
  classId: string
  name: string
}

export interface Subject {
  id: string
  schoolId: string
  name: string
  code: string
  color: string
}

export interface Teacher {
  id: string
  schoolId: string
  profileId: string
  employeeCode: string
  department: string
  classIds: string[]
  sectionIds: string[]
  subjectIds: string[]
}

export interface Parent {
  id: string
  schoolId: string
  profileId: string
  occupation: string
}

export interface Student {
  id: string
  schoolId: string
  academicYearId: string
  classId: string
  sectionId: string
  firstName: string
  lastName: string
  admissionNo: string
  enrollmentNo?: string
  rollNo: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  bloodGroup: string
  photoHue: number
  photoUrl?: string
}

export interface StudentParentLink {
  studentId: string
  parentId: string
  relationship: string
  schoolId: string
}

export interface StudentProfile {
  studentId: string
  schoolId: string
  fatherName: string
  fatherMobile: string
  motherName: string
  motherMobile: string
  guardianName: string
  guardianMobile: string
  communicationMobile: string
  email: string
  address: string
}

export interface HealthRecord {
  studentId: string
  schoolId: string
  heightCm: number
  weightKg: number
  medicalNotes: string
  allergies: string
  emergencyName: string
  emergencyPhone: string
  visibleToParents: boolean
}

export interface AttendanceRow {
  id: string
  schoolId: string
  studentId: string
  classId: string
  sectionId: string
  date: string
  status: AttendanceStatus
  markedBy?: string
}

export interface Homework {
  id: string
  schoolId: string
  classId: string
  sectionId: string
  subjectId: string
  teacherId: string
  title: string
  description: string
  dueOn: string
  attachment?: string
  createdAt: string
}

export interface HomeworkSubmission {
  id: string
  schoolId: string
  homeworkId: string
  studentId: string
  completed: boolean
  note?: string
  submittedAt?: string
}

export interface Exam {
  id: string
  schoolId: string
  academicYearId: string
  name: string
  examType: string
  startsOn: string
  endsOn: string
  published: boolean
}

export interface ExamSubject {
  id: string
  schoolId: string
  examId: string
  subjectId: string
  classId: string
  maxMarks: number
  scheduledOn: string
}

export interface Mark {
  id: string
  schoolId: string
  examSubjectId: string
  studentId: string
  marks: number
  grade: string
}

export interface FeeStructure {
  id: string
  schoolId: string
  academicYearId: string
  classId: string | null
  name: string
  category: FeeCategory
  schedule: string
  amount: number
  dueOn: string
}

export interface StudentFee {
  id: string
  schoolId: string
  studentId: string
  feeStructureId: string
  amount: number
  dueOn: string
}

export interface Payment {
  id: string
  schoolId: string
  studentId: string
  amount: number
  method: string
  status: PaymentStatus
  gateway: string
  gatewayOrderId?: string
  gatewayPaymentId?: string
  createdAt: string
  verifiedAt?: string
  receiptNo?: string
}

export interface Circular {
  id: string
  schoolId: string
  title: string
  body: string
  publishedAt: string
  audience: string
  attachment?: string
}

export interface NewsItem {
  id: string
  schoolId: string
  title: string
  body: string
  publishedAt: string
}

export interface Message {
  id: string
  schoolId: string
  senderId: string
  recipientId: string
  studentId?: string
  subject: string
  body: string
  createdAt: string
  readAt?: string
}

export interface AppNotification {
  id: string
  schoolId: string
  profileId: string
  studentId?: string
  type: string
  title: string
  body: string
  link: string
  createdAt: string
  readAt?: string
}

export interface NotifPrefs {
  profileId: string
  homework: boolean
  attendance: boolean
  circulars: boolean
  messages: boolean
  fees: boolean
  exams: boolean
}

export interface Session {
  profileId: string
  role: Role
  schoolId: string | null
  studentId: string | null
}

export interface DB {
  schools: School[]
  profiles: Profile[]
  roles: UserRole[]
  years: AcademicYear[]
  classes: Klass[]
  sections: Section[]
  subjects: Subject[]
  teachers: Teacher[]
  parents: Parent[]
  students: Student[]
  studentParents: StudentParentLink[]
  studentProfiles: StudentProfile[]
  health: HealthRecord[]
  attendance: AttendanceRow[]
  homework: Homework[]
  submissions: HomeworkSubmission[]
  exams: Exam[]
  examSubjects: ExamSubject[]
  marks: Mark[]
  feeStructures: FeeStructure[]
  studentFees: StudentFee[]
  payments: Payment[]
  circulars: Circular[]
  news: NewsItem[]
  messages: Message[]
  notifications: AppNotification[]
  prefs: NotifPrefs[]
}
