
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  MapPin, 
  Euro, 
  Phone, 
  Mail,
  FileText,
  Download,
  Plus,
  Trash2,
  Clock,
  User,
  Users,
  Check,
  Bell,
  CalendarPlus,
  AlertTriangle
} from 'lucide-react'
import { useClientes, Cliente } from '../hooks/useClientes'
import { format, parseISO, addDays, addHours, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Invitado {
  id: string
  nombre: string
  confirmado: boolean
  tachado: boolean
}

interface Recordatorio {
  id: string
  fecha: string
  tipo: string
  mensaje: string
  alertaPrevia: {
    activa: boolean
    tiempo: number
    unidad: 'minutos' | 'horas' | 'dias'
  }
  createdAt: string
}

const ClienteDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clientes, actualizarCliente } = useClientes()
  
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [formData, setFormData] = useState<Partial<Cliente>>({})
  
  // Estados para lista de invitados
  const [invitados, setInvitados] = useState<Invitado[]>([])
  const [nuevoInvitado, setNuevoInvitado] = useState('')
  const [editandoInvitados, setEditandoInvitados] = useState(false)

  // Estados para recordatorios mejorados
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [mostrarFormularioRecordatorio, setMostrarFormularioRecordatorio] = useState(false)

  useEffect(() => {
    const clienteEncontrado = clientes.find(c => c._id === id)
    if (clienteEncontrado) {
      setCliente(clienteEncontrado)
      setFormData(clienteEncontrado)
      
      // Cargar lista de invitados desde localStorage
      const invitadosGuardados = localStorage.getItem(`invitados_${id}`)
      if (invitadosGuardados) {
        setInvitados(JSON.parse(invitadosGuardados))
      }

      // Cargar recordatorios desde localStorage
      const recordatoriosGuardados = localStorage.getItem(`recordatorios_${id}`)
      if (recordatoriosGuardados) {
        setRecordatorios(JSON.parse(recordatoriosGuardados))
      }
    }
  }, [clientes, id])

  // Guardar invitados en localStorage
  const guardarInvitados = (nuevosInvitados: Invitado[]) => {
    if (id) {
      localStorage.setItem(`invitados_${id}`, JSON.stringify(nuevosInvitados))
      setInvitados(nuevosInvitados)
    }
  }

  // Guardar recordatorios en localStorage
  const guardarRecordatorios = (nuevosRecordatorios: Recordatorio[]) => {
    if (id) {
      localStorage.setItem(`recordatorios_${id}`, JSON.stringify(nuevosRecordatorios))
      setRecordatorios(nuevosRecordatorios)
    }
  }

  const agregarInvitado = () => {
    if (nuevoInvitado.trim()) {
      const nuevoItem: Invitado = {
        id: Date.now().toString(),
        nombre: nuevoInvitado.trim(),
        confirmado: false,
        tachado: false
      }
      const nuevosInvitados = [...invitados, nuevoItem]
      guardarInvitados(nuevosInvitados)
      setNuevoInvitado('')
      toast.success('Invitado agregado')
    }
  }

  const eliminarInvitado = (invitadoId: string) => {
    const nuevosInvitados = invitados.filter(inv => inv.id !== invitadoId)
    guardarInvitados(nuevosInvitados)
    toast.success('Invitado eliminado')
  }

  const toggleTachado = (invitadoId: string) => {
    const nuevosInvitados = invitados.map(inv => 
      inv.id === invitadoId ? { ...inv, tachado: !inv.tachado } : inv
    )
    guardarInvitados(nuevosInvitados)
  }

  const toggleConfirmado = (invitadoId: string) => {
    const nuevosInvitados = invitados.map(inv => 
      inv.id === invitadoId ? { ...inv, confirmado: !inv.confirmado } : inv
    )
    guardarInvitados(nuevosInvitados)
  }

  const editarNombreInvitado = (invitadoId: string, nuevoNombre: string) => {
    const nuevosInvitados = invitados.map(inv => 
      inv.id === invitadoId ? { ...inv, nombre: nuevoNombre } : inv
    )
    guardarInvitados(nuevosInvitados)
  }

  // Calcular fecha de alerta previa
  const calcularFechaAlerta = (fechaRecordatorio: string, tiempo: number, unidad: string) => {
    const fecha = parseISO(fechaRecordatorio)
    switch (unidad) {
      case 'minutos':
        return addMinutes(fecha, -tiempo)
      case 'horas':
        return addHours(fecha, -tiempo)
      case 'dias':
        return addDays(fecha, -tiempo)
      default:
        return fecha
    }
  }

  // Crear recordatorio mejorado
  const crearRecordatorio = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const alertaActiva = formData.get('alertaActiva') === 'true'
    const alertaTiempo = parseInt(formData.get('alertaTiempo') as string) || 0
    const alertaUnidad = formData.get('alertaUnidad') as 'minutos' | 'horas' | 'dias'

    const nuevoRecordatorio: Recordatorio = {
      id: Date.now().toString(),
      fecha: formData.get('fecha') as string,
      tipo: formData.get('tipo') as string,
      mensaje: formData.get('mensaje') as string,
      alertaPrevia: {
        activa: alertaActiva,
        tiempo: alertaTiempo,
        unidad: alertaUnidad
      },
      createdAt: new Date().toISOString()
    }

    const nuevosRecordatorios = [...recordatorios, nuevoRecordatorio]
    guardarRecordatorios(nuevosRecordatorios)
    setMostrarFormularioRecordatorio(false)
    toast.success('Recordatorio creado exitosamente')

    // También crear evento en Outlook si está configurado
    const correoOutlook = localStorage.getItem('outlook-email')
    if (correoOutlook && cliente) {
      crearRecordatorioOutlook(nuevoRecordatorio)
    }
  }

  // Eliminar recordatorio
  const eliminarRecordatorio = (recordatorioId: string) => {
    const nuevosRecordatorios = recordatorios.filter(r => r.id !== recordatorioId)
    guardarRecordatorios(nuevosRecordatorios)
    toast.success('Recordatorio eliminado')
  }

  // Crear recordatorio en Outlook con alerta previa
  const crearRecordatorioOutlook = (recordatorio: Recordatorio) => {
    const correoOutlook = localStorage.getItem('outlook-email')
    if (!correoOutlook) {
      toast.error('Configura tu correo de Outlook en el calendario primero')
      return
    }

    if (!cliente) return

    const fechaRecordatorio = new Date(recordatorio.fecha)
    const fechaFin = new Date(fechaRecordatorio.getTime() + 60 * 60 * 1000) // 1 hora

    const formatoOutlook = (fecha: Date) => {
      return fecha.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    let descripcionAlerta = ''
    if (recordatorio.alertaPrevia.activa) {
      const fechaAlerta = calcularFechaAlerta(recordatorio.fecha, recordatorio.alertaPrevia.tiempo, recordatorio.alertaPrevia.unidad)
      descripcionAlerta = `
⚠️ ALERTA PREVIA: ${recordatorio.alertaPrevia.tiempo} ${recordatorio.alertaPrevia.unidad} antes
📅 Fecha de alerta: ${format(fechaAlerta, 'dd/MM/yyyy HH:mm', { locale: es })}
`
    }

    const parametros = new URLSearchParams({
      subject: `Recordatorio: ${recordatorio.tipo} - ${cliente.nombres}`,
      startdt: formatoOutlook(fechaRecordatorio),
      enddt: formatoOutlook(fechaFin),
      body: `
Recordatorio para: ${cliente.nombres}
Tipo: ${recordatorio.tipo}
Boda programada: ${format(parseISO(cliente.fechaBoda), 'dd/MM/yyyy HH:mm')}
Lugar: ${cliente.venue}, ${cliente.ciudad}
${descripcionAlerta}
Mensaje:
${recordatorio.mensaje}

Información de contacto:
Teléfono: ${cliente.telefono || 'No disponible'}
Email: ${cliente.email || 'No disponible'}
      `.trim(),
      to: correoOutlook
    })

    const urlOutlook = `https://outlook.live.com/calendar/0/deeplink/compose?${parametros.toString()}`
    window.open(urlOutlook, '_blank')
    toast.success('Recordatorio enviado a Outlook')
  }

  // Verificar recordatorios próximos con alertas
  const obtenerRecordatoriosConAlertas = () => {
    const ahora = new Date()
    return recordatorios.filter(recordatorio => {
      if (!recordatorio.alertaPrevia.activa) return false
      
      const fechaAlerta = calcularFechaAlerta(
        recordatorio.fecha, 
        recordatorio.alertaPrevia.tiempo, 
        recordatorio.alertaPrevia.unidad
      )
      
      return fechaAlerta <= ahora && new Date(recordatorio.fecha) >= ahora
    })
  }

  const recordatoriosConAlertas = obtenerRecordatoriosConAlertas()

  if (!cliente) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cliente no encontrado
          </h3>
          <Link
            to="/clientes"
            className="text-blue-600 hover:text-blue-500"
          >
            Volver a la lista de clientes
          </Link>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGuardar = async () => {
    if (!id) return
    
    setGuardando(true)
    try {
      const updates: Partial<Cliente> = {}
      
      // Solo incluir campos que han cambiado
      Object.keys(formData).forEach(key => {
        const formKey = key as keyof Cliente
        if (formData[formKey] !== cliente[formKey]) {
          if (key === 'fechaBoda' && formData[formKey]) {
            updates[formKey] = new Date(formData[formKey] as string).toISOString()
          } else if (key === 'montoTotal' || key === 'montoAbonado') {
            updates[formKey] = formData[formKey] ? parseFloat(formData[formKey] as string) : undefined
          } else {
            updates[formKey] = formData[formKey]
          }
        }
      })

      if (Object.keys(updates).length > 0) {
        await actualizarCliente(id, updates)
        setEditando(false)
        toast.success('Cliente actualizado exitosamente')
      } else {
        toast.info('No hay cambios para guardar')
        setEditando(false)
      }
    } catch (error) {
      toast.error('Error al actualizar cliente')
    } finally {
      setGuardando(false)
    }
  }

  const cancelarEdicion = () => {
    setFormData(cliente)
    setEditando(false)
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

  const formatearFecha = (fecha: string) => {
    return format(parseISO(fecha), 'dd/MM/yyyy HH:mm', { locale: es })
  }

  const formatearFechaInput = (fecha: string) => {
    return format(parseISO(fecha), "yyyy-MM-dd'T'HH:mm")
  }

  const saldoPendiente = (cliente.montoTotal || 0) - (cliente.montoAbonado || 0)

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/clientes')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver a clientes
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {cliente.nombres}
              </h1>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${obtenerColorEstado(cliente.estado)}`}>
                  {cliente.estado}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${obtenerColorServicio(cliente.servicio)}`}>
                  {cliente.servicio.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {/* Botón para crear recordatorio */}
              <button
                onClick={() => setMostrarFormularioRecordatorio(true)}
                className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Crear Recordatorio
              </button>

              {editando ? (
                <>
                  <button
                    onClick={cancelarEdicion}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {guardando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditando(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alertas de recordatorios */}
        {recordatoriosConAlertas.length > 0 && (
          <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="text-lg font-medium text-orange-900">
                ¡Recordatorios Activos!
              </h3>
            </div>
            <div className="space-y-2">
              {recordatoriosConAlertas.map((recordatorio) => {
                const fechaAlerta = calcularFechaAlerta(
                  recordatorio.fecha, 
                  recordatorio.alertaPrevia.tiempo, 
                  recordatorio.alertaPrevia.unidad
                )
                return (
                  <div key={recordatorio.id} className="bg-white p-3 rounded border-l-4 border-orange-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{recordatorio.tipo}</h4>
                        <p className="text-sm text-gray-600">{recordatorio.mensaje}</p>
                        <p className="text-xs text-orange-600 mt-1">
                          Alerta desde: {format(fechaAlerta, 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {recordatorio.alertaPrevia.tiempo} {recordatorio.alertaPrevia.unidad} antes
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información personal */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombres Completos
                    </label>
                    {editando ? (
                      <input
                        type="text"
                        name="nombres"
                        value={formData.nombres || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{cliente.nombres}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email
                    </label>
                    {editando ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {cliente.email ? (
                          <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:text-blue-500">
                            {cliente.email}
                          </a>
                        ) : (
                          <span className="text-gray-500">No especificado</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Teléfono
                    </label>
                    {editando ? (
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {cliente.telefono ? (
                          <a href={`tel:${cliente.telefono}`} className="text-blue-600 hover:text-blue-500">
                            {cliente.telefono}
                          </a>
                        ) : (
                          <span className="text-gray-500">No especificado</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    {editando ? (
                      <select
                        name="estado"
                        value={formData.estado || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="potencial">Potencial</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{cliente.estado}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información del evento */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Información del Evento
                </h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha de Boda
                    </label>
                    {editando ? (
                      <input
                        type="datetime-local"
                        name="fechaBoda"
                        value={formatearFechaInput(formData.fechaBoda || cliente.fechaBoda)}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {formatearFecha(cliente.fechaBoda)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Ciudad
                    </label>
                    {editando ? (
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{cliente.ciudad}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Venue/Lugar
                    </label>
                    {editando ? (
                      <input
                        type="text"
                        name="venue"
                        value={formData.venue || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{cliente.venue}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Servicio
                    </label>
                    {editando ? (
                      <select
                        name="servicio"
                        value={formData.servicio || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="fotografia">Solo Fotografía</option>
                        <option value="video">Solo Video</option>
                        <option value="fotografia_video">Fotografía + Video</option>
                        <option value="album">Álbum</option>
                        <option value="paquete_completo">Paquete Completo</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {cliente.servicio.replace('_', ' ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Forma de Pago
                    </label>
                    {editando ? (
                      <select
                        name="formaPago"
                        value={formData.formaPago || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="financiado">Financiado</option>
                        <option value="mixto">Mixto</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{cliente.formaPago}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Invitados */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Lista de Invitados
                  </h3>
                  <button
                    onClick={() => setEditandoInvitados(!editandoInvitados)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    {editandoInvitados ? 'Terminar edición' : 'Editar lista'}
                  </button>
                </div>

                {/* Agregar nuevo invitado */}
                <div className="mb-4 flex space-x-2">
                  <input
                    type="text"
                    value={nuevoInvitado}
                    onChange={(e) => setNuevoInvitado(e.target.value)}
                    placeholder="Nombre del invitado"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && agregarInvitado()}
                  />
                  <button
                    onClick={agregarInvitado}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Lista de invitados */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {invitados.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      No hay invitados agregados. Agrega el primer invitado arriba.
                    </p>
                  ) : (
                    invitados.map((invitado) => (
                      <div
                        key={invitado.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          invitado.tachado ? 'bg-gray-100 opacity-60' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <button
                            onClick={() => toggleConfirmado(invitado.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              invitado.confirmado
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {invitado.confirmado && <Check className="h-3 w-3" />}
                          </button>
                          
                          {editandoInvitados ? (
                            <input
                              type="text"
                              value={invitado.nombre}
                              onChange={(e) => editarNombreInvitado(invitado.id, e.target.value)}
                              className="flex-1 border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span
                              className={`flex-1 ${
                                invitado.tachado ? 'line-through text-gray-500' : ''
                              }`}
                              onClick={() => toggleTachado(invitado.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              {invitado.nombre}
                            </span>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            {invitado.confirmado && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Confirmado
                              </span>
                            )}
                            {invitado.tachado && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Tachado
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleTachado(invitado.id)}
                            className={`p-1 rounded ${
                              invitado.tachado
                                ? 'text-green-600 hover:text-green-800'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={invitado.tachado ? 'Destachar' : 'Tachar'}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => eliminarInvitado(invitado.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Eliminar invitado"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Estadísticas de invitados */}
                {invitados.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {invitados.length}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {invitados.filter(inv => inv.confirmado).length}
                        </div>
                        <div className="text-xs text-gray-500">Confirmados</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-600">
                          {invitados.filter(inv => inv.tachado).length}
                        </div>
                        <div className="text-xs text-gray-500">Tachados</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recordatorios Mejorados */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Recordatorios con Alertas
                  </h3>
                </div>

                <div className="space-y-3">
                  {recordatorios.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      No hay recordatorios creados. Crea tu primer recordatorio usando el botón de arriba.
                    </p>
                  ) : (
                    recordatorios.map((recordatorio) => (
                      <div key={recordatorio.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {recordatorio.tipo}
                            </h4>
                            <div className="text-xs text-gray-500 mt-1">
                              {format(parseISO(recordatorio.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </div>
                            {recordatorio.alertaPrevia.activa && (
                              <div className="text-xs text-orange-600 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Alerta: {recordatorio.alertaPrevia.tiempo} {recordatorio.alertaPrevia.unidad} antes
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              {recordatorio.mensaje}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            <button
                              onClick={() => crearRecordatorioOutlook(recordatorio)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                              title="Enviar a Outlook"
                            >
                              📧
                            </button>
                            <button
                              onClick={() => eliminarRecordatorio(recordatorio.id)}
                              className="text-red-400 hover:text-red-600"
                              title="Eliminar recordatorio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Solicitudes especiales */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Solicitudes Especiales
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    {editando ? (
                      <textarea
                        name="solicitudesEspeciales"
                        value={formData.solicitudesEspeciales || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {cliente.solicitudesEspeciales || (
                          <span className="text-gray-500">No hay solicitudes especiales</span>
                        )}
                      </p>
                    )}
                  </div>

                  {cliente.archivoExcel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Archivo Excel
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-8 w-8 text-green-500" />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Solicitudes especiales.xlsx
                          </p>
                          <p className="text-xs text-gray-500">
                            Archivo cargado
                          </p>
                        </div>
                        <a
                          href={cliente.archivoExcel}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Notas Adicionales
                </h3>
                
                <div>
                  {editando ? (
                    <textarea
                      name="notas"
                      value={formData.notas || ''}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Notas internas sobre el cliente..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {cliente.notas || (
                        <span className="text-gray-500">No hay notas adicionales</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Resumen financiero */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                  <Euro className="mr-2 h-5 w-5" />
                  Resumen Financiero
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monto Total
                    </label>
                    {editando ? (
                      <input
                        type="number"
                        name="montoTotal"
                        value={formData.montoTotal || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {cliente.montoTotal ? `€${cliente.montoTotal.toLocaleString()}` : 'No especificado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monto Abonado
                    </label>
                    {editando ? (
                      <input
                        type="number"
                        name="montoAbonado"
                        value={formData.montoAbonado || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-lg font-semibold text-green-600">
                        {cliente.montoAbonado ? `€${cliente.montoAbonado.toLocaleString()}` : '€0'}
                      </p>
                    )}
                  </div>

                  {cliente.montoTotal && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Saldo Pendiente:</span>
                        <span className={`text-lg font-semibold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          €{saldoPendiente.toLocaleString()}
                        </span>
                      </div>
                      
                      {cliente.montoTotal > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progreso de pago</span>
                            <span>{Math.round(((cliente.montoAbonado || 0) / cliente.montoTotal) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min(((cliente.montoAbonado || 0) / cliente.montoTotal) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recordatorios próximos */}
            {recordatorios.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Próximos Recordatorios
                  </h3>
                  
                  <div className="space-y-3">
                    {recordatorios
                      .filter(r => new Date(r.fecha) >= new Date())
                      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                      .slice(0, 3)
                      .map((recordatorio) => (
                        <div key={recordatorio.id} className="border-l-4 border-yellow-500 pl-3 py-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {recordatorio.tipo}
                          </h4>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(parseISO(recordatorio.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                          {recordatorio.alertaPrevia.activa && (
                            <div className="text-xs text-orange-600 mt-1">
                              ⚠️ {recordatorio.alertaPrevia.tiempo} {recordatorio.alertaPrevia.unidad} antes
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {recordatorio.mensaje}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Información de creación */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Información del Registro
                </h3>
                
                <div className="space-y-3 text-sm">
                  {cliente.createdAt && (
                    <div>
                      <span className="font-medium text-gray-700">Creado:</span>
                      <p className="text-gray-600">
                        {formatearFecha(cliente.createdAt)}
                      </p>
                    </div>
                  )}
                  
                  {cliente.updatedAt && (
                    <div>
                      <span className="font-medium text-gray-700">Última actualización:</span>
                      <p className="text-gray-600">
                        {formatearFecha(cliente.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de formulario de recordatorio mejorado */}
        {mostrarFormularioRecordatorio && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Crear Recordatorio con Alerta para {cliente.nombres}
                </h3>
                
                <form onSubmit={crearRecordatorio} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Recordatorio *
                      </label>
                      <select
                        name="tipo"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="Seguimiento">Seguimiento</option>
                        <option value="Confirmación">Confirmación</option>
                        <option value="Preparación">Preparación</option>
                        <option value="Entrega">Entrega</option>
                        <option value="Pago">Recordatorio de Pago</option>
                        <option value="Reunión">Reunión</option>
                        <option value="Llamada">Llamada</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha y Hora del Recordatorio *
                      </label>
                      <input
                        name="fecha"
                        type="datetime-local"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mensaje del Recordatorio *
                    </label>
                    <textarea
                      name="mensaje"
                      rows={4}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      placeholder="Describe qué necesitas recordar para este cliente..."
                    />
                  </div>

                  {/* Nueva sección de alerta previa */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <h4 className="text-sm font-medium text-orange-900 mb-3 flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Configuración de Alerta Previa
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="alertaActiva"
                          value="true"
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Activar alerta previa al evento
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Tiempo antes
                          </label>
                          <input
                            name="alertaTiempo"
                            type="number"
                            min="1"
                            defaultValue="1"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Unidad
                          </label>
                          <select
                            name="alertaUnidad"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm"
                          >
                            <option value="minutos">Minutos</option>
                            <option value="horas">Horas</option>
                            <option value="dias">Días</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-xs text-orange-700">
                        💡 Ejemplo: Si seleccionas "2 días", recibirás una alerta 2 días antes de la fecha del recordatorio.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Integración con Outlook</h4>
                    <p className="text-xs text-blue-700">
                      {localStorage.getItem('outlook-email') 
                        ? `El recordatorio también se enviará automáticamente a tu calendario de Outlook (${localStorage.getItem('outlook-email')}) con la configuración de alerta especificada.`
                        : 'Configura tu correo de Outlook en el calendario para sincronización automática'
                      }
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setMostrarFormularioRecordatorio(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      Crear Recordatorio
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClienteDetalle
