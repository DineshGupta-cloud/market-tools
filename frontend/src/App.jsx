import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import StockScreener from './pages/StockScreener'
import OptionChain from './pages/OptionChain'
import AtmPremium from './pages/AtmPremium'
import RiskCalculator from './pages/RiskCalculator'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/screener" element={<StockScreener />} />
        <Route path="/option-chain" element={<OptionChain />} />
        <Route path="/atm-premium" element={<AtmPremium />} />
        <Route path="/risk-calculator" element={<RiskCalculator />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
