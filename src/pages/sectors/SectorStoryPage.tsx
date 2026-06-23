import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getSectorStory } from '@/api/endpoints'
import type { SectorStoryResponse, StoryStage, Climate } from '@/types'
import { Spinner, ErrorBox } from '@/components/ui'

// ── Color tokens ──────────────────────────────────────────────────
const colorTokenMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  emerald:  { bg: 'bg-ok/10',     border: 'border-ok/40',       text: 'text-ok',          glow: '#10b981' },
  violet:   { bg: 'bg-accent/10', border: 'border-accent/40',   text: 'text-accent-glow', glow: '#a855f7' },
  cyan:     { bg: 'bg-signal/10', border: 'border-signal/40',   text: 'text-signal',      glow: '#06b6d4' },
  amber:    { bg: 'bg-warn/10',   border: 'border-warn/40',     text: 'text-warn',        glow: '#f59e0b' },
  rose:     { bg: 'bg-danger/10', border: 'border-danger/40',   text: 'text-danger',      glow: '#ef4444' },
  slate:    { bg: 'bg-muted/10',  border: 'border-muted/40',    text: 'text-dim',         glow: '#64748b' },
  indigo:   { bg: 'bg-accent/10', border: 'border-accent/40',   text: 'text-accent-glow', glow: '#6366f1' },
  teal:     { bg: 'bg-ok/10',     border: 'border-ok/30',       text: 'text-ok',          glow: '#14b8a6' },
}

function getColor(token: string) {
  return colorTokenMap[token] ?? colorTokenMap.violet
}

// ── Climate visual ────────────────────────────────────────────────
const climatePatterns: Record<Climate, { icon: string; bg: string }> = {
  PIXEL_FOREST:   { icon: '🌲', bg: 'from-ok/5 to-void' },
  NEON_CAVE:      { icon: '🔮', bg: 'from-accent/5 to-void' },
  CLOUD_AQUARIUM: { icon: '🐟', bg: 'from-signal/5 to-void' },
  RETRO_ARCADE:   { icon: '🕹', bg: 'from-warn/5 to-void' },
}

// ── Stage visual ──────────────────────────────────────────────────
function StageVisual({
  stage,
  climate,
  isActive,
}: {
  stage: StoryStage
  climate: Climate
  isActive: boolean
}) {
  const color = getColor(stage.colorToken)
  const cp = climatePatterns[climate] ?? climatePatterns.PIXEL_FOREST

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center transition-all duration-700 bg-gradient-to-b ${cp.bg}`}
      aria-hidden={!isActive}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color.glow}15 0%, transparent 70%)`,
          opacity: isActive ? 1 : 0,
        }}
      />

      {/* Main visual */}
      <div className="relative z-10 text-center px-8">
        {/* Climate icon + progress ring */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg width="120" height="120" className="absolute" aria-hidden>
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={color.glow}
              strokeOpacity="0.15"
              strokeWidth="2"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={color.glow}
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - stage.progress)}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="text-6xl">{cp.icon}</span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <p className={`text-sm font-mono font-bold ${color.text}`}>
            {Math.round(stage.progress * 100)}% completado
          </p>
          <p className="text-xs text-muted mt-1">Etapa {stage.order + 1} de 8</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Estabilidad', value: stage.metrics.stability, unit: '%' },
            { label: 'Energía', value: stage.metrics.energy, unit: '' },
            { label: 'Alertas', value: stage.metrics.alerts, unit: '' },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              className={`rounded-lg border ${color.border} ${color.bg} p-3`}
            >
              <p className={`text-xl font-display font-bold ${color.text}`}>
                {value}{unit}
              </p>
              <p className="text-[10px] text-muted font-mono mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Asset key */}
        <p className="text-[10px] font-mono text-muted/40 mt-4">{stage.assetKey}</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export function SectorStoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [story, setStory] = useState<SectorStoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStage, setActiveStage] = useState(0)

  const stageRefs = useRef<(HTMLElement | null)[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)

  function load() {
    if (!id) return
    setLoading(true)
    setError('')
    getSectorStory(id)
      .then(setStory)
      .catch(() => setError('No se pudo cargar la historia del sector.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  // Intersection observer for stage activation
  useEffect(() => {
    if (!story) return

    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = stageRefs.current.indexOf(entry.target as HTMLElement)
            if (idx !== -1) setActiveStage(idx)
          }
        })
      },
      { threshold: 0.5 }
    )

    stageRefs.current.forEach((el) => {
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [story])

  const navigateToStage = useCallback((idx: number) => {
    stageRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!story) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        navigateToStage(Math.min(activeStage + 1, story.stages.length - 1))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateToStage(Math.max(activeStage - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeStage, story, navigateToStage])

  // View Transition API for back navigation
  function handleBack() {
    if ('startViewTransition' in document) {
      (document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => navigate('/sectors'))
    } else {
      navigate('/sectors')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Link to="/sectors" className="inline-flex items-center gap-1 text-sm text-muted hover:text-bright mb-6">
          ← Sectores
        </Link>
        <ErrorBox message={error || 'Historia no encontrada.'} onRetry={load} />
      </div>
    )
  }

  const climate = story.sector.climate
  const stages = story.stages

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      {/* Left: scrollable narrative */}
      <div
        className="w-full lg:w-1/2 overflow-y-auto"
        role="region"
        aria-label={`Historia del sector ${story.sector.name}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-void/90 backdrop-blur border-b border-border px-6 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-sm text-muted hover:text-bright transition-colors"
            aria-label="Volver a sectores"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-display font-semibold text-bright truncate">
              {story.sector.name}
            </h1>
            <p className="text-[10px] font-mono text-muted">{story.sector.climate.replace('_', ' ')}</p>
          </div>
          {/* Progress indicator */}
          <div className="flex items-center gap-1.5" aria-label={`Etapa ${activeStage + 1} de ${stages.length}`}>
            {stages.map((_, i) => (
              <button
                key={i}
                onClick={() => navigateToStage(i)}
                aria-label={`Ir a etapa ${i + 1}: ${stages[i].title}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  i === activeStage
                    ? 'bg-accent-glow w-4'
                    : i < activeStage
                    ? 'bg-accent/50'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stages */}
        <div>
          {stages.map((stage, i) => {
            const color = getColor(stage.colorToken)
            const isActive = i === activeStage
            return (
              <section
                key={stage.id}
                ref={(el) => { stageRefs.current[i] = el }}
                className="min-h-screen flex items-center px-6 py-16"
                aria-label={`Etapa ${i + 1}: ${stage.title}`}
                tabIndex={-1}
              >
                <div
                  className={`max-w-lg mx-auto transition-all duration-500 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'
                  }`}
                >
                  {/* Stage number */}
                  <p className={`text-xs font-mono mb-3 ${color.text}`}>
                    Etapa {String(i + 1).padStart(2, '0')}
                  </p>

                  <h2 className="text-2xl font-display font-bold text-bright mb-4 leading-tight">
                    {stage.title}
                  </h2>

                  <p className="text-sm text-dim leading-relaxed mb-6">{stage.narrative}</p>

                  {/* Dominant event */}
                  <div className={`inline-flex items-center gap-2 rounded-full border ${color.border} ${color.bg} px-3 py-1 mb-6`}>
                    <span className={`text-xs font-mono font-medium ${color.text}`}>
                      {stage.dominantEvent.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Metrics visible on mobile / when visual is hidden */}
                  <div className="grid grid-cols-3 gap-3 lg:hidden">
                    {[
                      { label: 'Estabilidad', value: `${stage.metrics.stability}%` },
                      { label: 'Energía', value: stage.metrics.energy },
                      { label: 'Alertas', value: stage.metrics.alerts },
                    ].map(({ label, value }) => (
                      <div key={label} className={`rounded-lg border ${color.border} ${color.bg} p-3 text-center`}>
                        <p className={`text-lg font-display font-bold ${color.text}`}>{value}</p>
                        <p className="text-[10px] text-muted font-mono">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Keyboard hint on first stage */}
                  {i === 0 && (
                    <p className="text-[10px] text-muted font-mono mt-8 animate-pulse_soft" aria-hidden>
                      ↓ Desplázate o usa ↑↓ para navegar
                    </p>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* Right: sticky visual (desktop) */}
      <div
        className="hidden lg:block w-1/2 border-l border-border overflow-hidden"
        aria-hidden="true"
      >
        <div className="sticky top-0 h-screen">
          {stages.map((stage, i) => (
            <div
              key={stage.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === activeStage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <StageVisual
                stage={stage}
                climate={climate}
                isActive={i === activeStage}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
