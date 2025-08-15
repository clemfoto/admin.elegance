
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  X,
  Calendar,
  MapPin,
  Euro,
  FileText,
  Phone,
  Mail
} from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import toast from 'react-hot-toast'

const AgregarCliente: React.FC = () => {
  const navigate = useNavigate()
  const { crearCliente } = useClientes()
  const [guardando, setGuardando] = useState(false)
  
  const [formData, setFormData] = useState({
    nombres: '',
    email: '',
    telefono: '',
    fechaBoda: '',
    ciudad: '',
    venue: '',
    servicio: 'fotografia' as const,
    formaPago: 'transferencia' as const,
    montoTotal: '',
    montoAbonado: '',
    estado: 'potencial' as const,
    solicitudesEspeciales: '',
    notas: ''
  })

  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      // Validar tipo de archivo
      const tiposPermitidos = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ]
      
      if (tiposPermitidos.includes(archivo.type)) {
        setArchivoSeleccionado(archivo)
      } else {
        toast.error('Solo se permiten archivos Excel (.xlsx, .xls) o CSV')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      // Validaciones básicas
      if (!formData.nombres.trim()) {
        toast.error('El nombre es obligatorio')
        return
      }

      if (!formData.fechaBoda) {
        toast.error('La fecha de boda es obligatoria')
        return
      }

      if (!formData.ciudad.trim()) {
        toast.error('La ciudad es obligatoria')
        return
      }

      if (!formData.venue.trim()) {
        toast.error('El venue es obligatorio')
        return
      }

      // Simular carga de archivo (en producción se subiría a un servicio de almacenamiento)
      let urlArchivo = ''
      if (archivoSeleccionado) {
        // Simular URL del archivo subido
        urlArchivo = `https://storage.example.com/solicitudes/${Date.now()}-${archivoSeleccionado.name}`
        toast.success('Archivo cargado exitosamente')
      }

      const clienteData = {
        nombres: formData.nombres.trim(),
        email: formData.email.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        fechaBoda: new Date(formData.fechaBoda).toISOString(),
        ciudad: formData.ciudad.trim(),
        venue: formData.venue.trim(),
        servicio: formData.servicio,
        formaPago: formData.formaPago,
        montoTotal: formData.montoTotal ? parseFloat(formData.montoTotal) : undefined,
        montoAbonado: formData.montoAbonado ? parseFloat(formData.montoAbonado) : undefined,
        estado: formData.estado,
        solicitudesEspeciales: formData.solicitudesEspeciales.trim() || undefined,
        archivoExcel: urlArchivo || undefined,
        notas: formData.notas.trim() || undefined,
        recordatorios: []
      }

      await crearCliente(clienteData)
      navigate('/clientes')
    } catch (error) {
      // Error ya manejado en el hook
    } finally {
      setGuardando(false)
    }
  }

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
          
          <h1 className="text-3xl font-bold text-gray-900">
            Agregar Nuevo Cliente
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Completa la información del cliente y su evento
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Personal */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2">
                  <label htmlFor="nombres" className="block text-sm font-medium text-gray-700">
                    Nombres Completos *
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    id="nombres"
                    required
                    value={formData.nombres}
                    onChange={handleInputChange}
                    placeholder="Ej: María González y Carlos Rodríguez"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    id="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+34 612 345 678"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información del Evento */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información del Evento
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="fechaBoda" className="block text-sm font-medium text-gray-700">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Fecha de Boda *
                  </label>
                  <input
                    type="datetime-local"
                    name="fechaBoda"
                    id="fechaBoda"
                    required
                    value={formData.fechaBoda}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    id="ciudad"
                    required
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Madrid, Barcelona, etc."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                    Venue/Lugar del Evento *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    id="venue"
                    required
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="Hotel Villa Magna, Hacienda San José, etc."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Servicios y Pagos */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Servicios y Pagos
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="servicio" className="block text-sm font-medium text-gray-700">
                    Servicio Contratado
                  </label>
                  <select
                    name="servicio"
                    id="servicio"
                    value={formData.servicio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fotografia">Solo Fotografía</option>
                    <option value="video">Solo Video</option>
                    <option value="fotografia_video">Fotografía + Video</option>
                    <option value="album">Álbum</option>
                    <option value="paquete_completo">Paquete Completo</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="formaPago" className="block text-sm font-medium text-gray-700">
                    Forma de Pago
                  </label>
                  <select
                    name="formaPago"
                    id="formaPago"
                    value={formData.formaPago}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="financiado">Financiado</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="montoTotal" className="block text-sm font-medium text-gray-700">
                    <Euro className="inline w-4 h-4 mr-1" />
                    Monto Total (€)
                  </label>
                  <input
                    type="number"
                    name="montoTotal"
                    id="montoTotal"
                    min="0"
                    step="0.01"
                    value={formData.montoTotal}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="montoAbonado" className="block text-sm font-medium text-gray-700">
                    <Euro className="inline w-4 h-4 mr-1" />
                    Monto Abonado (€)
                  </label>
                  <input
                    type="number"
                    name="montoAbonado"
                    id="montoAbonado"
                    min="0"
                    step="0.01"
                    value={formData.montoAbonado}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                    Estado del Cliente
                  </label>
                  <select
                    name="estado"
                    id="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="potencial">Potencial</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Solicitudes Especiales */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                <FileText className="inline w-5 h-5 mr-2" />
                Solicitudes Especiales
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="solicitudesEspeciales" className="block text-sm font-medium text-gray-700">
                    Descripción de Solicitudes
                  </label>
                  <textarea
                    name="solicitudesEspeciales"
                    id="solicitudesEspeciales"
                    rows={4}
                    value={formData.solicitudesEspeciales}
                    onChange={handleInputChange}
                    placeholder="Describe las solicitudes especiales del cliente..."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Carga de archivo Excel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="inline w-4 h-4 mr-1" />
                    Archivo Excel con Solicitudes
                  </label>
                  
                  {!archivoSeleccionado ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="archivo-excel" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Haz clic para subir un archivo Excel
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            Formatos soportados: .xlsx, .xls, .csv
                          </span>
                        </label>
                        <input
                          id="archivo-excel"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleArchivoChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-green-500" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {archivoSeleccionado.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(archivoSeleccionado.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setArchivoSeleccionado(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notas Adicionales */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Notas Adicionales
              </h3>
              
              <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  name="notas"
                  id="notas"
                  rows={3}
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Notas internas sobre el cliente o el evento..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/clientes')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AgregarCliente
