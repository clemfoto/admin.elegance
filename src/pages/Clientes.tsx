
import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  Euro,
  AlertTriangle,
  Clock,
  UserCheck,
  HelpCircle
} from 'lucide-react'
import { useClientes, Cliente } from '../hooks/useClientes'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const Clientes: React.FC = () => {
  const { 
    clientes, 
    loading, 
    alertasFechas, 
    eliminarCliente, 
    buscarClientes, 
    filtrarPorEstado 
  } = useClientes()
  
  const [searchParams, setSearchParams] = useSearchParams()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('filter') || 'todos')
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null)

  // Actualizar filtro si viene de URL
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam) {
      setFiltroEstado(filterParam)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Aplicar filtros
  let clientesFiltrados = filtrarPorEstado(filtroEstado)
  if (busqueda.trim()) {
    clientesFiltrados = buscarClientes(busqueda)
  }

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'confirmado': return 'bg-green-100 text-green-800'
      case 'potencial': return 'bg-yellow-100 text-yellow-800'
      case 'en_proceso': return 'bg-blue-100 text-blue-800'
      case 'completado': return 'bg-purple-100 text-purple-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const obtenerColorServicio = (servicio: string) => {
    switch (servicio) {
      case 'fotografia': return 'bg-blue-50 text-blue-700'
      case 'video': return 'bg-red-50 text-red-700'
      case 'fotografia_video': return 'bg-purple-50 text-purple-700'
      case 'paquete_completo': return 'bg-green-50 text-green-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  // Función para obtener el estilo de la tarjeta según el estado
  const obtenerEstiloTarjeta = (estado: string) => {
    if (estado === 'potencial') {
      return 'border-l-4 border-yellow-400 bg-yellow-50/30'
    }
    return ''
  }

  // Función para obtener el icono según el estado
  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'potencial':
        return <HelpCircle className="h-5 w-5 text-yellow-500" />
      case 'confirmado':
        return <UserCheck className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-blue-500" />
    }
  }

  const manejarEliminacion = async () => {
    if (clienteAEliminar) {
      try {
        await eliminarCliente(clienteAEliminar._id)
        setClienteAEliminar(null)
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  }

  const tieneAlertaFecha = (cliente: Cliente) => {
    return alertasFechas.some(alerta => 
      alerta.clientes.some(c => c._id === cliente._id)
    )
  }

  const estadisticasRapidas = {
    total: clientesFiltrados.length,
    potenciales: clientesFiltrados.filter(c => c.estado === 'potencial').length,
    confirmados: clientesFiltrados.filter(c => c.estado === 'confirmado').length
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Gestión de Clientes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {clientesFiltrados.length} cliente(s) encontrado(s)
              {estadisticasRapidas.potenciales > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <HelpCircle className="mr-1 h-3 w-3" />
                  {estadisticasRapidas.potenciales} potenciales
                </span>
              )}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/agregar-cliente"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 w-4 h-4" />
              Agregar Cliente
            </Link>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad, venue..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value)
                // Limpiar parámetros de URL si se cambia manualmente
                if (searchParams.get('filter')) {
                  setSearchParams({})
                }
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="potencial">🟡 Potenciales</option>
              <option value="confirmado">🟢 Confirmados</option>
              <option value="en_proceso">🔵 En Proceso</option>
              <option value="completado">🟣 Completados</option>
              <option value="cancelado">🔴 Cancelados</option>
            </select>
          </div>

          {/* Estadísticas rápidas */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-gray-600">Potenciales: {estadisticasRapidas.potenciales}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-gray-600">Confirmados: {estadisticasRapidas.confirmados}</span>
            </div>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="mt-8">
          {clientesFiltrados.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {clientesFiltrados.map((cliente) => (
                  <li key={cliente._id}>
                    <div className={`px-4 py-4 sm:px-6 hover:bg-gray-50 ${obtenerEstiloTarjeta(cliente.estado)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            {obtenerIconoEstado(cliente.estado)}
                            <h3 className="ml-2 text-lg font-medium text-gray-900">
                              {cliente.nombres}
                            </h3>
                            {tieneAlertaFecha(cliente) && (
                              <AlertTriangle className="ml-2 h-5 w-5 text-red-500" title="Fecha coincidente con otro evento" />
                            )}
                            {cliente.estado === 'potencial' && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <Clock className="mr-1 h-3 w-3" />
                                POTENCIAL
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              {format(parseISO(cliente.fechaBoda), 'dd/MM/yyyy', { locale: es })}
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              {cliente.ciudad} - {cliente.venue}
                            </div>
                            
                            {cliente.montoTotal && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Euro className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                €{cliente.montoTotal.toLocaleString()}
                                {cliente.montoAbonado && (
                                  <span className="ml-1 text-green-600">
                                    (€{cliente.montoAbonado.toLocaleString()} abonado)
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obtenerColorEstado(cliente.estado)}`}>
                                {cliente.estado}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obtenerColorServicio(cliente.servicio)}`}>
                                {cliente.servicio.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {cliente.email && (
                            <p className="mt-1 text-sm text-gray-600">
                              {cliente.email} • {cliente.telefono}
                            </p>
                          )}

                          {/* Información adicional para potenciales */}
                          {cliente.estado === 'potencial' && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                              <p className="text-xs text-yellow-800">
                                <strong>Cliente Potencial:</strong> Requiere seguimiento para confirmar contratación
                                {cliente.notas && (
                                  <span className="block mt-1">Notas: {cliente.notas}</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/clientes/${cliente._id}`}
                            className={`inline-flex items-center p-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              cliente.estado === 'potencial'
                                ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
                            }`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          
                          <button
                            onClick={() => setClienteAEliminar(cliente)}
                            className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron clientes
              </h3>
              <p className="text-gray-500 mb-6">
                {busqueda || filtroEstado !== 'todos' 
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Comienza agregando tu primer cliente'
                }
              </p>
              <Link
                to="/agregar-cliente"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 w-4 h-4" />
                Agregar Primer Cliente
              </Link>
            </div>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {clienteAEliminar && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  Eliminar Cliente
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar a{' '}
                    <strong>{clienteAEliminar.nombres}</strong>?
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setClienteAEliminar(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={manejarEliminacion}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Clientes
