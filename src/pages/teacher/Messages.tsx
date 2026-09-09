import { useState } from 'react'
import { Button, Card, Field } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { loadDB, sendMessage } from '../../lib/store'

export default function TeacherMessages() {
  const { session } = useApp()
  const db = loadDB()
  const parents = db.parents.filter((p) => p.schoolId === session?.schoolId)
  const [recipient, setRecipient] = useState(parents[0]?.profileId ?? '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const mine = db.messages.filter((m) => m.senderId === session?.profileId || m.recipientId === session?.profileId)
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="font-bold">Write to a parent</h2>
        <div className="mt-3 space-y-3">
          <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
            {parents.map((p) => {
              const pr = db.profiles.find((x) => x.id === p.profileId)
              return <option key={p.id} value={p.profileId}>{pr?.fullName}</option>
            })}
          </select>
          <Field label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Field label="Message" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button className="w-full" disabled={!subject || !body || !session?.schoolId} onClick={() => {
            sendMessage({ schoolId: session!.schoolId!, senderId: session!.profileId, recipientId: recipient, subject, body })
            setSubject(''); setBody('')
          }}>Send</Button>
        </div>
      </Card>
      <div className="space-y-2">
        {mine.map((m) => (
          <Card key={m.id}>
            <p className="font-semibold">{m.subject}</p>
            <p className="text-sm text-slate-500">{m.body}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
