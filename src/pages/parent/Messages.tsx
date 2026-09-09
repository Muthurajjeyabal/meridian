import { format, parseISO } from 'date-fns'
import { Card, Empty } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { currentStudent, loadDB, markMessageRead } from '../../lib/store'

export default function Messages() {
  const { session } = useApp()
  const db = loadDB()
  const student = session ? currentStudent(session) : null
  if (!session || !student) return null
  const list = db.messages.filter((m) => m.recipientId === session.profileId && (!m.studentId || m.studentId === student.id))
  if (!list.length) return <Empty title="No messages" hint="Teachers and office notes will appear here." />
  return (
    <div className="space-y-3">
      {list.map((m) => {
        const sender = db.profiles.find((p) => p.id === m.senderId)
        return (
          <Card key={m.id} onClick={() => markMessageRead(m.id)}>
            <div className="flex items-start justify-between">
              <p className="font-bold">{m.subject}</p>
              {!m.readAt && <span className="h-2 w-2 rounded-full bg-cyan-500" />}
            </div>
            <p className="text-xs text-slate-500">{sender?.fullName} · {format(parseISO(m.createdAt), 'd MMM, h:mm a')}</p>
            <p className="mt-2 text-sm text-slate-600">{m.body}</p>
          </Card>
        )
      })}
    </div>
  )
}
