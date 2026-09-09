import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '../types'
import { getSession, loadDB, subscribe } from '../lib/store'

interface Ctx {
  session: Session | null
  ready: boolean
  tick: number
}

const C = createContext<Ctx>({ session: null, ready: false, tick: 0 })

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    loadDB()
    setSession(getSession())
    setReady(true)
    return subscribe(() => {
      setSession(getSession())
      setTick((t) => t + 1)
    })
  }, [])

  const value = useMemo(() => ({ session, ready, tick }), [session, ready, tick])
  return <C.Provider value={value}>{children}</C.Provider>
}

export function useApp() {
  return useContext(C)
}
