import { Button, Card } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { loadDB, savePrefs, signOut } from '../../lib/store'

export default function Settings() {
  const { session } = useApp()
  const db = loadDB()
  const profile = db.profiles.find((p) => p.id === session?.profileId)
  const prefs = db.prefs.find((p) => p.profileId === session?.profileId)
  if (!session || !profile) return null
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs text-slate-500">Signed in</p>
        <p className="font-bold">{profile.fullName}</p>
        <p className="text-sm text-slate-500">{profile.email}</p>
      </Card>
      <Card>
        <h3 className="font-bold">Academic year</h3>
        <p className="mt-1 text-sm">2026-2027</p>
      </Card>
      <Card>
        <h3 className="font-bold">Notifications</h3>
        <div className="mt-3 space-y-2">
          {(['homework','attendance','circulars','messages','fees','exams'] as const).map((k) => (
            <label key={k} className="flex items-center justify-between text-sm capitalize">
              {k}
              <input type="checkbox" checked={prefs?.[k] ?? true} onChange={(e) => savePrefs(session.profileId, { [k]: e.target.checked })} />
            </label>
          ))}
        </div>
      </Card>
      <Button variant="danger" className="w-full" onClick={() => signOut()}>Log out</Button>
    </div>
  )
}
