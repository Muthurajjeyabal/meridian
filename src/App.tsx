import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ParentShell, StaffShell } from './components/layouts'
import { Skeleton } from './components/ui'
import { useApp } from './context/AppContext'
import type { Role } from './types'
import Login from './pages/Login'
import ParentHome from './pages/parent/Home'
import ParentProfile from './pages/parent/Profile'
import ParentAttendance from './pages/parent/Attendance'
import ParentHomework from './pages/parent/Homework'
import ParentExams from './pages/parent/Exams'
import ParentPayments from './pages/parent/Payments'
import ParentMessages from './pages/parent/Messages'
import ParentCirculars from './pages/parent/Circulars'
import ParentNotifications from './pages/parent/Notifications'
import ParentMore from './pages/parent/More'
import ParentSettings from './pages/parent/Settings'
import Siblings from './pages/parent/Siblings'
import TeacherHome from './pages/teacher/Home'
import TeacherAttendance from './pages/teacher/Attendance'
import TeacherHomework from './pages/teacher/Homework'
import TeacherMarks from './pages/teacher/Marks'
import TeacherMessages from './pages/teacher/Messages'
import AdminHome from './pages/admin/Home'
import People from './pages/admin/People'
import Academics from './pages/admin/Academics'
import AdminFees from './pages/admin/Fees'
import AdminSettings from './pages/admin/Settings'
import SuperHome from './pages/super/Home'

function Guard({ roles }: { roles: Role[] }) {
  const { session, ready } = useApp()
  if (!ready) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (!roles.includes(session.role)) {
    if (session.role === 'parent') return <Navigate to="/parent" replace />
    if (session.role === 'teacher') return <Navigate to="/teacher" replace />
    if (session.role === 'school_admin') return <Navigate to="/admin" replace />
    return <Navigate to="/super" replace />
  }
  return <Outlet />
}

function ParentLayout() {
  return (
    <ParentShell>
      <Outlet />
    </ParentShell>
  )
}

export default function App() {
  const { session, ready } = useApp()
  if (!ready) return <div className="grid min-h-dvh place-items-center text-slate-500">Loading campus…</div>

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<Guard roles={['parent']} />}>
        <Route element={<ParentLayout />}>
          <Route path="/parent" element={<ParentHome />} />
          <Route path="/parent/profile" element={<ParentProfile />} />
          <Route path="/parent/attendance" element={<ParentAttendance />} />
          <Route path="/parent/homework" element={<ParentHomework />} />
          <Route path="/parent/exams" element={<ParentExams />} />
          <Route path="/parent/payments" element={<ParentPayments />} />
          <Route path="/parent/messages" element={<ParentMessages />} />
          <Route path="/parent/circulars" element={<ParentCirculars />} />
          <Route path="/parent/notifications" element={<ParentNotifications />} />
          <Route path="/parent/more" element={<ParentMore />} />
          <Route path="/parent/settings" element={<ParentSettings />} />
          <Route path="/parent/siblings" element={<Siblings />} />
        </Route>
      </Route>

      <Route element={<Guard roles={['teacher']} />}>
        <Route element={<StaffShell kind="teacher"><Outlet /></StaffShell>}>
          <Route path="/teacher" element={<TeacherHome />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/homework" element={<TeacherHomework />} />
          <Route path="/teacher/marks" element={<TeacherMarks />} />
          <Route path="/teacher/messages" element={<TeacherMessages />} />
        </Route>
      </Route>

      <Route element={<Guard roles={['school_admin']} />}>
        <Route element={<StaffShell kind="school_admin"><Outlet /></StaffShell>}>
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/people" element={<People />} />
          <Route path="/admin/academics" element={<Academics />} />
          <Route path="/admin/attendance" element={<TeacherAttendance />} />
          <Route path="/admin/homework" element={<TeacherHomework />} />
          <Route path="/admin/fees" element={<AdminFees />} />
          <Route path="/admin/messages" element={<TeacherMessages />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route element={<Guard roles={['super_admin']} />}>
        <Route element={<StaffShell kind="super_admin"><Outlet /></StaffShell>}>
          <Route path="/super" element={<SuperHome />} />
          <Route path="/super/schools" element={<SuperHome />} />
          <Route path="/super/reports" element={<SuperHome />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function HomeRedirect() {
  const { session } = useApp()
  if (!session) return <Navigate to="/login" replace />
  if (session.role === 'parent') return <Navigate to="/parent" replace />
  if (session.role === 'teacher') return <Navigate to="/teacher" replace />
  if (session.role === 'school_admin') return <Navigate to="/admin" replace />
  return <Navigate to="/super" replace />
}
