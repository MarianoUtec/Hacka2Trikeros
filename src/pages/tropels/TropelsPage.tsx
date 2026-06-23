import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
} from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getTropels } from '@/api/endpoints'
import type { Tropel, TropelFilters, TropelSort, Species, VitalState } from '@/types'
import { Spinner, ErrorBox, EmptyState, VitalBadge, SpeciesIcon, Select, Input, Button } from '@/components/ui'
import axios from 'axios'

const SIZE_OPTIONS: Array<10 | 20 | 50> = [10, 20, 50]

function parseFilters(sp: URLSearchParams): TropelFilters {
  return {
    page: Math.max(0, parseInt(sp.get('page') ?? '0', 10) || 0),
    size: (SIZE_OPTIONS.includes(parseInt(sp.get('size') ?? '20', 10) as 10 | 20 | 50)
      ? parseInt(sp.get('size') ?? '20', 10)
      : 20) as 10 | 20 | 50,
    species: (sp.get('species') as Species) || '',
    vitalState: (sp.get('vitalState') as VitalState) || '',
    sectorId: sp.get('sectorId') || '',
    q: sp.get('q') || '',
    sort: (sp.get('sort') as TropelSort) || 'updatedAt,desc',
  }
}

function filtersToParams(f: TropelFilters): Record<string, string> {
  const p: Record<string, string> = {
    page: String(f.page),
    size: String(f.size),
    sort: f.sort ?? 'updatedAt,desc',
  }
  if (f.species) p.species = f.species
  if (f.vitalState) p.vitalState = f.vitalState
  if (f.sectorId) p.sectorId = f.sectorId
  if (f.q) p.q = f.q
  return p
}

export function TropelsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFilters(searchParams)

  const [tropels, setTropels] = useState<Tropel[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qInput, setQInput] = useState(filters.q ?? '')

  // Debounce ref for search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchTropels = useCallback(
    (f: TropelFilters, controller: AbortController) => {
      setLoading(true)
      setError('')
      getTropels(f, controller.signal)
        .then((res) => {
          setTropels(res.content)
          setTotalPages(res.totalPages)
          setTotalElements(res.totalElements)
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            setError('Error al cargar Tropeles.')
          }
        })
        .finally(() => setLoading(false))
    },
    []
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchTropels(filters, controller)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  function setFilter(partial: Partial<TropelFilters>) {
    const next = { ...filters, ...partial, page: partial.page ?? 0 }
    setSearchParams(filtersToParams(next), { replace: true })
  }

  function handleQ(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilter({ q: val, page: 0 })
    }, 400)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-bright">Atlas de Tropeles</h1>
        {!loading && (
          <p className="text-sm text-muted mt-1">
            {totalElements} Tropeles encontrados
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-panel border border-border rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Input
          label="Buscar"
          placeholder="Nombre..."
          value={qInput}
          onChange={handleQ}
          className="col-span-2 md:col-span-1"
        />
        <Select label="Especie" value={filters.species ?? ''} onChange={(e) => setFilter({ species: e.target.value as Species | '' })}>
          <option value="">Todas</option>
          {(['BLOBITO', 'CHISPA', 'GRUNON', 'DORMILON', 'GLITCHY'] as Species[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select label="Estado vital" value={filters.vitalState ?? ''} onChange={(e) => setFilter({ vitalState: e.target.value as VitalState | '' })}>
          <option value="">Todos</option>
          {(['ESTABLE', 'HAMBRIENTO', 'AGITADO', 'MUTANDO', 'CRITICO'] as VitalState[]).map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
        <Select label="Ordenar por" value={filters.sort ?? 'updatedAt,desc'} onChange={(e) => setFilter({ sort: e.target.value as TropelSort })}>
          <option value="updatedAt,desc">Más reciente</option>
          <option value="name,asc">Nombre A-Z</option>
          <option value="chaosIndex,desc">Caos ↓</option>
        </Select>
        <Select label="Por página" value={filters.size} onChange={(e) => setFilter({ size: parseInt(e.target.value, 10) as 10 | 20 | 50 })}>
          {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {/* Table */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {error && !loading && <ErrorBox message={error} onRetry={() => {
        const c = new AbortController(); fetchTropels(filters, c)
      }} />}

      {!loading && !error && tropels.length === 0 && (
        <EmptyState message="No se encontraron Tropeles con esos filtros." />
      )}

      {!loading && !error && tropels.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-panel">
                  {['Tropel', 'Especie', 'Estado vital', 'Energía', 'Caos', 'Sector', 'Guardián'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-muted font-display uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tropels.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-b border-border last:border-0 hover:bg-panel/60 transition-colors ${i % 2 === 0 ? 'bg-void/40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/tropels/${t.id}`}
                        className="text-bright hover:text-accent-glow transition-colors font-medium"
                      >
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-dim">
                        <SpeciesIcon species={t.species} />
                        <span className="font-mono text-xs">{t.species}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <VitalBadge state={t.vitalState} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-void rounded-full">
                          <div
                            className="h-1.5 rounded-full bg-ok"
                            style={{ width: `${t.energyLevel}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-dim">{t.energyLevel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-mono font-bold ${t.chaosIndex > 70 ? 'text-danger' : t.chaosIndex > 40 ? 'text-warn' : 'text-ok'}`}
                      >
                        {t.chaosIndex}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/sectors/${t.sector.id}/story`}
                        className="text-xs text-dim hover:text-signal transition-colors"
                      >
                        {t.sector.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-dim">{t.guardianName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted font-mono">
              Pág. {filters.page + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={filters.page === 0}
                onClick={() => setFilter({ page: filters.page - 1 })}
              >
                ← Anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={filters.page >= totalPages - 1}
                onClick={() => setFilter({ page: filters.page + 1 })}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
