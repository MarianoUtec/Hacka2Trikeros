import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary } from '@/api/endpoints'
import type { DashboardSummary } from '@/types'
import { Spinner, ErrorBox, Card } from '@/components/ui'

function StatCard({
  label,
  value,
  sub,
  color = 'accent',
}: {
  label: string
  value: number | string
  sub?: string
  color?: string
}) {
  const colors: Record<string, string> = {
    accent: 'text-accent-glow',
    danger: 'text-danger',
    warn: 'text-warn',
    ok: 'text-ok',
    signal: 'text-signal',
  }
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs text-muted font-display uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-display font-bold ${colors[color] ?? colors.accent}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-dim">{sub}</p>}
    </Card>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    getDashboardSummary()
      .then(setData)
      .catch(() => setError('No se pudo cargar el dashboard.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-bright">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Vista general del workspace</p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {error && <ErrorBox message={error} onRetry={load} />}

      {data && !loading && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Tropeles" value={data.totalTropels} color="accent" />
            <StatCard
              label="En Estado Crítico"
              value={data.criticalTropels}
              color="danger"
              sub={`${((data.criticalTropels / data.totalTropels) * 100).toFixed(1)}% del total`}
            />
            <StatCard
              label="Señales Abiertas"
              value={data.openSignals}
              color="warn"
            />
            <StatCard
              label="Estabilidad Sectores"
              value={`${data.sectorStabilityAvg}%`}
              color={data.sectorStabilityAvg > 70 ? 'ok' : data.sectorStabilityAvg > 40 ? 'warn' : 'danger'}
            />
          </div>

          {/* Severity breakdown */}
          <Card>
            <h2 className="text-sm font-display font-semibold text-dim mb-4 uppercase tracking-wider">
              Señales por Severidad
            </h2>
            <div className="space-y-3">
              {(
                [
                  { key: 'LEVE', label: 'Leve', color: 'bg-ok' },
                  { key: 'MODERADO', label: 'Moderado', color: 'bg-signal' },
                  { key: 'GRAVE', label: 'Grave', color: 'bg-warn' },
                  { key: 'CRITICO', label: 'Crítico', color: 'bg-danger' },
                ] as const
              ).map(({ key, label, color }) => {
                const count = data.signalsBySeverity[key] ?? 0
                const total = Object.values(data.signalsBySeverity).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-dim w-20 font-mono">{label}</span>
                    <div className="flex-1 bg-void rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-bright w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/tropels"
              className="group rounded-xl border border-border bg-panel p-5 hover:border-accent/50 transition-all"
            >
              <p className="text-2xl mb-2">🧬</p>
              <p className="font-display font-semibold text-bright group-hover:text-accent-glow transition-colors">
                Atlas de Tropeles
              </p>
              <p className="text-xs text-muted mt-1">Ver todos los Tropeles del workspace</p>
            </Link>
            <Link
              to="/signals"
              className="group rounded-xl border border-border bg-panel p-5 hover:border-accent/50 transition-all"
            >
              <p className="text-2xl mb-2">📡</p>
              <p className="font-display font-semibold text-bright group-hover:text-accent-glow transition-colors">
                Feed de Señales
              </p>
              <p className="text-xs text-muted mt-1">Monitorear y atender señales activas</p>
            </Link>
          </div>

          <p className="text-[10px] text-muted font-mono text-right">
            Generado: {new Date(data.generatedAt).toLocaleString('es-PE')}
          </p>
        </div>
      )}
    </div>
  )
}
