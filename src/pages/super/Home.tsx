import { useState } from 'react'
import { Button, Card, Field } from '../../components/ui'
import { inr } from '../../lib/cn'
import { createSchool, loadDB, schoolStats } from '../../lib/store'

export default function SuperHome() {
  const db = loadDB()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">Network</p>
        <h1 className="text-3xl font-extrabold">All campuses</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-xs text-slate-500">Schools</p><p className="text-2xl font-extrabold">{db.schools.length}</p></Card>
        <Card><p className="text-xs text-slate-500">Students on network</p><p className="text-2xl font-extrabold">{db.students.length}</p></Card>
        <Card><p className="text-xs text-slate-500">Active subscriptions</p><p className="text-2xl font-extrabold">{db.schools.filter(s=>s.subscriptionStatus==='active').length}</p></Card>
      </div>
      <div className="grid gap-3">
        {db.schools.map((sch) => {
          const st = schoolStats(sch.id)
          return (
            <Card key={sch.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">{sch.name}</p>
                <p className="text-sm text-slate-500">{sch.city} · {sch.subscriptionPlan} · {sch.subscriptionStatus}</p>
              </div>
              <div className="text-right text-sm">
                <p>{st.students} students · {st.teachers} teachers</p>
                <p className="text-slate-500">{inr(st.collected)} collected</p>
              </div>
            </Card>
          )
        })}
      </div>
      <Card>
        <h2 className="font-bold">Create school</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Name" value={name} onChange={(e)=>setName(e.target.value)} />
          <Field label="City" value={city} onChange={(e)=>setCity(e.target.value)} />
        </div>
        <Button className="mt-3" disabled={!name} onClick={() => { createSchool(name, city); setName(''); setCity('') }}>Add campus</Button>
      </Card>
    </div>
  )
}
