
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Camera,
  Video,
  Package,
  TrendingUp,
  UserCheck,
  HelpCircle,
  Clock
} from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

const Dashboard: React.FC = () => {
  const { clientes, loading, alertasFechas, obtenerEstadisticas } = useClientes()
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const estadisticas = obtenerEstadisticas()
  
  // Próximos eventos (próximos 30 días)
  const hoy = new Date()
  const proximoMes = addDays(hoy, 30)
  const proximosEventos = clientes
    .filter(cliente => {
      if (!cliente.fechaBoda) return false
      const fechaBoda = parseISO(cliente.fechaBoda)
      return isAfter(fechaBoda, hoy) && isBefore(fechaBoda, proximoMes)
    })
    .sort((a, b) => new Date(a.fechaBoda).getTime() - new Date(b.fechaBoda).getTime())
    .slice(0, 5)

  // Clientes potenciales recientes (últimos 30 días)
  const clientesPotencialesRecientes = clientes
    .filter(cliente => cliente.estado === 'potencial')
    .filter(cliente => {
      if (!cliente.createdAt) return true
      const fechaCreacion = parseISO(cliente.createdAt)
      const hace30Dias = addDays(hoy, -30)
      return isAfter(fechaCreacion, hace30Dias)
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  const serviciosStats = {
    fotografia: clientes.filter(c => c.servicio === 'fotografia').length,
    video: clientes.filter(c => c.servicio === 'video').length,
    completo: clientes.filter(c => c.servicio === 'paquete_completo').length,
    mixto: clientes.filter(c => c.servicio === 'fotografia_video').length
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Panel de Control
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Resumen de tu negocio de eventos y bodas
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/agregar-cliente"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Users className="mr-2 w-4 h-4" />
              Agregar Cliente
            </Link>
          </div>
        </div>

        {/* Alertas de fechas coincidentes */}
        {alertasFechas.length > 0 && (
          <div className="mt-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Alertas de Fechas Coincidentes
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {alertasFechas.map((alerta, index) => (
                      <div key={index} className="mb-2">
                        <strong>{format(parseISO(alerta.fecha), 'dd/MM/yyyy', { locale: es })}:</strong>
                        {' '}{alerta.clientes.length} eventos programados
                        <ul className="ml-4 mt-1">
                          {alerta.clientes.map(cliente => (
                            <li key={cliente._id}>
                              • {cliente.nombres} - {cliente.venue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas principales */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {/* Total Clientes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Clientes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {estadisticas.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Eventos Confirmados */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Confirmados
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {estadisticas.confirmados}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Clientes Potenciales */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HelpCircle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Potenciales
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {estadisticas.potenciales}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingresos Totales */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ingresos Totales
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        €{estadisticas.ingresosTotales.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendientes de Cobro */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pendiente Cobro
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        €{estadisticas.ingresosPendientes.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Próximos Eventos */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                Próximos Eventos (30 días)
              </h3>
              {proximosEventos.length > 0 ? (
                <div className="space-y-4">
                  {proximosEventos.map((cliente) => (
                    <div key={cliente._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {cliente.nombres}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(cliente.fechaBoda), 'dd/MM/yyyy', { locale: es })} - {cliente.venue}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cliente.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                            cliente.estado === 'potencial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {cliente.estado}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/clientes/${cliente._id}`}
                        className="ml-4 text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay eventos programados para los próximos 30 días
                </p>
              )}
            </div>
          </div>

          {/* Clientes Potenciales Recientes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-yellow-500" />
                Clientes Potenciales
              </h3>
              {clientesPotencialesRecientes.length > 0 ? (
                <div className="space-y-4">
                  {clientesPotencialesRecientes.map((cliente) => (
                    <div key={cliente._id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {cliente.nombres}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(cliente.fechaBoda), 'dd/MM/yyyy', { locale: es })} - {cliente.venue}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Potencial
                          </span>
                          {cliente.montoTotal && (
                            <span className="ml-2 text-xs text-gray-600">
                              €{cliente.montoTotal.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/clientes/${cliente._id}`}
                        className="ml-4 text-yellow-600 hover:text-yellow-500 text-sm font-medium"
                      >
                        Gestionar
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay clientes potenciales recientes
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/clientes?filter=potencial"
                  className="text-sm text-yellow-600 hover:text-yellow-500 font-medium"
                >
                  Ver todos los potenciales →
                </Link>
              </div>
            </div>
          </div>

          {/* Distribución de Servicios */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Servicios Contratados
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700">Solo Fotografía</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {serviciosStats.fotografia}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-gray-700">Solo Video</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {serviciosStats.video}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Fotografía + Video</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {serviciosStats.mixto}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm text-gray-700">Paquete Completo</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {serviciosStats.completo}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  to="/agregar-cliente"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                      <Users className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Agregar Cliente
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Registra un nuevo cliente potencial o confirmado
                    </p>
                  </div>
                </Link>

                <Link
                  to="/calendario"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <Calendar className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Ver Calendario
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Revisa eventos y recordatorios programados
                    </p>
                  </div>
                </Link>

                <Link
                  to="/clientes"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                      <Users className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Gestionar Clientes
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Ver y editar información de clientes existentes
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
