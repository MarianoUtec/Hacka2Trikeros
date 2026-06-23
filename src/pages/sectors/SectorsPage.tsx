import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSectors } from '@/api/endpoints'
import type { SectorLight } from '@/types'
import { Spinner, ErrorBox, climateLabel } from '@/components/ui'

const climateIcon: Record<string, string> = {
  PIXEL_FOREST: '🌲',
  NEON_CAVE: '🔮',
  CLOUD_AQUARIUM: '🐟',
  RETRO_ARCADE: '🕹',
}

export function SectorsPage() {
  const [sectors, setSectors] = useState<SectorLight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    getSectors()
      .then((res) => setSectors(res.items))
      .catch(() => setError('Error al cargar sectores.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-bright">Sectores</h1>
        <p className="text-sm text-muted mt-1">Explora la historia de cada sector</p>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {sectors.map((s) => {
            const stability = s.stabilityLevel
            const loadPct = Math.round((s.currentLoad / s.capacity) * 100)
            return (
              <Link
                key={s.id}
                to={`/sectors/${s.id}/story`}
                className="group block bg-panel border border-border rounded-xl p-5 hover:border-accent/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-mono text-muted">{s.sectorCode}</p>
                    <p className="text-base font-display font-semibold text-bright group-hover:text-accent-glow transition-colors mt-0.5">
                      {s.name}
                    </p>
                  </div>
                  <span className="text-2xl">{climateIcon[s.climate] ?? '🌐'}</span>
                </div>

                <p className="text-xs text-muted mb-3">{climateLabel[s.climate]}</p>

                {/* Stability */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-muted mb-1">
                      <span>Estabilidad</span>
                      <span
                        className={stability > 70 ? 'text-ok' : stability > 40 ? 'text-warn' : 'text-danger'}
                      >
                        {stability}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-void rounded-full">
                      <div
                        className={`h-1.5 rounded-full transition-all ${stability > 70 ? 'bg-ok' : stability > 40 ? 'bg-warn' : 'bg-danger'}`}
                        style={{ width: `${stability}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-muted mb-1">
                      <span>Ocupación</span>
                      <span>{s.currentLoad}/{s.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-void rounded-full">
                      <div
                        className="h-1.5 rounded-full bg-signal transition-all"
                        style={{ width: `${loadPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-accent-glow mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver historia del sector →
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
