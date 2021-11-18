import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorMessage } from './components/ErrorMessage'
import { Home } from './pages/Home'
import { Offers } from './pages/Offers'
import { OfferSingle } from './pages/OfferSingle'
import { Cart } from './pages/Cart'
import { Account } from './pages/Account'
import { AuthProvider } from './pages/components/AuthProvider'
import { HeaderFooter as HeaderFooterTemplate } from './pages/templates/HeaderFooter'

function App() {
  return (
    <ChakraProvider>
      <ErrorBoundary FallbackComponent={ErrorMessage}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/*" element={<HeaderFooterTemplate />}>
                <Route path="offers" element={<Offers />} />
                <Route path="offers/:id" element={<OfferSingle />} />
                <Route path="cart" element={<Cart />} />
                <Route path="account" element={<Account />} />
                <Route path="*" element={<>404</>} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ChakraProvider>
  )
}

export default App