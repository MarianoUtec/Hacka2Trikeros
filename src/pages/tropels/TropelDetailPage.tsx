import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTropel } from '@/api/endpoints'
import type { Tropel } from '@/types'
import { Spinner, ErrorBox, VitalBadge, SpeciesIcon, Card } from '@/components/ui'

export function TropelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tropel, setTropel] = useState<Tropel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    if (!id) return
    setLoading(true)
    setError('')
    getTropel(id)
      .then(setTropel)
      .catch(() => setError('No se pudo cargar el Tropel.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        to="/tropels"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-bright transition-colors mb-6"
      >
        ← Atlas de Tropeles
      </Link>

      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}
      {error && <ErrorBox message={error} onRetry={load} />}

      {tropel && !loading && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="text-5xl">
              <SpeciesIcon species={tropel.species} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-semibold text-bright">{tropel.name}</h1>
              <p className="text-xs font-mono text-muted mt-0.5">{tropel.id}</p>
              <div className="flex items-center gap-2 mt-2">
                <VitalBadge state={tropel.vitalState} />
                <span className="text-xs font-mono text-dim">{tropel.species}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="text-xs text-muted mb-1 font-display">Energía</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-void rounded-full">
                  <div
                    className="h-2 rounded-full bg-ok transition-all"
                    style={{ width: `${tropel.energyLevel}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-bright">{tropel.energyLevel}</span>
              </div>
            </Card>

            <Card>
              <p className="text-xs text-muted mb-1 font-display">Índice de Caos</p>
              <p className={`text-2xl font-display font-bold ${tropel.chaosIndex > 70 ? 'text-danger' : tropel.chaosIndex > 40 ? 'text-warn' : 'text-ok'}`}>
                {tropel.chaosIndex}
              </p>
            </Card>

            <Card>
              <p className="text-xs text-muted mb-1 font-display">Etapa de Mutación</p>
              <p className="text-2xl font-display font-bold text-accent-glow">{tropel.mutationStage}</p>
            </Card>

            <Card>
              <p className="text-xs text-muted mb-1 font-display">Guardián</p>
              <p className="text-sm text-bright font-medium">{tropel.guardianName}</p>
            </Card>
          </div>

          <Card>
            <p className="text-xs text-muted mb-2 font-display">Sector</p>
            <Link
              to={`/sectors/${tropel.sector.id}/story`}
              className="group flex items-center justify-between hover:text-accent-glow transition-colors"
            >
              <div>
                <p className="text-sm text-bright font-medium group-hover:text-accent-glow">{tropel.sector.name}</p>
                <p className="text-xs font-mono text-muted">{tropel.sector.sectorCode}</p>
              </div>
              <span className="text-muted group-hover:text-accent-glow">→</span>
            </Link>
          </Card>

          <div className="text-xs font-mono text-muted space-y-1 pt-2">
            <p>Creado: {new Date(tropel.createdAt).toLocaleString('es-PE')}</p>
            <p>Actualizado: {new Date(tropel.updatedAt).toLocaleString('es-PE')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
