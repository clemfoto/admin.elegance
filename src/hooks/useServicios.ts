
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'

export interface Servicio {
  _id: string
  nombre: string
  descripcion?: string
  categoria: 'fotografia' | 'video' | 'album' | 'paquetes' | 'extras'
  precio: number
  duracion?: string
  incluye?: string[]
  activo: boolean
  imagenes?: string[]
  createdAt?: string
  updatedAt?: string
}

export const useServicios = () => {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(false)

  const fetchServicios = useCallback(async () => {
    setLoading(true)
    try {
      const { list } = await lumi.entities.servicios.list()
      setServicios(list || [])
    } catch (error: any) {
      console.error('Error al cargar servicios:', error)
      setServicios([])
    } finally {
      setLoading(false)
    }
  }, [])

  const crearServicio = async (servicioData: Omit<Servicio, '_id'>) => {
    try {
      const nuevoServicio = await lumi.entities.servicios.create({
        ...servicioData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      await fetchServicios()
      return nuevoServicio
    } catch (error: any) {
      console.error('Error al crear servicio:', error)
      throw error
    }
  }

  const actualizarServicio = async (servicioId: string, updates: Partial<Servicio>) => {
    if (typeof servicioId !== 'string') {
      throw new Error('ID del servicio debe ser un string')
    }

    try {
      const servicioActualizado = await lumi.entities.servicios.update(servicioId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      await fetchServicios()
      return servicioActualizado
    } catch (error: any) {
      console.error('Error al actualizar servicio:', error)
      throw error
    }
  }

  const eliminarServicio = async (servicioId: string) => {
    if (typeof servicioId !== 'string' || servicioId === '[object Object]') {
      throw new Error('ID del servicio inválido')
    }

    try {
      await lumi.entities.servicios.delete(servicioId)
      await fetchServicios()
    } catch (error: any) {
      console.error('Error al eliminar servicio:', error)
      throw error
    }
  }

  const filtrarPorCategoria = (categoria: string) => {
    if (categoria === 'todos') return servicios
    return servicios.filter(servicio => servicio.categoria === categoria)
  }

  const obtenerServiciosActivos = () => {
    return servicios.filter(servicio => servicio.activo)
  }

  useEffect(() => {
    fetchServicios()
  }, [fetchServicios])

  return {
    servicios,
    loading,
    fetchServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    filtrarPorCategoria,
    obtenerServiciosActivos
  }
}
