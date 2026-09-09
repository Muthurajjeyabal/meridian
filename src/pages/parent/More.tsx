import { Bell, BookOpen, CalendarDays, ChevronRight, Inbox, LogOut, Megaphone, Settings as SettingsIcon, Trophy, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/store'

const items = [
  ['/parent/homework', BookOpen, 'Homework'],
  ['/parent/attendance', CalendarDays, 'Attendance'],
  ['/parent/exams', Trophy, 'Exams & performance'],
  ['/parent/circulars', Megaphone, 'Circulars & news'],
  ['/parent/messages', Inbox, 'Messages'],
  ['/parent/notifications', Bell, 'Notifications'],
  ['/parent/siblings', Users, 'Switch sibling'],
  ['/parent/settings', SettingsIcon, 'Settings'],
] as const

export default function More() {
  const nav = useNavigate()
  return (
    <div className="space-y-2">
      {items.map(([to, Icon, label]) => (
        <button key={to} onClick={() => nav(to)} className="flex w-full items-center gap-3 rounded-3xl bg-white px-4 py-3.5 text-left shadow-sm">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700"><Icon size={18} /></span>
          <span className="flex-1 font-semibold">{label}</span>
          <ChevronRight size={16} className="text-slate-400" />
        </button>
      ))}
      <button onClick={() => signOut()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl bg-white py-3 font-semibold text-rose-600">
        <LogOut size={16} /> Log out
      </button>
    </div>
  )
}
