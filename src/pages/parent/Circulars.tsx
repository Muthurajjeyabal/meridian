import { format, parseISO } from 'date-fns'
import { useState } from 'react'
import { Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/cn'
import { currentStudent, loadDB } from '../../lib/store'

export default function Circulars() {
  const { session } = useApp()
  const db = loadDB()
  const student = session ? currentStudent(session) : null
  const [tab, setTab] = useState<'circulars' | 'news'>('circulars')
  if (!student) return null
  const items = tab === 'circulars' ? db.circulars.filter((c) => c.schoolId === student.schoolId) : db.news.filter((n) => n.schoolId === student.schoolId)
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 rounded-2xl bg-white p-1">
        {(['circulars', 'news'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('rounded-xl py-2 text-sm font-semibold capitalize', tab === t && 'bg-cyan-600 text-white')}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <p className="font-bold">{item.title}</p>
            <p className="mt-1 text-xs text-slate-400">{format(parseISO(item.publishedAt), 'd MMM yyyy')}</p>
            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
