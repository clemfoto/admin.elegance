
import React, { useState } from 'react'
import { 
  Plus, 
  Clock, 
  Target, 
  User, 
  Calendar,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { useTasks, Task } from '../hooks/useTasks'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const Tasks: React.FC = () => {
  const { 
    tasks, 
    loading, 
    createTask, 
    updateTask, 
    deleteTask
  } = useTasks()

  const [usuarioActivo, setUsuarioActivo] = useState<'Clem' | 'Diana'>('Clem')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [taskEditando, setTaskEditando] = useState<Task | null>(null)
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false)

  // Obtener estadísticas por usuario
  const obtenerEstadisticasPorUsuario = (usuario: 'Clem' | 'Diana') => {
    const tareasUsuario = tasks.filter(task => task.assignedTo === usuario)
    return {
      total: tareasUsuario.length,
      pendientes: tareasUsuario.filter(t => t.status === 'pendiente').length,
      enProgreso: tareasUsuario.filter(t => t.status === 'en_progreso').length,
      completadas: tareasUsuario.filter(t => t.status === 'completada').length
    }
  }

  const estadisticasClem = obtenerEstadisticasPorUsuario('Clem')
  const estadisticasDiana = obtenerEstadisticasPorUsuario('Diana')
  const tasksPorUsuario = tasks.filter(task => task.assignedTo === usuarioActivo)

  const handleCrearTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    try {
      await createTask({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        assignedTo: usuarioActivo,
        status: 'pendiente',
        priority: formData.get('priority') as any,
        dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string).toISOString() : undefined,
        notes: formData.get('notes') as string
      })
      setMostrarFormulario(false)
      event.currentTarget.reset()
    } catch (error) {
      console.error('Error creando tarea:', error)
    }
  }

  const handleActualizarEstado = async (taskId: string, nuevoEstado: Task['status']) => {
    try {
      await updateTask(taskId, { status: nuevoEstado })
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const handleIniciarPausar = async (task: Task) => {
    const nuevoEstado = task.status === 'en_progreso' ? 'pendiente' : 'en_progreso'
    await handleActualizarEstado(task._id, nuevoEstado)
  }

  const obtenerIconoEstado = (estado: Task['status']) => {
    switch (estado) {
      case 'pendiente': return <Clock className="h-4 w-4 text-gray-500" />
      case 'en_progreso': return <Play className="h-4 w-4 text-blue-500" />
      case 'completada': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelada': return <Pause className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const obtenerColorPrioridad = (prioridad?: string) => {
    switch (prioridad) {
      case 'urgente': return 'border-l-4 border-red-500'
      case 'alta': return 'border-l-4 border-orange-500'
      case 'media': return 'border-l-4 border-yellow-500'
      case 'baja': return 'border-l-4 border-green-500'
      default: return 'border-l-4 border-gray-300'
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
                Gestión de Tareas
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Organiza y gestiona las tareas del equipo
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Estadísticas
              </button>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarea
              </button>
            </div>
          </div>

          {/* Pestañas de usuarios - DISEÑO ORIGINAL SIN NÚMEROS */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setUsuarioActivo('Clem')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    usuarioActivo === 'Clem'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="font-semibold">CLEM</span>
                  </div>
                </button>

                <button
                  onClick={() => setUsuarioActivo('Diana')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    usuarioActivo === 'Diana'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="font-semibold">DIANA</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Estadísticas detalladas */}
        {mostrarEstadisticas && (
          <div className="mb-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Estadísticas de {usuarioActivo}
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {usuarioActivo === 'Clem' ? estadisticasClem.total : estadisticasDiana.total}
                </div>
                <div className="text-sm text-gray-500">Total de Tareas</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-900">
                  {usuarioActivo === 'Clem' ? estadisticasClem.pendientes : estadisticasDiana.pendientes}
                </div>
                <div className="text-sm text-yellow-600">Pendientes</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {usuarioActivo === 'Clem' ? estadisticasClem.enProgreso : estadisticasDiana.enProgreso}
                </div>
                <div className="text-sm text-blue-600">En Progreso</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {usuarioActivo === 'Clem' ? estadisticasClem.completadas : estadisticasDiana.completadas}
                </div>
                <div className="text-sm text-green-600">Completadas</div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de tareas */}
        <div className="space-y-4">
          {tasksPorUsuario.length > 0 ? (
            tasksPorUsuario.map((task) => (
              <div 
                key={task._id} 
                className={`bg-white shadow rounded-lg p-6 ${obtenerColorPrioridad(task.priority)} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {obtenerIconoEstado(task.status)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h3>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'completada' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.status === 'pendiente' ? 'Pendiente' :
                         task.status === 'en_progreso' ? 'En Progreso' :
                         task.status === 'completada' ? 'Completada' : 'Cancelada'}
                      </span>
                      
                      {task.priority && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'urgente' ? 'bg-red-100 text-red-800' :
                          task.priority === 'alta' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'urgente' ? 'Urgente' :
                           task.priority === 'alta' ? 'Alta' :
                           task.priority === 'media' ? 'Media' : 'Baja'}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        <span className="font-medium">{task.assignedTo}</span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {format(parseISO(task.dueDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      )}
                    </div>

                    {task.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">{task.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {task.status !== 'completada' && (
                      <button
                        onClick={() => handleIniciarPausar(task)}
                        className={`p-2 rounded-md text-sm font-medium transition-colors ${
                          task.status === 'en_progreso'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                        title={task.status === 'en_progreso' ? 'Pausar tarea' : 'Iniciar tarea'}
                      >
                        {task.status === 'en_progreso' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                    )}

                    {task.status !== 'completada' && (
                      <button
                        onClick={() => handleActualizarEstado(task._id, 'completada')}
                        className="p-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                        title="Marcar como completada"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setTaskEditando(task)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                      title="Editar tarea"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => deleteTask(task._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className={`text-6xl mb-4 ${usuarioActivo === 'Clem' ? 'text-blue-400' : 'text-purple-400'}`}>
                📝
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay tareas para {usuarioActivo}
              </h3>
              <p className="text-gray-500 mb-6">
                Comienza creando una nueva tarea
              </p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  usuarioActivo === 'Clem' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Tarea
              </button>
            </div>
          )}
        </div>

        {/* Modal de formulario */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Nueva Tarea para {usuarioActivo}
                </h3>
                
                <form onSubmit={handleCrearTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Título *
                    </label>
                    <input
                      name="title"
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      placeholder="Título de la tarea"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      placeholder="Descripción detallada de la tarea"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prioridad
                      </label>
                      <select
                        name="priority"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha Límite
                      </label>
                      <input
                        name="dueDate"
                        type="datetime-local"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notas
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      placeholder="Notas adicionales"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-colors ${
                        usuarioActivo === 'Clem' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      Crear Tarea
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {taskEditando && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Editar Tarea
                </h3>
                
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  
                  try {
                    await updateTask(taskEditando._id, {
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      status: formData.get('status') as any,
                      priority: formData.get('priority') as any,
                      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string).toISOString() : undefined,
                      notes: formData.get('notes') as string
                    })
                    setTaskEditando(null)
                  } catch (error) {
                    console.error('Error actualizando tarea:', error)
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Título *
                    </label>
                    <input
                      name="title"
                      type="text"
                      required
                      defaultValue={taskEditando.title}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={taskEditando.description}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <select
                        name="status"
                        defaultValue={taskEditando.status}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prioridad
                      </label>
                      <select
                        name="priority"
                        defaultValue={taskEditando.priority}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha Límite
                      </label>
                      <input
                        name="dueDate"
                        type="datetime-local"
                        defaultValue={taskEditando.dueDate ? taskEditando.dueDate.slice(0, 16) : ''}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notas
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      defaultValue={taskEditando.notes}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setTaskEditando(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Actualizar Tarea
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

export default Tasks
