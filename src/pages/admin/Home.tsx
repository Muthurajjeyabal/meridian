import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { inr } from '../../lib/cn'
import { loadDB, schoolStats } from '../../lib/store'

export default function AdminHome() {
  const { session } = useApp()
  const db = loadDB()
  const stats = session?.schoolId ? schoolStats(session.schoolId) : null
  if (!stats) return null
  const months = ['Apr','May','Jun','Jul','Aug','Sep']
  const feeChart = months.map((m, i) => ({ m, collected: i < 3 ? 18000 : i === 5 ? stats.collected : 0 }))
  const strength = db.classes.filter(c => c.schoolId === session?.schoolId).slice(0, 8).map((c) => ({
    name: c.name,
    n: db.students.filter((s) => s.classId === c.id).length,
  }))
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">School operations</p>
        <h1 className="text-3xl font-extrabold">Campus overview</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Students', stats.students],
          ['Teachers', stats.teachers],
          ['Parents', stats.parents],
          ['Homework', stats.homework],
          ['Present today', `${stats.presentToday}/${stats.attendanceDenom || 0}`],
          ['Fees collected', inr(stats.collected)],
          ['Pending fees', inr(stats.pending)],
          ['Exams', stats.exams],
        ].map(([l, v]) => (
          <Card key={String(l)}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{l}</p><p className="mt-1 text-2xl font-extrabold">{v}</p></Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-64">
          <p className="mb-2 font-bold">Fee collection</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={feeChart}><XAxis dataKey="m" /><Tooltip /><Bar dataKey="collected" fill="#0891b2" radius={[8,8,0,0]} /></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-64">
          <p className="mb-2 font-bold">Student strength</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={strength}><XAxis dataKey="name" /><Tooltip /><Bar dataKey="n" fill="#0e7490" radius={[8,8,0,0]} /></BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
