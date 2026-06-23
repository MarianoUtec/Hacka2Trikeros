import type { ReactNode, ButtonHTMLAttributes } from 'react'
import type { Severity, SignalStatus, VitalState, Species, Climate } from '@/types'

// ── Spinner ───────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div
      className={`${s} border-2 border-accent/30 border-t-accent rounded-full animate-spin`}
      role="status"
      aria-label="Cargando"
    />
  )
}

// ── Button ────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-2 font-display font-medium rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-accent hover:bg-accent-glow text-white shadow-lg shadow-accent/20',
    ghost: 'bg-transparent border border-border hover:border-accent hover:text-accent text-dim',
    danger: 'bg-danger/10 border border-danger/40 hover:bg-danger/20 text-danger',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm' }

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

// ── Severity badge ────────────────────────────────────────────────
const severityMap: Record<Severity, { label: string; cls: string }> = {
  LEVE: { label: 'Leve', cls: 'text-ok bg-ok/10 border-ok/30' },
  MODERADO: { label: 'Moderado', cls: 'text-signal bg-signal/10 border-signal/30' },
  GRAVE: { label: 'Grave', cls: 'text-warn bg-warn/10 border-warn/30' },
  CRITICO: { label: 'Crítico', cls: 'text-danger bg-danger/10 border-danger/30' },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { label, cls } = severityMap[severity]
  return (
    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  )
}

// ── Status badge ──────────────────────────────────────────────────
const statusMap: Record<SignalStatus, { label: string; cls: string }> = {
  RECIBIDA: { label: 'Recibida', cls: 'text-dim bg-muted/20 border-muted/40' },
  PROCESANDO: { label: 'Procesando', cls: 'text-warn bg-warn/10 border-warn/30' },
  ATENDIDA: { label: 'Atendida', cls: 'text-ok bg-ok/10 border-ok/30' },
}

export function StatusBadge({ status }: { status: SignalStatus }) {
  const { label, cls } = statusMap[status]
  return (
    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  )
}

// ── Vital state badge ─────────────────────────────────────────────
const vitalMap: Record<VitalState, { label: string; cls: string }> = {
  ESTABLE: { label: 'Estable', cls: 'text-ok bg-ok/10 border-ok/30' },
  HAMBRIENTO: { label: 'Hambriento', cls: 'text-warn bg-warn/10 border-warn/30' },
  AGITADO: { label: 'Agitado', cls: 'text-signal bg-signal/10 border-signal/30' },
  MUTANDO: { label: 'Mutando', cls: 'text-accent-glow bg-accent/10 border-accent/30' },
  CRITICO: { label: 'Crítico', cls: 'text-danger bg-danger/10 border-danger/30' },
}

export function VitalBadge({ state }: { state: VitalState }) {
  const { label, cls } = vitalMap[state]
  return (
    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  )
}

// ── Species icon ──────────────────────────────────────────────────
const speciesEmoji: Record<Species, string> = {
  BLOBITO: '🫧',
  CHISPA: '⚡',
  GRUNON: '😤',
  DORMILON: '💤',
  GLITCHY: '👾',
}

export function SpeciesIcon({ species }: { species: Species }) {
  return <span title={species}>{speciesEmoji[species]}</span>
}

// ── Climate label ─────────────────────────────────────────────────
export const climateLabel: Record<Climate, string> = {
  PIXEL_FOREST: 'Pixel Forest',
  NEON_CAVE: 'Neon Cave',
  CLOUD_AQUARIUM: 'Cloud Aquarium',
  RETRO_ARCADE: 'Retro Arcade',
}

// ── Error box ─────────────────────────────────────────────────────
export function ErrorBox({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 flex items-start gap-3">
      <span className="text-danger text-lg" aria-hidden>⚠</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-danger">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs text-danger underline underline-offset-2 hover:no-underline"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl opacity-30">🔭</span>
      <p className="text-dim text-sm">{message}</p>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-panel p-4 ${className}`}
    >
      {children}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, className = '', children, ...rest }: SelectProps) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs text-dim font-display">{label}</span>}
      <select
        className={`bg-panel border border-border rounded-lg px-3 py-2 text-sm text-bright focus:outline-none focus:border-accent transition-colors ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}

// ── Input ─────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...rest }: InputProps) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs text-dim font-display">{label}</span>}
      <input
        className={`bg-panel border border-border rounded-lg px-3 py-2 text-sm text-bright placeholder:text-muted focus:outline-none focus:border-accent transition-colors ${className}`}
        {...rest}
      />
    </label>
  )
}
