
import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Calendar, 
  CheckSquare, 
  Calculator, 
  Phone, 
  Package,
  Cloud
} from 'lucide-react'
import AlertasWidget from './AlertasWidget'

const Layout: React.FC = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Calendario', href: '/calendario', icon: Calendar },
    { name: 'Tareas', href: '/tareas', icon: CheckSquare },
    { name: 'Llamadas', href: '/llamadas', icon: Phone },
    { name: 'Servicios', href: '/servicios', icon: Package },
    { name: 'Contabilidad', href: '/contabilidad', icon: Calculator },
    { name: 'Respaldo', href: '/respaldo', icon: Cloud },
  ]

  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Gestor de Eventos
                </h1>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                        ${isActive(item.href)
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }
                      `}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Widget de alertas */}
              <AlertasWidget />
              
              {/* Indicador de respaldo */}
              <div className="flex items-center text-sm text-gray-500">
                <Cloud className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Respaldo automático</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    block pl-3 pr-4 py-2 border-l-4 text-base font-medium
                    ${isActive(item.href)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
