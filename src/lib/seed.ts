
import type {
  AttendanceRow, DB, Homework, HomeworkSubmission, Klass, Mark, Message,
  Payment, Section, Student, StudentFee,
} from '../types'
import {
  P_ADMIN1, P_ADMIN2, P_PARENT1, P_PARENT2, P_SUPER, P_TEACH1, P_TEACH2,
  PAR1, PAR2, S1, S2, ST_AARAV, ST_ANANYA, ST_HV, T1, T2, YEAR1, YEAR2,
} from './ids'

const CLASS_NAMES = ['LKG','UKG','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
const SECTIONS = ['A','B','C','D']
const SUBJECTS = [
  ['Mathematics','MAT','#2563eb'],
  ['English','ENG','#7c3aed'],
  ['Science','SCI','#059669'],
  ['Social Studies','SST','#d97706'],
  ['Hindi','HIN','#dc2626'],
  ['Computer Science','CSC','#0891b2'],
]

function dateOffset(days: number) {
  const d = new Date('2026-09-09T00:00:00+05:30')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function weekdaysBack(count: number) {
  const out: string[] = []
  const d = new Date('2026-09-09T00:00:00+05:30')
  while (out.length < count) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() - 1)
  }
  return out.reverse()
}

function grade(m: number) {
  if (m >= 90) return 'A+'
  if (m >= 80) return 'A'
  if (m >= 70) return 'B+'
  if (m >= 60) return 'B'
  if (m >= 50) return 'C'
  return 'D'
}

function buildClasses(schoolId: string): { classes: Klass[]; sections: Section[] } {
  const classes: Klass[] = CLASS_NAMES.map((name, i) => ({
    id: `${schoolId}_cls_${name}`,
    schoolId,
    name,
    order: i,
  }))
  const sections: Section[] = []
  for (const c of classes) {
    for (const s of SECTIONS) {
      sections.push({ id: `${c.id}_sec_${s}`, schoolId, classId: c.id, name: s })
    }
  }
  return { classes, sections }
}

const firstNames = ['Rohan','Diya','Kabir','Myra','Vivaan','Sara','Advik','Kiara','Reyansh','Aisha','Ishaan','Zara','Arnav','Anvi','Dev']
const lastNames = ['Sharma','Iyer','Nair','Kapoor','Reddy','Banerjee','Joshi','Malhotra','Desai','Kulkarni']

function extraStudents(schoolId: string, yearId: string, classId: string, sectionId: string, n: number, seed: number): Student[] {
  const out: Student[] = []
  for (let i = 0; i < n; i++) {
    const fn = firstNames[(seed + i) % firstNames.length]
    const ln = lastNames[(seed + i * 3) % lastNames.length]
    out.push({
      id: `${schoolId}_stu_${classId}_${sectionId}_${i}`,
      schoolId,
      academicYearId: yearId,
      classId,
      sectionId,
      firstName: fn,
      lastName: ln,
      admissionNo: `ADM${2026}${String(seed + i).padStart(4, '0')}`,
      rollNo: String(i + 3),
      dateOfBirth: `2015-0${(i % 8) + 1}-1${i % 9}`,
      gender: i % 2 === 0 ? 'male' : 'female',
      bloodGroup: ['O+','A+','B+','AB+'][i % 4],
      photoHue: (seed * 17 + i * 41) % 360,
    })
  }
  return out
}

export function createSeed(): DB {
  const nr = buildClasses(S1)
  const hv = buildClasses(S2)
  const classV = `${S1}_cls_V`
  const classII = `${S1}_cls_II`
  const secVD = `${classV}_sec_D`
  const secIIB = `${classII}_sec_B`
  const classHV = `${S2}_cls_IV`
  const secHVA = `${classHV}_sec_A`

  const subjects = [S1, S2].flatMap((sid) =>
    SUBJECTS.map(([name, code, color]) => ({
      id: `${sid}_sub_${code}`,
      schoolId: sid,
      name,
      code,
      color,
    })),
  )

  const aarav: Student = {
    id: ST_AARAV, schoolId: S1, academicYearId: YEAR1, classId: classV, sectionId: secVD,
    firstName: 'Aarav', lastName: 'Mehta', admissionNo: 'ADM20260412', rollNo: '18',
    dateOfBirth: '2015-07-22', gender: 'male', bloodGroup: 'O+', photoHue: 198,
  }
  const ananya: Student = {
    id: ST_ANANYA, schoolId: S1, academicYearId: YEAR1, classId: classII, sectionId: secIIB,
    firstName: 'Ananya', lastName: 'Mehta', admissionNo: 'ADM20260890', rollNo: '07',
    dateOfBirth: '2018-11-03', gender: 'female', bloodGroup: 'A+', photoHue: 328,
  }
  const isha: Student = {
    id: ST_HV, schoolId: S2, academicYearId: YEAR2, classId: classHV, sectionId: secHVA,
    firstName: 'Isha', lastName: 'Kapoor', admissionNo: 'HV2026011', rollNo: '04',
    dateOfBirth: '2016-03-14', gender: 'female', bloodGroup: 'B+', photoHue: 142,
  }

  const classmatesV = extraStudents(S1, YEAR1, classV, secVD, 12, 100)
  const classmatesII = extraStudents(S1, YEAR1, classII, secIIB, 8, 200)
  const classmatesHV = extraStudents(S2, YEAR2, classHV, secHVA, 6, 300)
  const students = [aarav, ananya, isha, ...classmatesV, ...classmatesII, ...classmatesHV]

  const days = weekdaysBack(42)
  const attendance: AttendanceRow[] = []
  for (const st of students) {
    days.forEach((date, i) => {
      let status: AttendanceRow['status'] = 'present'
      if (st.id === ST_AARAV) {
        if (i === days.length - 8 || i === days.length - 19) status = 'absent'
        else if (i === days.length - 3) status = 'late'
      } else if (st.id === ST_ANANYA) {
        if (i === days.length - 5) status = 'absent'
        else if (i === days.length - 12) status = 'late'
      } else if ((i + st.photoHue) % 17 === 0) status = 'absent'
      else if ((i + st.photoHue) % 11 === 0) status = 'late'
      attendance.push({
        id: `att_${st.id}_${date}`,
        schoolId: st.schoolId,
        studentId: st.id,
        classId: st.classId,
        sectionId: st.sectionId,
        date,
        status,
        markedBy: T1,
      })
    })
  }

  const hwDefs = [
    [ST_AARAV, 'MAT', 'Fractions worksheet', 'Complete exercise 4.2 and 4.3 from the textbook. Show working.', -1],
    [ST_AARAV, 'SCI', 'Plant cell diagram', 'Draw and label a plant cell. Colour neatly.', 1],
    [ST_AARAV, 'ENG', 'Descriptive paragraph', 'Write 120 words on "A rainy afternoon".', 2],
    [ST_AARAV, 'SST', 'Map work — rivers', 'Mark five major rivers of India on the outline map.', 4],
    [ST_AARAV, 'CSC', 'Scratch animation', 'Create a 10-second animation of a bouncing ball.', 6],
    [ST_AARAV, 'HIN', 'पत्र लेखन', 'अपने मित्र को विद्यालय यात्रा के विषय पर पत्र लिखिए।', 3],
    [ST_AARAV, 'MAT', 'Mental maths drill', 'Timed practice: 20 mixed operations.', -4],
    [ST_AARAV, 'SCI', 'Water cycle notes', 'Revise evaporation and condensation with examples.', -6],
    [ST_ANANYA, 'ENG', 'Phonics reader', 'Read pages 12–16 with a parent and circle new words.', 1],
    [ST_ANANYA, 'MAT', 'Number bonds', 'Fill the missing numbers to make 10.', 2],
    [ST_ANANYA, 'SCI', 'Living / non-living', 'Cut and paste 5 living and 5 non-living things.', 5],
    [ST_HV, 'MAT', 'Multiplication tables', 'Revise tables 6 to 9.', 2],
  ] as const

  const homework: Homework[] = hwDefs.map((h, i) => {
    const student = students.find((s) => s.id === h[0])!
    return {
      id: `hw_${i}_${h[0]}`,
      schoolId: student.schoolId,
      classId: student.classId,
      sectionId: student.sectionId,
      subjectId: `${student.schoolId}_sub_${h[1]}`,
      teacherId: student.schoolId === S1 ? T1 : T1,
      title: h[2],
      description: h[3],
      dueOn: dateOffset(h[4] as number),
      attachment: i % 3 === 0 ? 'worksheet.pdf' : undefined,
      createdAt: dateOffset((h[4] as number) - 3) + 'T09:00:00+05:30',
    }
  })

  const submissions: HomeworkSubmission[] = homework.map((hw, i) => {
    const studentId = hwDefs[i][0]
    const completed = i === 6 || i === 7
    return {
      id: `sub_${hw.id}`,
      schoolId: hw.schoolId,
      homeworkId: hw.id,
      studentId,
      completed,
      submittedAt: completed ? hw.dueOn + 'T18:00:00+05:30' : undefined,
    }
  })

  const feeItems = [
    ['Tuition — Term 1', 'tuition', 'term_1', 18000, '2026-06-15'],
    ['Tuition — Term 2', 'tuition', 'term_2', 18000, '2026-09-15'],
    ['Term activity', 'activity', 'term_2', 4500, '2026-09-20'],
    ['Transport (Jun–Sep)', 'transport', 'term_1', 6400, '2026-06-10'],
    ['Exam fee — Mid term', 'exam', 'term_2', 2500, '2026-09-01'],
    ['Admission (balance)', 'admission', 'one_time', 2500, '2026-04-10'],
  ] as const

  const feeStructures = feeItems.map((f, i) => ({
    id: `fs_nr_${i}`,
    schoolId: S1,
    academicYearId: YEAR1,
    classId: classV,
    name: f[0],
    category: f[1] as import("../types").FeeCategory,
    schedule: f[2],
    amount: f[3],
    dueOn: f[4],
  }))

  const studentFees: StudentFee[] = [
    ...feeStructures.map((fs) => ({
      id: `sf_aarav_${fs.id}`,
      schoolId: S1,
      studentId: ST_AARAV,
      feeStructureId: fs.id,
      amount: fs.amount,
      dueOn: fs.dueOn,
    })),
    {
      id: 'sf_ananya_t1',
      schoolId: S1,
      studentId: ST_ANANYA,
      feeStructureId: 'fs_nr_0',
      amount: 16000,
      dueOn: '2026-06-15',
    },
    {
      id: 'sf_ananya_t2',
      schoolId: S1,
      studentId: ST_ANANYA,
      feeStructureId: 'fs_nr_1',
      amount: 16000,
      dueOn: '2026-09-15',
    },
  ]

  const payments: Payment[] = [
    {
      id: 'pay_aarav_1', schoolId: S1, studentId: ST_AARAV, amount: 18000, method: 'upi',
      status: 'success', gateway: 'razorpay', gatewayOrderId: 'order_NR91A',
      gatewayPaymentId: 'pay_NR91Aok', createdAt: '2026-06-12T11:24:00+05:30',
      verifiedAt: '2026-06-12T11:24:08+05:30', receiptNo: 'RCT-20260612-91A',
    },
    {
      id: 'pay_aarav_fail', schoolId: S1, studentId: ST_AARAV, amount: 5000, method: 'card',
      status: 'failed', gateway: 'razorpay', gatewayOrderId: 'order_NRfail',
      createdAt: '2026-08-02T16:01:00+05:30',
    },
    {
      id: 'pay_ananya_1', schoolId: S1, studentId: ST_ANANYA, amount: 16000, method: 'netbanking',
      status: 'success', gateway: 'cashfree', gatewayOrderId: 'order_AN1',
      gatewayPaymentId: 'pay_AN1ok', createdAt: '2026-06-18T10:02:00+05:30',
      verifiedAt: '2026-06-18T10:02:11+05:30', receiptNo: 'RCT-20260618-AN1',
    },
  ]

  const examMid = {
    id: 'ex_mid_nr', schoolId: S1, academicYearId: YEAR1, name: 'Mid-Term Assessment',
    examType: 'term', startsOn: '2026-09-22', endsOn: '2026-09-30', published: true,
  }
  const examUnit = {
    id: 'ex_unit_nr', schoolId: S1, academicYearId: YEAR1, name: 'Unit Test 2',
    examType: 'unit', startsOn: '2026-08-18', endsOn: '2026-08-22', published: true,
  }
  const examUp = {
    id: 'ex_term2_nr', schoolId: S1, academicYearId: YEAR1, name: 'Term 2 Examination',
    examType: 'term', startsOn: '2026-11-18', endsOn: '2026-11-28', published: false,
  }

  const examSubjects = SUBJECTS.map(([name, code], i) => ({
    id: `es_mid_${code}`,
    schoolId: S1,
    examId: examMid.id,
    subjectId: `${S1}_sub_${code}`,
    classId: classV,
    maxMarks: 80,
    scheduledOn: dateOffset(13 + i),
  })).concat(SUBJECTS.slice(0, 4).map(([_, code], i) => ({
    id: `es_unit_${code}`,
    schoolId: S1,
    examId: examUnit.id,
    subjectId: `${S1}_sub_${code}`,
    classId: classV,
    maxMarks: 40,
    scheduledOn: '2026-08-1' + (8 + i),
  })))

  const aaravScores: Record<string, number> = {
    es_mid_MAT: 71, es_mid_ENG: 74, es_mid_SCI: 68, es_mid_SST: 70, es_mid_HIN: 66, es_mid_CSC: 76,
    es_unit_MAT: 34, es_unit_ENG: 36, es_unit_SCI: 31, es_unit_SST: 33,
  }
  const marks: Mark[] = Object.entries(aaravScores).map(([examSubjectId, marks]) => ({
    id: `mk_${examSubjectId}_${ST_AARAV}`,
    schoolId: S1,
    examSubjectId,
    studentId: ST_AARAV,
    marks,
    grade: grade((marks / (examSubjectId.startsWith('es_unit') ? 40 : 80)) * 100),
  }))

  return {
    schools: [
      {
        id: S1, slug: 'northridge', name: 'Northridge Academy', city: 'Bengaluru', state: 'Karnataka',
        email: 'office@northridge.edu', phone: '+91 80 4120 2200',
        address: '14 Willow Park, Indiranagar', currency: 'INR',
        subscriptionStatus: 'active', subscriptionPlan: 'Campus Pro', seats: 2500,
        studentCount: 0, isActive: true,
      },
      {
        id: S2, slug: 'harborview', name: 'Harborview Public School', city: 'Chennai', state: 'Tamil Nadu',
        email: 'hello@harborview.edu', phone: '+91 44 2811 4400',
        address: '88 Marina Link Road', currency: 'INR',
        subscriptionStatus: 'trial', subscriptionPlan: 'Starter', seats: 800,
        studentCount: 0, isActive: true,
      },
    ],
    profiles: [
      { id: P_SUPER, email: 'super@meridian.app', password: 'Super@123', fullName: 'Nalini Rao', phone: '+91 90000 00001' },
      { id: P_ADMIN1, email: 'admin@northridge.edu', password: 'Admin@123', fullName: 'Vikram Sen', phone: '+91 90000 00002' },
      { id: P_ADMIN2, email: 'admin@harborview.edu', password: 'Admin@123', fullName: 'Lakshmi Iyer', phone: '+91 90000 00003' },
      { id: P_TEACH1, email: 'teacher@northridge.edu', password: 'Teacher@123', fullName: 'Meera Krishnan', phone: '+91 90000 00004' },
      { id: P_TEACH2, email: 'arjun.teacher@northridge.edu', password: 'Teacher@123', fullName: 'Arjun Deshpande', phone: '+91 90000 00005' },
      { id: P_PARENT1, email: 'parent@northridge.edu', password: 'Parent@123', fullName: 'Priya Mehta', phone: '+91 98450 11220' },
      { id: P_PARENT2, email: 'parent@harborview.edu', password: 'Parent@123', fullName: 'Kabir Kapoor', phone: '+91 98840 33445' },
    ],
    roles: [
      { profileId: P_SUPER, schoolId: null, role: 'super_admin' },
      { profileId: P_ADMIN1, schoolId: S1, role: 'school_admin' },
      { profileId: P_ADMIN2, schoolId: S2, role: 'school_admin' },
      { profileId: P_TEACH1, schoolId: S1, role: 'teacher' },
      { profileId: P_TEACH2, schoolId: S1, role: 'teacher' },
      { profileId: P_PARENT1, schoolId: S1, role: 'parent' },
      { profileId: P_PARENT2, schoolId: S2, role: 'parent' },
    ],
    years: [
      { id: YEAR1, schoolId: S1, name: '2026-2027', startsOn: '2026-04-01', endsOn: '2027-03-31', isCurrent: true },
      { id: YEAR2, schoolId: S2, name: '2026-2027', startsOn: '2026-04-01', endsOn: '2027-03-31', isCurrent: true },
    ],
    classes: [...nr.classes, ...hv.classes],
    sections: [...nr.sections, ...hv.sections],
    subjects,
    teachers: [
      {
        id: T1, schoolId: S1, profileId: P_TEACH1, employeeCode: 'NR-T-014',
        department: 'Mathematics', classIds: [classV, classII], sectionIds: [secVD, secIIB],
        subjectIds: [`${S1}_sub_MAT`, `${S1}_sub_SCI`],
      },
      {
        id: T2, schoolId: S1, profileId: P_TEACH2, employeeCode: 'NR-T-029',
        department: 'English', classIds: [classV], sectionIds: [secVD],
        subjectIds: [`${S1}_sub_ENG`],
      },
    ],
    parents: [
      { id: PAR1, schoolId: S1, profileId: P_PARENT1, occupation: 'Product designer' },
      { id: PAR2, schoolId: S2, profileId: P_PARENT2, occupation: 'Architect' },
    ],
    students,
    studentParents: [
      { studentId: ST_AARAV, parentId: PAR1, relationship: 'mother', schoolId: S1 },
      { studentId: ST_ANANYA, parentId: PAR1, relationship: 'mother', schoolId: S1 },
      { studentId: ST_HV, parentId: PAR2, relationship: 'father', schoolId: S2 },
    ],
    studentProfiles: [
      {
        studentId: ST_AARAV, schoolId: S1,
        fatherName: 'Rohit Mehta', fatherMobile: '+91 98450 11221',
        motherName: 'Priya Mehta', motherMobile: '+91 98450 11220',
        guardianName: 'Priya Mehta', guardianMobile: '+91 98450 11220',
        communicationMobile: '+91 98450 11220', email: 'priya.mehta@example.com',
        address: '42, 3rd Cross, Domlur, Bengaluru 560071',
      },
      {
        studentId: ST_ANANYA, schoolId: S1,
        fatherName: 'Rohit Mehta', fatherMobile: '+91 98450 11221',
        motherName: 'Priya Mehta', motherMobile: '+91 98450 11220',
        guardianName: 'Priya Mehta', guardianMobile: '+91 98450 11220',
        communicationMobile: '+91 98450 11220', email: 'priya.mehta@example.com',
        address: '42, 3rd Cross, Domlur, Bengaluru 560071',
      },
      {
        studentId: ST_HV, schoolId: S2,
        fatherName: 'Kabir Kapoor', fatherMobile: '+91 98840 33445',
        motherName: 'Nisha Kapoor', motherMobile: '+91 98840 33446',
        guardianName: 'Kabir Kapoor', guardianMobile: '+91 98840 33445',
        communicationMobile: '+91 98840 33445', email: 'kabir.kapoor@example.com',
        address: '12 Besant Avenue, Chennai 600020',
      },
    ],
    health: [
      {
        studentId: ST_AARAV, schoolId: S1, heightCm: 132, weightKg: 28.4,
        medicalNotes: 'Mild seasonal asthma. Inhaler kept with class teacher.',
        allergies: 'Peanuts', emergencyName: 'Rohit Mehta', emergencyPhone: '+91 98450 11221',
        visibleToParents: true,
      },
      {
        studentId: ST_ANANYA, schoolId: S1, heightCm: 114, weightKg: 19.8,
        medicalNotes: 'None recorded.', allergies: 'None',
        emergencyName: 'Priya Mehta', emergencyPhone: '+91 98450 11220', visibleToParents: true,
      },
      {
        studentId: ST_HV, schoolId: S2, heightCm: 126, weightKg: 24,
        medicalNotes: 'Restricted file — school nurse only.', allergies: 'Dust',
        emergencyName: 'Nisha Kapoor', emergencyPhone: '+91 98840 33446', visibleToParents: false,
      },
    ],
    attendance,
    homework,
    submissions,
    exams: [examMid, examUnit, examUp],
    examSubjects,
    marks,
    feeStructures,
    studentFees,
    payments,
    circulars: [
      { id: 'cir1', schoolId: S1, title: 'Term 2 parent meeting', body: 'Parent–teacher conferences will be held on 18 September, 9:00–13:00. Book a 10-minute slot through the office desk.', publishedAt: '2026-09-04T08:00:00+05:30', audience: 'parents', attachment: 'ptm-slots.pdf' },
      { id: 'cir2', schoolId: S1, title: 'Sports day rehearsal', body: 'Classes III–V will have an extra games period on Friday for march-past practice. Please send a water bottle and cap.', publishedAt: '2026-09-06T10:12:00+05:30', audience: 'parents' },
      { id: 'cir3', schoolId: S1, title: 'Updated pickup protocol', body: 'ID cards are mandatory at Gate 2 after 14:30. Temporary passes are issued only at the reception.', publishedAt: '2026-09-01T09:00:00+05:30', audience: 'parents' },
      { id: 'cir4', schoolId: S2, title: 'Harborview closed for local holiday', body: 'School will remain closed on 16 September for a city holiday.', publishedAt: '2026-09-08T07:30:00+05:30', audience: 'parents' },
    ],
    news: [
      { id: 'n1', schoolId: S1, title: 'Robotics club wins regional qualifier', body: 'The Grade VI–VIII team placed first at the Garden City Robotics Meet with an autonomous line-follower.', publishedAt: '2026-09-03T12:00:00+05:30' },
      { id: 'n2', schoolId: S1, title: 'Library week begins Monday', body: 'Drop a favourite book in the exchange crate outside the media centre.', publishedAt: '2026-09-07T09:00:00+05:30' },
      { id: 'n3', schoolId: S2, title: 'Harborview coastal clean-up', body: 'Senior students volunteer at Elliot’s Beach this Saturday.', publishedAt: '2026-09-05T11:00:00+05:30' },
    ],
    messages: [
      {
        id: 'msg1', schoolId: S1, senderId: P_TEACH1, recipientId: P_PARENT1, studentId: ST_AARAV,
        subject: 'Maths enrichment', body: 'Aarav finished the enrichment sheet early today. I have assigned an optional puzzle pack if he would like a challenge this weekend.',
        createdAt: '2026-09-08T16:40:00+05:30',
      },
      {
        id: 'msg2', schoolId: S1, senderId: P_ADMIN1, recipientId: P_PARENT1, studentId: ST_AARAV,
        subject: 'Transport reminder', body: 'Bus 12 will arrive 8 minutes later this week due to road work on 100 Feet Road.',
        createdAt: '2026-09-07T18:05:00+05:30', readAt: '2026-09-07T19:11:00+05:30',
      },
      {
        id: 'msg3', schoolId: S1, senderId: P_TEACH1, recipientId: P_PARENT1, studentId: ST_ANANYA,
        subject: 'Reading fluency', body: 'Ananya is blending sounds more confidently. Ten minutes of shared reading at home will help lock it in.',
        createdAt: '2026-09-05T15:20:00+05:30',
      },
      {
        id: 'msg4', schoolId: S2, senderId: P_ADMIN2, recipientId: P_PARENT2, studentId: ST_HV,
        subject: 'Welcome to Harborview', body: 'Kabir, Isha’s class WhatsApp is not official. Please use Meridian messages for school communication.',
        createdAt: '2026-09-02T10:00:00+05:30',
      },
    ],
    notifications: [
      { id: 'nt1', schoolId: S1, profileId: P_PARENT1, studentId: ST_AARAV, type: 'homework', title: 'New homework · Science', body: 'Plant cell diagram is due 10 Sep.', link: '/parent/homework', createdAt: '2026-09-08T09:10:00+05:30' },
      { id: 'nt2', schoolId: S1, profileId: P_PARENT1, studentId: ST_AARAV, type: 'fees', title: 'Fee reminder', body: 'Term 2 balance is still open.', link: '/parent/payments', createdAt: '2026-09-07T08:00:00+05:30' },
      { id: 'nt3', schoolId: S1, profileId: P_PARENT1, studentId: ST_AARAV, type: 'circular', title: 'Circular · PTM', body: 'Term 2 parent meeting on 18 Sep.', link: '/parent/circulars', createdAt: '2026-09-04T08:01:00+05:30', readAt: '2026-09-04T20:00:00+05:30' },
      { id: 'nt4', schoolId: S1, profileId: P_PARENT1, studentId: ST_ANANYA, type: 'attendance', title: 'Absence recorded', body: 'Ananya was marked absent on 3 Sep.', link: '/parent/attendance', createdAt: '2026-09-03T16:00:00+05:30' },
      { id: 'nt5', schoolId: S1, profileId: P_PARENT1, studentId: ST_AARAV, type: 'message', title: 'Message from Meera Krishnan', body: 'Maths enrichment note.', link: '/parent/messages', createdAt: '2026-09-08T16:41:00+05:30' },
      { id: 'nt6', schoolId: S2, profileId: P_PARENT2, studentId: ST_HV, type: 'circular', title: 'Holiday notice', body: 'School closed 16 Sep.', link: '/parent/circulars', createdAt: '2026-09-08T07:31:00+05:30' },
    ],
    prefs: [
      { profileId: P_PARENT1, homework: true, attendance: true, circulars: true, messages: true, fees: true, exams: true },
      { profileId: P_PARENT2, homework: true, attendance: true, circulars: true, messages: true, fees: true, exams: true },
    ],
  }
}
