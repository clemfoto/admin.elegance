
import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Users, 
  CheckSquare, 
  Phone, 
  Briefcase, 
  DollarSign, 
  Cloud,
  Flower2
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const menuItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/tareas', icon: CheckSquare, label: 'Tareas Personal' },
    { to: '/llamadas', icon: Phone, label: 'Llamadas' },
    { to: '/servicios', icon: Briefcase, label: 'Servicios' },
    { to: '/contabilidad', icon: DollarSign, label: 'Contabilidad' },
    { to: '/respaldo', icon: Cloud, label: 'Respaldo Automático' },
  ]

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Flower2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Eventos & Flores</h1>
            <p className="text-sm text-gray-500">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`
            }
          >
            <item.icon size={20} className="mr-3" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
          <p className="text-sm text-gray-700 font-medium">Sistema Completo</p>
          <p className="text-xs text-gray-600 mt-1">
            Gestión integral para tu negocio de eventos y decoración
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
