import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductionPage from './pages/ProductionPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/production/:projectId" element={<ProductionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
