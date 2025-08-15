
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface MovimientoContable {
  _id: string
  concepto: string
  monto: number
  categoria: string
  fecha: string
  tipo: 'ingreso' | 'gasto'
  recurrente: boolean
  mes: string
  notas?: string
  createdAt: string
  updatedAt: string
}

interface ResumenMensual {
  mes: string
  totalIngresos: number
  totalGastos: number
  ganancia: number
  movimientos: MovimientoContable[]
}

export const useContabilidad = () => {
  const [movimientos, setMovimientos] = useState<MovimientoContable[]>([])
  const [loading, setLoading] = useState(false)
  const [autenticado, setAutenticado] = useState(false)
  const [mesSeleccionado, setMesSeleccionado] = useState(format(new Date(), 'yyyy-MM'))

  // Verificar autenticación
  const verificarPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { list } = await lumi.entities.configuracion.list()
      const config = list.find(c => c.clave === 'contabilidad_password')
      
      if (config) {
        const configData = JSON.parse(config.valor)
        if (configData.hash === password) {
          setAutenticado(true)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error verificando contraseña:', error)
      return false
    }
  }, [])

  // Cargar movimientos del mes
  const cargarMovimientos = useCallback(async () => {
    if (!autenticado) return

    setLoading(true)
    try {
      const { list } = await lumi.entities.gastos.list()
      const movimientosMes = list.filter(m => m.mes === mesSeleccionado)
      setMovimientos(movimientosMes)
    } catch (error) {
      console.error('Error cargando movimientos:', error)
    } finally {
      setLoading(false)
    }
  }, [autenticado, mesSeleccionado])

  // Agregar movimiento
  const agregarMovimiento = async (movimiento: Omit<MovimientoContable, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const nuevoMovimiento = {
        ...movimiento,
        creator: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await lumi.entities.gastos.create(nuevoMovimiento)
      await cargarMovimientos()
      return true
    } catch (error) {
      console.error('Error agregando movimiento:', error)
      return false
    }
  }

  // Actualizar movimiento
  const actualizarMovimiento = async (id: string, cambios: Partial<MovimientoContable>) => {
    try {
      await lumi.entities.gastos.update(id, {
        ...cambios,
        updatedAt: new Date().toISOString()
      })
      await cargarMovimientos()
      return true
    } catch (error) {
      console.error('Error actualizando movimiento:', error)
      return false
    }
  }

  // Eliminar movimiento
  const eliminarMovimiento = async (id: string) => {
    try {
      await lumi.entities.gastos.delete(id)
      await cargarMovimientos()
      return true
    } catch (error) {
      console.error('Error eliminando movimiento:', error)
      return false
    }
  }

  // Calcular resumen mensual
  const calcularResumen = useCallback((): ResumenMensual => {
    const ingresos = movimientos.filter(m => m.tipo === 'ingreso')
    const gastos = movimientos.filter(m => m.tipo === 'gasto')
    
    const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0)
    const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0)
    
    return {
      mes: mesSeleccionado,
      totalIngresos,
      totalGastos,
      ganancia: totalIngresos - totalGastos,
      movimientos
    }
  }, [movimientos, mesSeleccionado])

  useEffect(() => {
    cargarMovimientos()
  }, [cargarMovimientos])

  return {
    movimientos,
    loading,
    autenticado,
    mesSeleccionado,
    setMesSeleccionado,
    verificarPassword,
    agregarMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
    calcularResumen,
    cerrarSesion: () => setAutenticado(false)
  }
}
