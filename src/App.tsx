import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { TropelsPage } from '@/pages/tropels/TropelsPage'
import { TropelDetailPage } from '@/pages/tropels/TropelDetailPage'
import { SignalsFeedPage } from '@/pages/signals/SignalsFeedPage'
import { SignalDetailPage } from '@/pages/signals/SignalDetailPage'
import { SectorsPage } from '@/pages/sectors/SectorsPage'
import { SectorStoryPage } from '@/pages/sectors/SectorStoryPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tropels" element={<TropelsPage />} />
            <Route path="/tropels/:id" element={<TropelDetailPage />} />
            <Route path="/signals" element={<SignalsFeedPage />} />
            <Route path="/signals/:id" element={<SignalDetailPage />} />
            <Route path="/sectors" element={<SectorsPage />} />
            <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
