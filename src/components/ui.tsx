import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { cn, initials } from '../lib/cn'

export function Avatar({ name, hue = 200, size = 44 }: { name: string; hue?: number; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white shadow-inner"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: `linear-gradient(145deg, hsl(${hue} 70% 46%), hsl(${(hue + 28) % 360} 75% 38%))`,
      }}
    >
      {initials(name)}
    </div>
  )
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-3xl border border-white/80 bg-white p-4 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.35)]',
        onClick && 'cursor-pointer active:scale-[0.99] transition',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'soft' | 'danger' }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50',
        variant === 'primary' && 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
        variant === 'soft' && 'bg-brand-50 text-brand-800 hover:bg-brand-100',
        variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700',
        className,
      )}
      {...props}
    />
  )
}

export function Badge({
  children,
  tone = 'brand',
}: {
  children: ReactNode
  tone?: 'brand' | 'amber' | 'rose' | 'emerald' | 'slate'
}) {
  const map = {
    brand: 'bg-cyan-50 text-cyan-800',
    amber: 'bg-amber-50 text-amber-800',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-800',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', map[tone])}>{children}</span>
}

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-brand-500/30 focus:bg-white focus:ring-4"
        {...props}
      />
    </label>
  )
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-200/80', className)} />
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {action}
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
  accent,
  onClick,
}: {
  label: string
  value: string
  hint?: string
  accent: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl bg-white p-3.5 text-left shadow-[0_10px_28px_-18px_rgba(15,23,42,0.4)] ring-1 ring-slate-100 transition active:scale-[0.98]"
    >
      <div className={cn('mb-3 h-1.5 w-8 rounded-full', accent)} />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </button>
  )
}
