
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import { useClientes } from './useClientes'
import { useTasks } from './useTasks'
import { useLlamadasProgramadas } from './useLlamadasProgramadas'
import { useServicios } from './useServicios'

interface ConfigRespaldo {
  activo: boolean
  proveedor: 'google_drive' | 'dropbox' | 'onedrive'
  frecuencia: 'diario' | 'semanal' | 'mensual'
  hora: string
  ultimoRespaldo?: string
}

export const useRespaldoAutomatico = () => {
  const [config, setConfig] = useState<ConfigRespaldo>({
    activo: false,
    proveedor: 'google_drive',
    frecuencia: 'diario',
    hora: '02:00'
  })
  const [loading, setLoading] = useState(false)
  const [respaldando, setRespaldando] = useState(false)

  const { clientes } = useClientes()
  const { tasks } = useTasks()
  const { llamadas } = useLlamadasProgramadas()
  const { servicios } = useServicios()

  // Cargar configuración
  const cargarConfiguracion = useCallback(async () => {
    try {
      const { list } = await lumi.entities.configuracion.list()
      const configRespaldo = list.find(c => c.clave === 'respaldo_automatico')
      
      if (configRespaldo) {
        const configData = JSON.parse(configRespaldo.valor)
        setConfig(configData)
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    }
  }, [])

  // Guardar configuración
  const guardarConfiguracion = async (nuevaConfig: ConfigRespaldo) => {
    setLoading(true)
    try {
      const { list } = await lumi.entities.configuracion.list()
      const configExistente = list.find(c => c.clave === 'respaldo_automatico')
      
      const configData = {
        clave: 'respaldo_automatico',
        valor: JSON.stringify(nuevaConfig),
        descripcion: 'Configuración de respaldo automático en la nube',
        categoria: 'respaldo',
        activo: nuevaConfig.activo,
        updatedAt: new Date().toISOString()
      }

      if (configExistente) {
        await lumi.entities.configuracion.update(configExistente._id, configData)
      } else {
        await lumi.entities.configuracion.create({
          ...configData,
          creator: 'admin',
          createdAt: new Date().toISOString()
        })
      }

      setConfig(nuevaConfig)
      return true
    } catch (error) {
      console.error('Error guardando configuración:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Realizar respaldo manual
  const realizarRespaldo = async () => {
    setRespaldando(true)
    try {
      const datosRespaldo = {
        fecha: new Date().toISOString(),
        clientes,
        tasks,
        llamadas,
        servicios,
        version: '1.0'
      }

      // Simular respaldo en la nube
      console.log('Respaldando datos en', config.proveedor, ':', datosRespaldo)
      
      // Actualizar fecha del último respaldo
      const nuevaConfig = {
        ...config,
        ultimoRespaldo: new Date().toISOString()
      }
      
      await guardarConfiguracion(nuevaConfig)
      return true
    } catch (error) {
      console.error('Error realizando respaldo:', error)
      return false
    } finally {
      setRespaldando(false)
    }
  }

  useEffect(() => {
    cargarConfiguracion()
  }, [cargarConfiguracion])

  return {
    config,
    loading,
    respaldando,
    guardarConfiguracion,
    realizarRespaldo
  }
}
