
import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Eye, 
  EyeOff,
  Camera,
  Video,
  BookOpen,
  Package,
  Star
} from 'lucide-react'
import { useServicios, Servicio } from '../hooks/useServicios'

const Servicios: React.FC = () => {
  const { 
    servicios, 
    loading, 
    crearServicio, 
    actualizarServicio, 
    eliminarServicio, 
    filtrarPorCategoria 
  } = useServicios()

  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [servicioEditando, setServicioEditando] = useState<string | null>(null)
  const [datosEdicion, setDatosEdicion] = useState<Partial<Servicio>>({})

  const serviciosFiltrados = filtrarPorCategoria(categoriaFiltro)

  const obtenerIconoCategoria = (categoria: string) => {
    switch (categoria) {
      case 'fotografia': return <Camera className="h-5 w-5 text-blue-500" />
      case 'video': return <Video className="h-5 w-5 text-red-500" />
      case 'album': return <BookOpen className="h-5 w-5 text-green-500" />
      case 'paquetes': return <Package className="h-5 w-5 text-purple-500" />
      case 'extras': return <Star className="h-5 w-5 text-yellow-500" />
      default: return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const iniciarEdicion = (servicio: Servicio) => {
    setServicioEditando(servicio._id)
    setDatosEdicion({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      categoria: servicio.categoria,
      precio: servicio.precio,
      duracion: servicio.duracion,
      incluye: servicio.incluye,
      activo: servicio.activo
    })
  }

  const guardarEdicion = async () => {
    if (!servicioEditando) return

    try {
      await actualizarServicio(servicioEditando, datosEdicion)
      setServicioEditando(null)
      setDatosEdicion({})
    } catch (error) {
      console.error('Error guardando servicio:', error)
    }
  }

  const cancelarEdicion = () => {
    setServicioEditando(null)
    setDatosEdicion({})
  }

  const handleCrearServicio = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const incluye = (formData.get('incluye') as string)
      .split('\n')
      .filter(item => item.trim() !== '')
      .map(item => item.trim())

    try {
      await crearServicio({
        nombre: formData.get('nombre') as string,
        descripcion: formData.get('descripcion') as string,
        categoria: formData.get('categoria') as any,
        precio: parseFloat(formData.get('precio') as string),
        duracion: formData.get('duracion') as string,
        incluye,
        activo: formData.get('activo') === 'true'
      })
      setMostrarFormulario(false)
      event.currentTarget.reset()
    } catch (error) {
      console.error('Error creando servicio:', error)
    }
  }

  const toggleActivo = async (servicio: Servicio) => {
    try {
      await actualizarServicio(servicio._id, { activo: !servicio.activo })
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Servicios
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra los servicios que ofreces a tus clientes
              </p>
            </div>
            
            <button
              onClick={() => setMostrarFormulario(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Servicio
            </button>
          </div>

          {/* Filtros */}
          <div className="mt-6">
            <div className="flex space-x-2">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'fotografia', label: 'Fotografía' },
                { key: 'video', label: 'Video' },
                { key: 'album', label: 'Álbum' },
                { key: 'paquetes', label: 'Paquetes' },
                { key: 'extras', label: 'Extras' }
              ].map((filtro) => (
                <button
                  key={filtro.key}
                  onClick={() => setCategoriaFiltro(filtro.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    categoriaFiltro === filtro.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de servicios */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {serviciosFiltrados.map((servicio) => (
            <div 
              key={servicio._id} 
              className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${
                servicio.activo ? 'border-green-400' : 'border-gray-300'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {obtenerIconoCategoria(servicio.categoria)}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActivo(servicio)}
                      className={`p-1 rounded ${
                        servicio.activo ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {servicio.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    {servicioEditando === servicio._id ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={guardarEdicion}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => iniciarEdicion(servicio)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => eliminarServicio(servicio._id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contenido editable */}
                {servicioEditando === servicio._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={datosEdicion.nombre || ''}
                      onChange={(e) => setDatosEdicion(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full text-lg font-medium border-gray-300 rounded-md"
                    />
                    
                    <textarea
                      value={datosEdicion.descripcion || ''}
                      onChange={(e) => setDatosEdicion(prev => ({ ...prev, descripcion: e.target.value }))}
                      rows={2}
                      className="w-full text-sm text-gray-600 border-gray-300 rounded-md"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={datosEdicion.precio || ''}
                        onChange={(e) => setDatosEdicion(prev => ({ ...prev, precio: parseFloat(e.target.value) }))}
                        className="text-xl font-bold text-blue-600 border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={datosEdicion.duracion || ''}
                        onChange={(e) => setDatosEdicion(prev => ({ ...prev, duracion: e.target.value }))}
                        className="text-sm text-gray-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {servicio.nombre}
                    </h3>
                    
                    {servicio.descripcion && (
                      <p className="text-sm text-gray-600 mb-3">
                        {servicio.descripcion}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        €{servicio.precio}
                      </span>
                      {servicio.duracion && (
                        <span className="text-sm text-gray-500">
                          {servicio.duracion}
                        </span>
                      )}
                    </div>

                    {servicio.incluye && servicio.incluye.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Incluye:
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {servicio.incluye.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                          {servicio.incluye.length > 3 && (
                            <li className="text-blue-600">
                              +{servicio.incluye.length - 3} más...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {serviciosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay servicios
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando un nuevo servicio
            </p>
            <div className="mt-6">
              <button
                onClick={() => setMostrarFormulario(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Servicio
              </button>
            </div>
          </div>
        )}

        {/* Modal de formulario */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Nuevo Servicio
                </h3>
                
                <form onSubmit={handleCrearServicio} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre del Servicio *
                    </label>
                    <input
                      name="nombre"
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Categoría *
                      </label>
                      <select
                        name="categoria"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="fotografia">Fotografía</option>
                        <option value="video">Video</option>
                        <option value="album">Álbum</option>
                        <option value="paquetes">Paquetes</option>
                        <option value="extras">Extras</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Precio (€) *
                      </label>
                      <input
                        name="precio"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Duración
                      </label>
                      <input
                        name="duracion"
                        type="text"
                        placeholder="ej: 8 horas"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ¿Qué incluye? (uno por línea)
                    </label>
                    <textarea
                      name="incluye"
                      rows={5}
                      placeholder="Fotografía de preparativos&#10;Ceremonia completa&#10;Sesión de pareja&#10;300+ fotos editadas"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      name="activo"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      Crear Servicio
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

export default Servicios
