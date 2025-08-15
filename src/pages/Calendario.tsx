
import React, { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Plus,
  Bell,
  Mail,
  ExternalLink,
  Settings
} from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isToday
} from 'date-fns'
import { es } from 'date-fns/locale'

const Calendario: React.FC = () => {
  const { clientes, loading, obtenerClientesPorFecha } = useClientes()
  const [fechaActual, setFechaActual] = useState(new Date())
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [correoOutlook, setCorreoOutlook] = useState(
    localStorage.getItem('outlook-email') || ''
  )
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false)

  const inicioMes = startOfMonth(fechaActual)
  const finMes = endOfMonth(fechaActual)
  const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 1 }) // Lunes
  const finCalendario = endOfWeek(finMes, { weekStartsOn: 1 })

  // Generar días del calendario
  const dias = []
  let dia = inicioCalendario
  while (dia <= finCalendario) {
    dias.push(dia)
    dia = addDays(dia, 1)
  }

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior') {
      setFechaActual(subMonths(fechaActual, 1))
    } else {
      setFechaActual(addMonths(fechaActual, 1))
    }
  }

  const obtenerEventosDelDia = (fecha: Date) => {
    return obtenerClientesPorFecha(fecha)
  }

  const tieneEventos = (fecha: Date) => {
    return obtenerEventosDelDia(fecha).length > 0
  }

  const tieneMultiplesEventos = (fecha: Date) => {
    return obtenerEventosDelDia(fecha).length > 1
  }

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'confirmado': return 'bg-green-500'
      case 'potencial': return 'bg-yellow-500'
      case 'en_proceso': return 'bg-blue-500'
      case 'completado': return 'bg-purple-500'
      case 'cancelado': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Guardar correo de Outlook
  const guardarCorreoOutlook = () => {
    localStorage.setItem('outlook-email', correoOutlook)
    setMostrarConfiguracion(false)
  }

  // Crear evento en Outlook
  const crearEventoOutlook = (cliente: any) => {
    if (!correoOutlook) {
      alert('Por favor configura tu correo de Outlook primero')
      setMostrarConfiguracion(true)
      return
    }

    const fechaBoda = new Date(cliente.fechaBoda)
    const fechaFin = new Date(fechaBoda.getTime() + 4 * 60 * 60 * 1000) // 4 horas después

    // Formatear fechas para Outlook
    const formatoOutlook = (fecha: Date) => {
      return fecha.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const parametros = new URLSearchParams({
      subject: `Boda - ${cliente.nombres}`,
      startdt: formatoOutlook(fechaBoda),
      enddt: formatoOutlook(fechaFin),
      body: `
Evento: Boda de ${cliente.nombres}
Lugar: ${cliente.venue}
Ciudad: ${cliente.ciudad}
Servicio: ${cliente.servicio}
Estado: ${cliente.estado}

Detalles adicionales:
${cliente.solicitudesEspeciales || 'Sin solicitudes especiales'}

Notas:
${cliente.notas || 'Sin notas adicionales'}
      `.trim(),
      location: `${cliente.venue}, ${cliente.ciudad}`,
      to: correoOutlook
    })

    // Abrir Outlook Web con el evento prellenado
    const urlOutlook = `https://outlook.live.com/calendar/0/deeplink/compose?${parametros.toString()}`
    window.open(urlOutlook, '_blank')
  }

  // Crear recordatorio en Outlook
  const crearRecordatorioOutlook = (cliente: any, tipoRecordatorio: string, diasAntes: number) => {
    if (!correoOutlook) {
      alert('Por favor configura tu correo de Outlook primero')
      setMostrarConfiguracion(true)
      return
    }

    const fechaBoda = new Date(cliente.fechaBoda)
    const fechaRecordatorio = new Date(fechaBoda.getTime() - diasAntes * 24 * 60 * 60 * 1000)
    const fechaFin = new Date(fechaRecordatorio.getTime() + 60 * 60 * 1000) // 1 hora

    const formatoOutlook = (fecha: Date) => {
      return fecha.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const parametros = new URLSearchParams({
      subject: `Recordatorio: ${tipoRecordatorio} - ${cliente.nombres}`,
      startdt: formatoOutlook(fechaRecordatorio),
      enddt: formatoOutlook(fechaFin),
      body: `
Recordatorio para: ${cliente.nombres}
Tipo: ${tipoRecordatorio}
Boda programada: ${format(fechaBoda, 'dd/MM/yyyy HH:mm')}
Lugar: ${cliente.venue}, ${cliente.ciudad}

Acciones pendientes:
- Confirmar detalles del servicio
- Revisar solicitudes especiales
- Coordinar logística

Teléfono: ${cliente.telefono || 'No disponible'}
Email: ${cliente.email || 'No disponible'}
      `.trim(),
      to: correoOutlook
    })

    const urlOutlook = `https://outlook.live.com/calendar/0/deeplink/compose?${parametros.toString()}`
    window.open(urlOutlook, '_blank')
  }

  // Próximos recordatorios (próximos 7 días)
  const proximosRecordatorios = clientes
    .filter(cliente => cliente.recordatorios && cliente.recordatorios.length > 0)
    .flatMap(cliente => 
      cliente.recordatorios!.map(recordatorio => ({
        ...recordatorio,
        cliente: cliente.nombres,
        clienteId: cliente._id,
        clienteCompleto: cliente
      }))
    )
    .filter(recordatorio => {
      const fechaRecordatorio = parseISO(recordatorio.fecha)
      const hoy = new Date()
      const unaSemana = addDays(hoy, 7)
      return fechaRecordatorio >= hoy && fechaRecordatorio <= unaSemana
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Calendario de Eventos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona fechas de bodas y recordatorios con integración Outlook
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            {/* Estado de configuración de Outlook */}
            <div className={`
              flex items-center px-3 py-1 rounded-full text-sm
              ${correoOutlook 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
              }
            `}>
              <Mail className="h-4 w-4 mr-1" />
              {correoOutlook ? 'Outlook Configurado' : 'Outlook No Configurado'}
            </div>
            
            <button
              onClick={() => setMostrarConfiguracion(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Outlook
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendario principal */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              {/* Header del calendario */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <button
                  onClick={() => navegarMes('anterior')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(fechaActual, 'MMMM yyyy', { locale: es })}
                </h2>
                
                <button
                  onClick={() => navegarMes('siguiente')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                  <div key={dia} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-700">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Días del calendario */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {dias.map((dia, index) => {
                  const eventosDelDia = obtenerEventosDelDia(dia)
                  const esHoy = isToday(dia)
                  const esMesActual = isSameMonth(dia, fechaActual)
                  const estaSeleccionado = fechaSeleccionada && isSameDay(dia, fechaSeleccionada)

                  return (
                    <div
                      key={index}
                      onClick={() => setFechaSeleccionada(dia)}
                      className={`
                        bg-white p-2 min-h-[100px] cursor-pointer hover:bg-gray-50 relative
                        ${!esMesActual ? 'text-gray-400' : 'text-gray-900'}
                        ${estaSeleccionado ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`
                          text-sm font-medium
                          ${esHoy ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                        `}>
                          {format(dia, 'd')}
                        </span>
                        
                        {tieneMultiplesEventos(dia) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>

                      {/* Eventos del día */}
                      <div className="mt-1 space-y-1">
                        {eventosDelDia.slice(0, 2).map((evento, idx) => (
                          <div
                            key={idx}
                            className={`
                              text-xs p-1 rounded text-white truncate
                              ${obtenerColorEstado(evento.estado)}
                            `}
                            title={`${evento.nombres} - ${evento.venue}`}
                          >
                            {evento.nombres}
                          </div>
                        ))}
                        
                        {eventosDelDia.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{eventosDelDia.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Eventos del día seleccionado */}
            {fechaSeleccionada && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {format(fechaSeleccionada, 'dd MMMM yyyy', { locale: es })}
                  </h3>
                  
                  {obtenerEventosDelDia(fechaSeleccionada).length > 0 ? (
                    <div className="space-y-3">
                      {obtenerEventosDelDia(fechaSeleccionada).map((evento) => (
                        <div key={evento._id} className="border-l-4 border-blue-500 pl-3 py-2">
                          <h4 className="font-medium text-gray-900">
                            {evento.nombres}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(parseISO(evento.fechaBoda), 'HH:mm')}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {evento.venue}
                            </div>
                            <span className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${evento.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                                evento.estado === 'potencial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'}
                            `}>
                              {evento.estado}
                            </span>
                          </div>
                          
                          {/* Botones de Outlook */}
                          <div className="mt-3 flex flex-col space-y-2">
                            <button
                              onClick={() => crearEventoOutlook(evento)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center justify-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Crear en Outlook
                            </button>
                            
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                onClick={() => crearRecordatorioOutlook(evento, 'Seguimiento', 7)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                              >
                                Recordatorio 7d
                              </button>
                              <button
                                onClick={() => crearRecordatorioOutlook(evento, 'Preparación', 1)}
                                className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                              >
                                Recordatorio 1d
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No hay eventos programados para este día
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Próximos recordatorios */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-500" />
                  Próximos Recordatorios
                </h3>
                
                {proximosRecordatorios.length > 0 ? (
                  <div className="space-y-3">
                    {proximosRecordatorios.slice(0, 5).map((recordatorio, index) => (
                      <div key={index} className="border-l-4 border-yellow-500 pl-3 py-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {recordatorio.tipo.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {recordatorio.cliente}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(parseISO(recordatorio.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {recordatorio.mensaje}
                        </p>
                        
                        {/* Botón para crear recordatorio en Outlook */}
                        <button
                          onClick={() => crearRecordatorioOutlook(
                            recordatorio.clienteCompleto, 
                            recordatorio.tipo, 
                            0
                          )}
                          className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 flex items-center"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Agregar a Outlook
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No hay recordatorios próximos
                  </p>
                )}
              </div>
            </div>

            {/* Leyenda */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Leyenda
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Confirmado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span>Potencial</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>En Proceso</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    <span>Completado</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span>Múltiples eventos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de configuración de Outlook */}
        {mostrarConfiguracion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Configurar Correo Outlook</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ingresa tu dirección de correo de Outlook para habilitar la integración automática del calendario.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo de Outlook
                  </label>
                  <input
                    type="email"
                    value={correoOutlook}
                    onChange={(e) => setCorreoOutlook(e.target.value)}
                    placeholder="tu-correo@outlook.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">¿Cómo funciona?</h4>
                  <p className="text-xs text-blue-700">
                    Al configurar tu correo, podrás crear eventos y recordatorios directamente en Outlook Web con un solo clic. Los eventos se abren prellenados con toda la información del cliente.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={guardarCorreoOutlook}
                  disabled={!correoOutlook.includes('@')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Guardar Configuración
                </button>
                <button
                  onClick={() => setMostrarConfiguracion(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendario
