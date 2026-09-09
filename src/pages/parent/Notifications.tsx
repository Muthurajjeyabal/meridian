import { Card, Empty } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { currentStudent, loadDB, markNotificationRead } from '../../lib/store'

export default function Notifications() {
  const { session } = useApp()
  const student = session ? currentStudent(session) : null
  if (!session) return null
  const list = loadDB().notifications.filter((n) => n.profileId === session.profileId && (!n.studentId || n.studentId === student?.id))
  return (
    <div className="space-y-3">
      {list.length === 0 && <Empty title="You are all caught up" />}
      {list.map((n) => (
        <Card key={n.id} onClick={() => markNotificationRead(n.id)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold">{n.title}</p>
              <p className="text-sm text-slate-500">{n.body}</p>
            </div>
            {!n.readAt && <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />}
          </div>
        </Card>
      ))}
    </div>
  )
}
