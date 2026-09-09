import {
  Bell, BookOpen, CalendarCheck, CircleUserRound, CreditCard,
  GraduationCap, LayoutDashboard, LogOut, Menu, MessageSquare,
  MoreHorizontal, Settings, Users, Wallet, X,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { cn, initials } from '../lib/cn'
import { classLabel, currentStudent, loadDB, signOut, studentName, unreadNotifications } from '../lib/store'
import { Avatar } from './ui'

export function ParentShell({ children }: { children: ReactNode }) {
  const { session } = useApp()
  const nav = useNavigate()
  const loc = useLocation()
  const db = loadDB()
  const school = db.schools.find((s) => s.id === session?.schoolId)
  const student = session ? currentStudent(session) : null
  const unread = session ? unreadNotifications(session.profileId, session.studentId).length : 0
  const hideChrome = loc.pathname.includes('/siblings')

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-[#f3f7fb]">
      {!hideChrome && (
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-700 text-sm font-extrabold text-white">
              {school?.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                {school?.name}
              </p>
              {student && (
                <button onClick={() => nav('/parent/siblings')} className="flex items-center gap-1 truncate text-sm font-bold text-slate-900">
                  {studentName(student)}
                  <span className="text-xs font-medium text-slate-500">· {classLabel(student)}</span>
                </button>
              )}
            </div>
            <button onClick={() => nav('/parent/notifications')} className="relative grid h-10 w-10 place-items-center rounded-2xl bg-slate-50">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {student && (
              <button onClick={() => nav('/parent/siblings')}>
                <Avatar name={studentName(student)} hue={student.photoHue} size={40} />
              </button>
            )}
          </div>
        </header>
      )}
      <main className={hideChrome ? '' : 'safe-bottom px-4 pt-4'}>{children}</main>
      {!hideChrome && (
        <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-lg -translate-x-1/2 border-t border-slate-100 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
          <div className="grid grid-cols-4">
            {[
              ['/parent', LayoutDashboard, 'Dashboard'],
              ['/parent/profile', CircleUserRound, 'Profile'],
              ['/parent/payments', Wallet, 'Payment'],
              ['/parent/more', MoreHorizontal, 'More'],
            ].map(([to, Icon, label]) => {
              const active = label === 'Dashboard' ? loc.pathname === '/parent' : loc.pathname.startsWith(String(to))
              return (
                <NavLink
                  key={String(to)}
                  to={String(to)}
                  end={label === 'Dashboard'}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold',
                    active ? 'text-cyan-700' : 'text-slate-400',
                  )}
                >
                  <span className={cn('grid h-8 w-12 place-items-center rounded-2xl', active && 'bg-cyan-50')}>
                    <Icon size={18} />
                  </span>
                  {String(label)}
                </NavLink>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

const staffNav = {
  school_admin: [
    ['/admin', LayoutDashboard, 'Overview'],
    ['/admin/people', Users, 'People'],
    ['/admin/academics', GraduationCap, 'Academics'],
    ['/admin/attendance', CalendarCheck, 'Attendance'],
    ['/admin/homework', BookOpen, 'Homework'],
    ['/admin/fees', CreditCard, 'Fees'],
    ['/admin/messages', MessageSquare, 'Messages'],
    ['/admin/settings', Settings, 'Settings'],
  ],
  teacher: [
    ['/teacher', LayoutDashboard, 'Home'],
    ['/teacher/attendance', CalendarCheck, 'Attendance'],
    ['/teacher/homework', BookOpen, 'Homework'],
    ['/teacher/marks', GraduationCap, 'Marks'],
    ['/teacher/messages', MessageSquare, 'Messages'],
  ],
  super_admin: [
    ['/super', LayoutDashboard, 'Network'],
    ['/super/schools', GraduationCap, 'Schools'],
    ['/super/reports', CreditCard, 'Reports'],
  ],
} as const

export function StaffShell({ children, kind }: { children: ReactNode; kind: 'school_admin' | 'teacher' | 'super_admin' }) {
  const { session } = useApp()
  const [open, setOpen] = useState(false)
  const db = loadDB()
  const profile = db.profiles.find((p) => p.id === session?.profileId)
  const school = db.schools.find((s) => s.id === session?.schoolId)
  const items = staffNav[kind]
  const title = kind === 'super_admin' ? 'Meridian Network' : school?.name ?? 'Campus'
  return (
    <div className="min-h-dvh bg-[#eef3f8] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-[260px] border-r border-slate-200 bg-slate-950 text-white transition lg:static',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Meridian</p>
            <p className="mt-1 text-sm font-bold leading-tight">{title}</p>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <nav className="space-y-1 px-3">
          {items.map(([to, Icon, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length === 2}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5',
                  isActive && 'bg-cyan-400/15 text-white',
                )
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => signOut()}
          className="absolute bottom-6 left-3 right-3 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-400 hover:bg-white/5"
        >
          <LogOut size={16} /> Sign out
        </button>
      </aside>
      <div>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <button className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 lg:hidden" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          <p className="hidden text-sm font-semibold text-slate-600 lg:block">Academic year 2026-2027</p>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold leading-none">{profile?.fullName}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{session?.role.replace('_', ' ')}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-700 text-xs font-bold text-white">
              {initials(profile?.fullName ?? 'U')}
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
