// The top level layout: the nav bar shows on every page, and AppRoutes swaps
// out the page underneath it depending on the URL.

import { useState } from 'react'
import AppRoutes from './AppRoutes'
import NavBar from './components/NavBar'


function App() {
  return (
    <>
    <NavBar></NavBar>
    <AppRoutes></AppRoutes></>
  )
}

export default App
