import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getSignal, updateSignalStatus } from '@/api/endpoints'
import type { Signal, SignalStatus } from '@/types'
import { Spinner, ErrorBox, SeverityBadge, StatusBadge, SpeciesIcon, Button, Card } from '@/components/ui'

export function SignalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [signal, setSignal] = useState<Signal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateOk, setUpdateOk] = useState(false)

  function load() {
    if (!id) return
    setLoading(true)
    setError('')
    getSignal(id)
      .then(setSignal)
      .catch(() => setError('No se pudo cargar la señal.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  async function handleUpdateStatus(status: SignalStatus) {
    if (!id || !signal) return
    setUpdating(true)
    setUpdateError('')
    setUpdateOk(false)
    try {
      const updated = await updateSignalStatus(id, status)
      setSignal(updated)
      setUpdateOk(true)
      setTimeout(() => setUpdateOk(false), 3000)
    } catch {
      setUpdateError('Error al actualizar el estado. Intenta de nuevo.')
    } finally {
      setUpdating(false)
    }
  }

  function goBack() {
    const state = location.state as { scrollY?: number } | null
    navigate('/signals', {
      state: { scrollY: state?.scrollY ?? 0 },
    })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={goBack}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-bright transition-colors mb-6"
      >
        ← Feed de Señales
      </button>

      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}
      {error && <ErrorBox message={error} onRetry={load} />}

      {signal && !loading && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-start gap-3">
            <span className="text-3xl mt-1">
              <SpeciesIcon species={signal.tropel.species} />
            </span>
            <div className="flex-1">
              <h1 className="text-xl font-display font-semibold text-bright">
                {signal.signalType.replace('_', ' ')}
              </h1>
              <p className="text-xs font-mono text-muted mt-0.5">{signal.id}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <SeverityBadge severity={signal.severity} />
                <StatusBadge status={signal.status} />
              </div>
            </div>
          </div>

          {/* Content */}
          <Card>
            <p className="text-xs text-muted mb-2 font-display">Contenido de la señal</p>
            <p className="text-sm text-bright font-mono leading-relaxed">{signal.rawContent}</p>
          </Card>

          {/* Tropel info */}
          <Card>
            <p className="text-xs text-muted mb-2 font-display">Tropel emisor</p>
            <div className="flex items-center gap-2">
              <SpeciesIcon species={signal.tropel.species} />
              <div>
                <p className="text-sm font-medium text-bright">{signal.tropel.name}</p>
                <p className="text-xs font-mono text-muted">{signal.tropel.species}</p>
              </div>
            </div>
          </Card>

          {/* Update status */}
          <Card>
            <p className="text-xs text-muted mb-3 font-display">Actualizar estado</p>

            {updateOk && (
              <div className="mb-3 rounded-lg border border-ok/30 bg-ok/5 px-3 py-2">
                <p className="text-xs text-ok">Estado actualizado correctamente.</p>
              </div>
            )}

            {updateError && (
              <div className="mb-3">
                <ErrorBox message={updateError} onRetry={() => setUpdateError('')} />
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                loading={updating}
                disabled={signal.status === 'PROCESANDO' || updating}
                onClick={() => handleUpdateStatus('PROCESANDO')}
                className={signal.status === 'PROCESANDO' ? 'opacity-40' : ''}
              >
                Marcar Procesando
              </Button>
              <Button
                size="sm"
                loading={updating}
                disabled={signal.status === 'ATENDIDA' || updating}
                onClick={() => handleUpdateStatus('ATENDIDA')}
                className={signal.status === 'ATENDIDA' ? 'opacity-40' : ''}
              >
                Marcar Atendida
              </Button>
            </div>

            {signal.status === 'ATENDIDA' && (
              <p className="text-xs text-ok mt-3 font-mono">✓ Esta señal ya fue atendida.</p>
            )}
          </Card>

          <div className="text-xs font-mono text-muted space-y-1 pt-1">
            <p>Creada: {new Date(signal.createdAt).toLocaleString('es-PE')}</p>
            <p>Actualizada: {new Date(signal.updatedAt).toLocaleString('es-PE')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
