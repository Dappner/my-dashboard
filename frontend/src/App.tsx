import { Route, Routes } from 'react-router'
import HomePage from '@/features/Home/HomePage'
import Layout from '@/components/layout/Layout'
import InvestingPage from '@/features/Investing/InvestingPage'
import LoginPage from '@/features/Auth/Login'
import AnalysisPage from '@/features/Investing/pages/Analysis/AnalysisPage'
import ResearchPage from '@/features/Investing/pages/Research/ResearchPage'
import ManageInvestingPage from '@/features/Investing/pages/ManageInvesting/ManageInvestingPage'
import TickerPage from './features/Investing/pages/Research/TickerPage'

function App() {

  return (
    <div>
      <Routes>
        <Route element={<Layout />} >
          <Route index element={<HomePage />} />
          <Route path="investing">
            <Route index element={<InvestingPage />} />
            <Route path="manage" element={<ManageInvestingPage />} />
            <Route path="analysis" element={<AnalysisPage />} />
            <Route path="research" >
              <Route index element={<ResearchPage />} />
            </Route>
            <Route path="stock/:exchange/:ticker" element={<TickerPage />} />
          </Route>
        </Route>
        <Route path="login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App
