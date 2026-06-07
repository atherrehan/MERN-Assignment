import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import HomePage from '@/pages/HomePage'
import CountriesListPage from '@/pages/countries/CountriesListPage'
import CountryNewPage from '@/pages/countries/CountryNewPage'
import CountryEditPage from '@/pages/countries/CountryEditPage'
import StatesListPage from '@/pages/states/StatesListPage'
import StateStubPage from '@/pages/states/StateStubPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/countries" element={<CountriesListPage />} />
        <Route path="/countries/new" element={<CountryNewPage />} />
        <Route path="/countries/:id" element={<CountryEditPage />} />
        <Route path="/states" element={<StatesListPage />} />
        {/* State create/edit are stubs until Step 16. */}
        <Route path="/states/new" element={<StateStubPage />} />
        <Route path="/states/:id" element={<StateStubPage />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
