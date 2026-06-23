// ── Auth ──────────────────────────────────────────────────────────
export interface User {
  id: string
  displayName: string
  email: string
  teamCode: string
  role: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: User
}

// ── Enums ─────────────────────────────────────────────────────────
export type Species = 'BLOBITO' | 'CHISPA' | 'GRUNON' | 'DORMILON' | 'GLITCHY'
export type VitalState = 'ESTABLE' | 'HAMBRIENTO' | 'AGITADO' | 'MUTANDO' | 'CRITICO'
export type SignalType =
  | 'HAMBRE'
  | 'ABANDONO'
  | 'MUTACION'
  | 'FUGA'
  | 'CONFLICTO'
  | 'REPRODUCCION_MASIVA'
  | 'SENAL_CORRUPTA'
export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO'
export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA'
export type Climate = 'PIXEL_FOREST' | 'NEON_CAVE' | 'CLOUD_AQUARIUM' | 'RETRO_ARCADE'

// ── Dashboard ─────────────────────────────────────────────────────
export interface DashboardSummary {
  totalTropels: number
  criticalTropels: number
  openSignals: number
  sectorStabilityAvg: number
  signalsBySeverity: Record<Severity, number>
  generatedAt: string
}

// ── Sector ────────────────────────────────────────────────────────
export interface SectorLight {
  id: string
  sectorCode: string
  name: string
  climate: Climate
  capacity: number
  currentLoad: number
  stabilityLevel: number
}

export interface SectorsResponse {
  items: SectorLight[]
}

export interface StageMetrics {
  stability: number
  energy: number
  alerts: number
}

export interface StoryStage {
  id: string
  order: number
  title: string
  narrative: string
  dominantEvent: SignalType
  metrics: StageMetrics
  assetKey: string
  colorToken: string
  progress: number
}

export interface SectorStoryResponse {
  sector: {
    id: string
    name: string
    climate: Climate
  }
  stages: StoryStage[]
}

// ── Tropel ────────────────────────────────────────────────────────
export interface TropelSector {
  id: string
  name: string
  sectorCode: string
}

export interface Tropel {
  id: string
  name: string
  species: Species
  vitalState: VitalState
  energyLevel: number
  chaosIndex: number
  mutationStage: number
  guardianName: string
  sector: TropelSector
  createdAt: string
  updatedAt: string
}

export interface TropelsResponse {
  content: Tropel[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export type TropelSort = 'name,asc' | 'updatedAt,desc' | 'chaosIndex,desc'

export interface TropelFilters {
  page: number
  size: 10 | 20 | 50
  species?: Species | ''
  vitalState?: VitalState | ''
  sectorId?: string
  q?: string
  sort?: TropelSort
}

// ── Signal ────────────────────────────────────────────────────────
export interface SignalTropel {
  id: string
  name: string
  species: Species
}

export interface Signal {
  id: string
  signalType: SignalType
  severity: Severity
  status: SignalStatus
  rawContent: string
  tropel: SignalTropel
  createdAt: string
  updatedAt: string
}

export interface SignalFeedResponse {
  items: Signal[]
  nextCursor: string | null
  hasMore: boolean
  totalEstimate: number
}

export interface SignalFeedFilters {
  signalType?: SignalType | ''
  severity?: Severity | ''
  status?: SignalStatus | ''
  q?: string
}

// ── API Error ─────────────────────────────────────────────────────
export interface ApiError {
  error: string
  message: string
  timestamp: string
  path: string
  details: Record<string, unknown>
}
