import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/app-layout'
import HomePage from '@/pages/HomePage'
import CountriesListPage from '@/pages/countries/CountriesListPage'
import CountryNewPage from '@/pages/countries/CountryNewPage'
import CountryEditPage from '@/pages/countries/CountryEditPage'
import StatesListPage from '@/pages/states/StatesListPage'
import StateNewPage from '@/pages/states/StateNewPage'
import StateEditPage from '@/pages/states/StateEditPage'

function App() {
  return (
    <>
      <Routes>
        {/* AppLayout wraps every route so the header/sidebar/footer are always visible. */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/countries" element={<CountriesListPage />} />
          <Route path="/countries/new" element={<CountryNewPage />} />
          <Route path="/countries/:id" element={<CountryEditPage />} />
          <Route path="/states" element={<StatesListPage />} />
          <Route path="/states/new" element={<StateNewPage />} />
          <Route path="/states/:id" element={<StateEditPage />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
