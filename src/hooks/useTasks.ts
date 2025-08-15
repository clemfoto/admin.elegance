
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'

export interface Task {
  _id: string
  title: string
  description?: string
  assignedTo: 'Clem' | 'Diana'
  status: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
  priority: 'baja' | 'media' | 'alta' | 'urgente'
  dueDate?: string
  clienteRelacionado?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  completedAt?: string
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { list } = await lumi.entities.tasks.list()
      setTasks(list || [])
    } catch (error: any) {
      console.error('Error al cargar tareas:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createTask = async (taskData: Omit<Task, '_id'>) => {
    try {
      const newTask = await lumi.entities.tasks.create({
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      await fetchTasks()
      return newTask
    } catch (error: any) {
      console.error('Error al crear tarea:', error)
      throw error
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (typeof taskId !== 'string') {
      throw new Error('ID de tarea debe ser un string')
    }

    try {
      const updatedTask = await lumi.entities.tasks.update(taskId, {
        ...updates,
        updatedAt: new Date().toISOString(),
        ...(updates.status === 'completada' && !updates.completedAt && {
          completedAt: new Date().toISOString()
        })
      })
      
      await fetchTasks()
      return true
    } catch (error: any) {
      console.error('Error al actualizar tarea:', error)
      return false
    }
  }

  const deleteTask = async (taskId: string) => {
    if (typeof taskId !== 'string' || taskId === '[object Object]') {
      throw new Error('ID de tarea inválido')
    }

    try {
      await lumi.entities.tasks.delete(taskId)
      await fetchTasks()
      return true
    } catch (error: any) {
      console.error('Error al eliminar tarea:', error)
      return false
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
}
