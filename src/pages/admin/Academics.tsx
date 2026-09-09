import { Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { loadDB, publishCircular } from '../../lib/store'
import { useState } from 'react'
import { Button, Field } from '../../components/ui'

export default function Academics() {
  const { session } = useApp()
  const db = loadDB()
  const classes = db.classes.filter((c) => c.schoolId === session?.schoolId)
  const subjects = db.subjects.filter((s) => s.schoolId === session?.schoolId)
  const exams = db.exams.filter((e) => e.schoolId === session?.schoolId)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="font-bold">Classes & sections</h2>
        <div className="mt-3 columns-2 text-sm">
          {classes.map((c) => {
            const secs = db.sections.filter((s) => s.classId === c.id).map((s) => s.name).join(' ')
            return <p key={c.id} className="mb-1">{c.name} · {secs}</p>
          })}
        </div>
      </Card>
      <Card>
        <h2 className="font-bold">Subjects</h2>
        <p className="mt-2 text-sm text-slate-600">{subjects.map(s => s.name).join(' · ')}</p>
        <h2 className="mt-4 font-bold">Exams</h2>
        {exams.map((e) => <p key={e.id} className="text-sm">{e.name} · {e.startsOn}</p>)}
      </Card>
      <Card className="lg:col-span-2">
        <h2 className="font-bold">Publish circular</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <Field label="Body" value={body} onChange={(e)=>setBody(e.target.value)} />
        </div>
        <Button className="mt-3" disabled={!title || !session?.schoolId} onClick={() => { publishCircular(session!.schoolId!, title, body); setTitle(''); setBody('') }}>Publish</Button>
      </Card>
    </div>
  )
}
