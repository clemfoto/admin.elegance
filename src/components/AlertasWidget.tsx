
import React, { useState } from 'react'
import { 
  Bell, 
  BellRing, 
  X, 
  AlertTriangle, 
  Clock, 
  CreditCard,
  Calendar,
  Settings,
  Smartphone
} from 'lucide-react'
import { useAlertas } from '../hooks/useAlertas'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const AlertasWidget: React.FC = () => {
  const { 
    alertasActivas, 
    notificacionesCelular, 
    verificarSoporteNotificaciones,
    solicitarPermisoNotificaciones 
  } = useAlertas()
  
  const [mostrarPanel, setMostrarPanel] = useState(false)
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false)

  const alertasCriticas = alertasActivas.filter(a => a.prioridad === 'critica')
  const alertasAltas = alertasActivas.filter(a => a.prioridad === 'alta')
  const totalAlertas = alertasActivas.length

  const obtenerIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'evento_proximo': return <Calendar className="h-4 w-4" />
      case 'pago_vencido': return <CreditCard className="h-4 w-4 text-red-500" />
      case 'pago_proximo': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const obtenerColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'bg-red-50 border-red-200 text-red-800'
      case 'alta': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'media': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const handleConfigurarNotificaciones = async () => {
    const exito = await solicitarPermisoNotificaciones()
    if (exito) {
      setMostrarConfiguracion(false)
    }
  }

  return (
    <div className="relative">
      {/* Botón de alertas */}
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className={`relative p-2 rounded-full transition-colors ${
          totalAlertas > 0 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {totalAlertas > 0 ? (
          <BellRing className="h-6 w-6 animate-pulse" />
        ) : (
          <Bell className="h-6 w-6" />
        )}
        
        {totalAlertas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalAlertas > 9 ? '9+' : totalAlertas}
          </span>
        )}
      </button>

      {/* Panel de alertas */}
      {mostrarPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Alertas {totalAlertas > 0 && `(${totalAlertas})`}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMostrarConfiguracion(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMostrarPanel(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {totalAlertas > 0 ? (
              <div className="p-4 space-y-3">
                {/* Alertas críticas primero */}
                {alertasCriticas.map((alerta, index) => (
                  <div
                    key={`critica-${index}`}
                    className={`p-3 rounded-lg border ${obtenerColorPrioridad(alerta.prioridad)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {obtenerIconoTipo(alerta.tipo)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alerta.nombreCliente}</p>
                        <p className="text-sm">{alerta.mensaje}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {format(parseISO(alerta.fechaEvento), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded">
                        CRÍTICA
                      </span>
                    </div>
                  </div>
                ))}

                {/* Alertas altas */}
                {alertasAltas.map((alerta, index) => (
                  <div
                    key={`alta-${index}`}
                    className={`p-3 rounded-lg border ${obtenerColorPrioridad(alerta.prioridad)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {obtenerIconoTipo(alerta.tipo)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alerta.nombreCliente}</p>
                        <p className="text-sm">{alerta.mensaje}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {format(parseISO(alerta.fechaEvento), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        ALTA
                      </span>
                    </div>
                  </div>
                ))}

                {/* Otras alertas */}
                {alertasActivas
                  .filter(a => a.prioridad !== 'critica' && a.prioridad !== 'alta')
                  .map((alerta, index) => (
                  <div
                    key={`otra-${index}`}
                    className={`p-3 rounded-lg border ${obtenerColorPrioridad(alerta.prioridad)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {obtenerIconoTipo(alerta.tipo)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alerta.nombreCliente}</p>
                        <p className="text-sm">{alerta.mensaje}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {format(parseISO(alerta.fechaEvento), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay alertas activas</p>
                <p className="text-sm text-gray-400 mt-1">
                  Te notificaremos cuando haya eventos próximos o pagos pendientes
                </p>
              </div>
            )}
          </div>

          {/* Estado de notificaciones */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Notificaciones móviles:</span>
              </div>
              <span className={`font-medium ${notificacionesCelular ? 'text-green-600' : 'text-gray-500'}`}>
                {notificacionesCelular ? 'Activadas' : 'Inactivas'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración */}
      {mostrarConfiguracion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Configurar Notificaciones
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Smartphone className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Notificaciones Push</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Recibe alertas auditivas en tu dispositivo móvil para eventos importantes
                    </p>
                    
                    {verificarSoporteNotificaciones() ? (
                      <div className="mt-3">
                        {notificacionesCelular ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Activadas correctamente</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleConfigurarNotificaciones}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                          >
                            Activar Notificaciones
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          Tu navegador no soporta notificaciones push. 
                          Usa Chrome, Firefox o Safari en un dispositivo compatible.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tipos de Alertas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Eventos el mismo día</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Eventos en 7 días</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Pagos próximos y vencidos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setMostrarConfiguracion(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertasWidget
