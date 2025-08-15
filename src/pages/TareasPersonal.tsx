
import React, { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskEditor from '../components/TaskEditor'
import { Users, Calendar, AlertTriangle, CheckCircle, Edit3, Plus } from 'lucide-react'
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'

const TareasPersonal: React.FC = () => {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()
  const [filtroPersona, setFiltroPersona] = useState<string>('todas')
  const [filtroEstado, setFiltroEstado] = useState<string>('todas')
  const [tareaEditando, setTareaEditando] = useState<string | null>(null)
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false)

  const personas = ['Clem', 'Diana']
  const estados = [
    { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
    { value: 'en_progreso', label: 'En Progreso', color: 'blue' },
    { value: 'completada', label: 'Completada', color: 'green' },
    { value: 'cancelada', label: 'Cancelada', color: 'red' }
  ]

  const prioridades = [
    { value: 'baja', label: 'Baja', color: 'gray' },
    { value: 'media', label: 'Media', color: 'yellow' },
    { value: 'alta', label: 'Alta', color: 'orange' },
    { value: 'urgente', label: 'Urgente', color: 'red' }
  ]

  // Filtrar tareas
  const tareasFiltradas = tasks.filter(task => {
    const coincidePersona = filtroPersona === 'todas' || task.assignedTo === filtroPersona
    const coincideEstado = filtroEstado === 'todas' || task.status === filtroEstado
    return coincidePersona && coincideEstado
  })

  // Obtener estadísticas
  const estadisticas = {
    total: tasks.length,
    pendientes: tasks.filter(t => t.status === 'pendiente').length,
    enProgreso: tasks.filter(t => t.status === 'en_progreso').length,
    completadas: tasks.filter(t => t.status === 'completada').length,
    vencidas: tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'completada').length
  }

  const obtenerColorEstado = (estado: string) => {
    return estados.find(e => e.value === estado)?.color || 'gray'
  }

  const obtenerColorPrioridad = (prioridad: string) => {
    return prioridades.find(p => p.value === prioridad)?.color || 'gray'
  }

  const obtenerUrgenciaFecha = (fecha: string) => {
    const fechaTarea = parseISO(fecha)
    if (isPast(fechaTarea)) return 'vencida'
    if (isToday(fechaTarea)) return 'hoy'
    if (isTomorrow(fechaTarea)) return 'mañana'
    return 'normal'
  }

  const handleCrearTarea = async (taskData: any) => {
    try {
      await createTask(taskData)
      setMostrandoFormulario(false)
      return {} // Retornar objeto para compatibilidad
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tareas del Personal</h1>
        <p className="text-gray-600">Gestión de tareas para Clem y Diana</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-700">{estadisticas.total}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-700">{estadisticas.pendientes}</p>
            </div>
            <Calendar className="text-yellow-600" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">En Progreso</p>
              <p className="text-2xl font-bold text-blue-700">{estadisticas.enProgreso}</p>
            </div>
            <Edit3 className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Completadas</p>
              <p className="text-2xl font-bold text-green-700">{estadisticas.completadas}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Vencidas</p>
              <p className="text-2xl font-bold text-red-700">{estadisticas.vencidas}</p>
            </div>
            <AlertTriangle className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
          <select
            value={filtroPersona}
            onChange={(e) => setFiltroPersona(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="todas">Todas las personas</option>
            {personas.map(persona => (
              <option key={persona} value={persona}>{persona}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="todas">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setMostrandoFormulario(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* Editor de tarea */}
      {(tareaEditando || mostrandoFormulario) && (
        <div className="mb-6">
          <TaskEditor
            task={tareaEditando ? tasks.find(t => t._id === tareaEditando) : undefined}
            onUpdate={updateTask}
            onCreate={mostrandoFormulario ? handleCrearTarea : undefined}
            onCancel={() => {
              setTareaEditando(null)
              setMostrandoFormulario(false)
            }}
          />
        </div>
      )}

      {/* Lista de tareas */}
      <div className="space-y-4">
        {tareasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No hay tareas que coincidan con los filtros</p>
          </div>
        ) : (
          tareasFiltradas.map((task) => {
            const urgenciaFecha = task.dueDate ? obtenerUrgenciaFecha(task.dueDate) : 'normal'
            
            return (
              <div
                key={task._id}
                className={`bg-white rounded-lg shadow border-l-4 p-6 ${
                  urgenciaFecha === 'vencida' ? 'border-red-500' :
                  urgenciaFecha === 'hoy' ? 'border-orange-500' :
                  urgenciaFecha === 'mañana' ? 'border-yellow-500' :
                  'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                      
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${obtenerColorEstado(task.status)}-100 text-${obtenerColorEstado(task.status)}-800`}>
                        {estados.find(e => e.value === task.status)?.label}
                      </span>
                      
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${obtenerColorPrioridad(task.priority)}-100 text-${obtenerColorPrioridad(task.priority)}-800`}>
                        {prioridades.find(p => p.value === task.priority)?.label}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{task.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        <span className="font-medium">{task.assignedTo}</span>
                      </div>
                      
                      {task.dueDate && (
                        <div className={`flex items-center ${
                          urgenciaFecha === 'vencida' ? 'text-red-600' :
                          urgenciaFecha === 'hoy' ? 'text-orange-600' :
                          urgenciaFecha === 'mañana' ? 'text-yellow-600' :
                          'text-gray-500'
                        }`}>
                          <Calendar size={16} className="mr-1" />
                          <span>
                            {format(parseISO(task.dueDate), 'dd/MM/yyyy', { locale: es })}
                            {urgenciaFecha === 'hoy' && ' (Hoy)'}
                            {urgenciaFecha === 'mañana' && ' (Mañana)'}
                            {urgenciaFecha === 'vencida' && ' (Vencida)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setTareaEditando(task._id)}
                      className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Edit3 size={16} className="mr-1" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TareasPersonal
