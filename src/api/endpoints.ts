import { api } from './client'
import type {
  AuthResponse,
  User,
  DashboardSummary,
  TropelsResponse,
  TropelFilters,
  Tropel,
  SignalFeedResponse,
  Signal,
  SignalStatus,
  SectorsResponse,
  SectorStoryResponse,
} from '@/types'

// ── Auth ──────────────────────────────────────────────────────────
export async function login(
  teamCode: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    teamCode,
    email,
    password,
  })
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')
  return data
}

// ── Dashboard ─────────────────────────────────────────────────────
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary')
  return data
}

// ── Tropels ───────────────────────────────────────────────────────
export async function getTropels(
  filters: TropelFilters,
  signal?: AbortSignal
): Promise<TropelsResponse> {
  const params: Record<string, string | number> = {
    page: filters.page,
    size: filters.size,
  }
  if (filters.species) params.species = filters.species
  if (filters.vitalState) params.vitalState = filters.vitalState
  if (filters.sectorId) params.sectorId = filters.sectorId
  if (filters.q) params.q = filters.q
  if (filters.sort) params.sort = filters.sort

  const { data } = await api.get<TropelsResponse>('/tropels', { params, signal })
  return data
}

export async function getTropel(id: string): Promise<Tropel> {
  const { data } = await api.get<Tropel>(`/tropels/${id}`)
  return data
}

// ── Signals ───────────────────────────────────────────────────────
export async function getSignalFeed(
  params: {
    cursor?: string | null
    limit?: number
    signalType?: string
    severity?: string
    status?: string
    q?: string
  },
  signal?: AbortSignal
): Promise<SignalFeedResponse> {
  const p: Record<string, string | number> = { limit: params.limit ?? 15 }
  if (params.cursor) p.cursor = params.cursor
  if (params.signalType) p.signalType = params.signalType
  if (params.severity) p.severity = params.severity
  if (params.status) p.status = params.status
  if (params.q) p.q = params.q

  const { data } = await api.get<SignalFeedResponse>('/signals/feed', {
    params: p,
    signal,
  })
  return data
}

export async function getSignal(id: string): Promise<Signal> {
  const { data } = await api.get<Signal>(`/signals/${id}`)
  return data
}

export async function updateSignalStatus(
  id: string,
  status: SignalStatus
): Promise<Signal> {
  const { data } = await api.patch<Signal>(`/signals/${id}/status`, { status })
  return data
}

// ── Sectors ───────────────────────────────────────────────────────
export async function getSectors(): Promise<SectorsResponse> {
  const { data } = await api.get<SectorsResponse>('/sectors')
  return data
}

export async function getSectorStory(id: string): Promise<SectorStoryResponse> {
  const { data } = await api.get<SectorStoryResponse>(`/sectors/${id}/story`)
  return data
}
