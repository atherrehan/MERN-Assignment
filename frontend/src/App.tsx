import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import HomePage from '@/pages/HomePage'
import CountryNewPage from '@/pages/countries/CountryNewPage'
import CountryEditPage from '@/pages/countries/CountryEditPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/countries/new" element={<CountryNewPage />} />
        <Route path="/countries/:id" element={<CountryEditPage />} />
        {/* The /countries and /states list pages are added in a later step. */}
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
