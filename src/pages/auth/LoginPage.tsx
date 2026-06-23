import { useState, type FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input } from '@/components/ui'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [teamCode, setTeamCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(teamCode.trim(), email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Credenciales inválidas. Verifica tu team code, email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #7c3aed 1px, transparent 1px), linear-gradient(to bottom, #7c3aed 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4 shadow-xl shadow-accent/30">
            <span className="text-2xl text-white font-display font-bold">T</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-bright">TropelCare</h1>
          <p className="text-sm text-muted mt-1 font-mono">Control Room · Pizza Protocol</p>
        </div>

        {/* Form */}
        <div className="bg-panel border border-border rounded-2xl p-7 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Team Code"
              type="text"
              placeholder="TEAM-001"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              required
              autoComplete="username"
              spellCheck={false}
            />
            <Input
              label="Email"
              type="email"
              placeholder="operator@tuckersoft.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
                <p className="text-xs text-danger">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center mt-2">
              Iniciar sesión
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6 font-mono">
          Tuckersoft Corp. · Operaciones digitales
        </p>
      </div>
    </div>
  )
}
