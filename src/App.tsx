
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import ClienteDetalle from './pages/ClienteDetalle'
import AgregarCliente from './pages/AgregarCliente'
import TareasPersonal from './pages/TareasPersonal'
import LlamadasProgramadas from './pages/LlamadasProgramadas'
import Servicios from './pages/Servicios'
import Contabilidad from './pages/Contabilidad'
import RespaldoAutomatico from './pages/RespaldoAutomatico'
import Calendario from './pages/Calendario'

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/:id" element={<ClienteDetalle />} />
            <Route path="agregar-cliente" element={<AgregarCliente />} />
            <Route path="tareas" element={<TareasPersonal />} />
            <Route path="llamadas" element={<LlamadasProgramadas />} />
            <Route path="servicios" element={<Servicios />} />
            <Route path="contabilidad" element={<Contabilidad />} />
            <Route path="respaldo" element={<RespaldoAutomatico />} />
            <Route path="calendario" element={<Calendario />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
