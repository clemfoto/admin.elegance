
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import { format, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export interface Cliente {
  _id: string
  nombres: string
  email?: string
  telefono?: string
  fechaBoda: string
  ciudad: string
  venue: string
  servicio: 'fotografia' | 'video' | 'fotografia_video' | 'album' | 'paquete_completo'
  formaPago: 'efectivo' | 'transferencia' | 'tarjeta' | 'financiado' | 'mixto'
  montoTotal?: number
  montoAbonado?: number
  estado: 'potencial' | 'confirmado' | 'en_proceso' | 'completado' | 'cancelado'
  solicitudesEspeciales?: string
  archivoExcel?: string
  notas?: string
  detallesPago?: {
    cuotas: Array<{
      numero: number
      monto: number
      fechaPago: string
      estado: 'pendiente' | 'pagado' | 'vencido'
      metodoPago: string
      concepto: string
    }>
    descuentos?: Array<{
      concepto: string
      monto: number
      aplicado: boolean
    }>
  }
  recordatorios?: Array<{
    fecha: string
    tipo: string
    mensaje: string
  }>
  createdAt?: string
  updatedAt?: string
}

export interface AlertaFecha {
  fecha: string
  clientes: Cliente[]
  tipo: 'mismo_dia' | 'misma_semana'
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [alertasFechas, setAlertasFechas] = useState<AlertaFecha[]>([])
  const [sdkReady, setSdkReady] = useState(false)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    try {
      const { list } = await lumi.entities.clientes.list()
      setClientes(list || [])
      detectarAlertasFechas(list || [])
      setSdkReady(true)
    } catch (error: any) {
      console.error('Error al cargar clientes:', error)
      // Usar datos mock si el SDK falla
      setClientes([])
      setSdkReady(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const detectarAlertasFechas = (clientesList: Cliente[]) => {
    const alertas: AlertaFecha[] = []
    const fechasMap = new Map<string, Cliente[]>()

    clientesList.forEach(cliente => {
      if (cliente.fechaBoda) {
        const fecha = format(parseISO(cliente.fechaBoda), 'yyyy-MM-dd')
        if (!fechasMap.has(fecha)) {
          fechasMap.set(fecha, [])
        }
        fechasMap.get(fecha)!.push(cliente)
      }
    })

    fechasMap.forEach((clientesEnFecha, fecha) => {
      if (clientesEnFecha.length > 1) {
        alertas.push({
          fecha,
          clientes: clientesEnFecha,
          tipo: 'mismo_dia'
        })
      }
    })

    setAlertasFechas(alertas)
  }

  const crearCliente = async (clienteData: Omit<Cliente, '_id'>) => {
    try {
      const nuevoCliente = await lumi.entities.clientes.create({
        ...clienteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      await fetchClientes()
      return nuevoCliente
    } catch (error: any) {
      console.error('Error al crear cliente:', error)
      throw error
    }
  }

  const actualizarCliente = async (clienteId: string, updates: Partial<Cliente>) => {
    if (typeof clienteId !== 'string') {
      throw new Error('ID del cliente debe ser un string')
    }

    try {
      const clienteActualizado = await lumi.entities.clientes.update(clienteId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      await fetchClientes()
      return clienteActualizado
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error)
      throw error
    }
  }

  const eliminarCliente = async (clienteId: string) => {
    if (typeof clienteId !== 'string' || clienteId === '[object Object]') {
      throw new Error('ID del cliente inválido')
    }

    try {
      await lumi.entities.clientes.delete(clienteId)
      await fetchClientes()
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error)
      throw error
    }
  }

  const buscarClientes = (termino: string) => {
    if (!termino.trim()) return clientes

    return clientes.filter(cliente => 
      cliente.nombres.toLowerCase().includes(termino.toLowerCase()) ||
      cliente.ciudad.toLowerCase().includes(termino.toLowerCase()) ||
      cliente.venue.toLowerCase().includes(termino.toLowerCase()) ||
      (cliente.email && cliente.email.toLowerCase().includes(termino.toLowerCase()))
    )
  }

  const filtrarPorEstado = (estado: string) => {
    if (estado === 'todos') return clientes
    return clientes.filter(cliente => cliente.estado === estado)
  }

  const obtenerClientesPorFecha = (fecha: Date) => {
    return clientes.filter(cliente => 
      cliente.fechaBoda && isSameDay(parseISO(cliente.fechaBoda), fecha)
    )
  }

  const obtenerEstadisticas = () => {
    const total = clientes.length
    const confirmados = clientes.filter(c => c.estado === 'confirmado').length
    const potenciales = clientes.filter(c => c.estado === 'potencial').length
    const enProceso = clientes.filter(c => c.estado === 'en_proceso').length
    const completados = clientes.filter(c => c.estado === 'completado').length

    const ingresosTotales = clientes
      .filter(c => c.montoTotal)
      .reduce((sum, c) => sum + (c.montoTotal || 0), 0)

    const ingresosAbonados = clientes
      .filter(c => c.montoAbonado)
      .reduce((sum, c) => sum + (c.montoAbonado || 0), 0)

    return {
      total,
      confirmados,
      potenciales,
      enProceso,
      completados,
      ingresosTotales,
      ingresosAbonados,
      ingresosPendientes: ingresosTotales - ingresosAbonados
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  return {
    clientes,
    loading,
    alertasFechas,
    sdkReady,
    fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
    filtrarPorEstado,
    obtenerClientesPorFecha,
    obtenerEstadisticas
  }
}
