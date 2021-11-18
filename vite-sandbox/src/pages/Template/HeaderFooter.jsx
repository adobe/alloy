import React from 'react'
import { SimpleGrid } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Footer } from '../components/Footer/Footer'
import { Header } from '../components/Header/Header'

export const HeaderFooter = () => {
  return (
    <SimpleGrid minHeight="100vh" gridTemplateRows="auto 1fr auto">
      <Header />
      <div>
        <Outlet />
      </div>
      <Footer />
    </SimpleGrid>
  )
}