import { useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import { useSignalFeed } from '@/hooks/useSignalFeed'
import type { SignalFeedFilters, SignalType, Severity, SignalStatus } from '@/types'
import { Spinner, ErrorBox, EmptyState, SeverityBadge, StatusBadge, SpeciesIcon, Select, Input } from '@/components/ui'

function parseFilters(sp: URLSearchParams): SignalFeedFilters {
  return {
    signalType: (sp.get('signalType') as SignalType) || '',
    severity: (sp.get('severity') as Severity) || '',
    status: (sp.get('status') as SignalStatus) || '',
    q: sp.get('q') || '',
  }
}

function filtersToParams(f: SignalFeedFilters): Record<string, string> {
  const p: Record<string, string> = {}
  if (f.signalType) p.signalType = f.signalType
  if (f.severity) p.severity = f.severity
  if (f.status) p.status = f.status
  if (f.q) p.q = f.q
  return p
}

export function SignalsFeedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const filters = parseFilters(searchParams)

  const { items, hasMore, totalEstimate, isLoading, isLoadingMore, error, loadMore } =
    useSignalFeed(filters)

  // Restore scroll position when coming back from detail
  const savedScrollRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'scrollY' in location.state) {
      const y = (location.state as { scrollY: number }).scrollY
      setTimeout(() => window.scrollTo(0, y), 50)
    }
  }, [])

  // Intersection Observer for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMoreStable = useCallback(loadMore, [loadMore])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreStable()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, isLoadingMore, loadMoreStable])

  function setFilter(partial: Partial<SignalFeedFilters>) {
    setSearchParams(filtersToParams({ ...filters, ...partial }), { replace: true })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" ref={containerRef}>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-bright">Feed de Señales</h1>
        {!isLoading && (
          <p className="text-sm text-muted mt-1">~{totalEstimate} señales estimadas</p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-panel border border-border rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input
          label="Buscar"
          placeholder="Contenido..."
          value={filters.q ?? ''}
          onChange={(e) => setFilter({ q: e.target.value })}
        />
        <Select label="Tipo" value={filters.signalType ?? ''} onChange={(e) => setFilter({ signalType: e.target.value as SignalType | '' })}>
          <option value="">Todos</option>
          {(['HAMBRE','ABANDONO','MUTACION','FUGA','CONFLICTO','REPRODUCCION_MASIVA','SENAL_CORRUPTA'] as SignalType[]).map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </Select>
        <Select label="Severidad" value={filters.severity ?? ''} onChange={(e) => setFilter({ severity: e.target.value as Severity | '' })}>
          <option value="">Todas</option>
          {(['LEVE','MODERADO','GRAVE','CRITICO'] as Severity[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select label="Estado" value={filters.status ?? ''} onChange={(e) => setFilter({ status: e.target.value as SignalStatus | '' })}>
          <option value="">Todos</option>
          {(['RECIBIDA','PROCESANDO','ATENDIDA'] as SignalStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {/* List */}
      {isLoading && (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      )}

      {!isLoading && items.length === 0 && !error && (
        <EmptyState message="No hay señales con esos filtros." />
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((signal) => (
            <Link
              key={signal.id}
              to={`/signals/${signal.id}`}
              state={{ scrollY: window.scrollY, filters: filtersToParams(filters) }}
              onClick={() => { savedScrollRef.current = window.scrollY }}
              className="group block bg-panel border border-border rounded-xl p-4 hover:border-accent/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <SpeciesIcon species={signal.tropel.species} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-display font-medium text-bright group-hover:text-accent-glow transition-colors truncate">
                      {signal.tropel.name}
                    </span>
                    <span className="text-xs font-mono text-muted">·</span>
                    <span className="text-xs font-mono text-dim">{signal.signalType.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-muted truncate">{signal.rawContent}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <SeverityBadge severity={signal.severity} />
                    <StatusBadge status={signal.status} />
                    <span className="text-[10px] font-mono text-muted ml-auto">
                      {new Date(signal.createdAt).toLocaleString('es-PE')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Error on load more (preserves previous items) */}
      {error && items.length > 0 && (
        <div className="mt-4">
          <ErrorBox message={error} onRetry={loadMore} />
        </div>
      )}

      {/* First load error */}
      {error && items.length === 0 && !isLoading && (
        <ErrorBox message={error} onRetry={loadMore} />
      )}

      {/* Sentinel + loading more */}
      {!error && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {isLoadingMore && <Spinner size="md" />}
          {!hasMore && items.length > 0 && !isLoadingMore && (
            <p className="text-xs text-muted font-mono">· fin del feed ·</p>
          )}
        </div>
      )}
    </div>
  )
}
