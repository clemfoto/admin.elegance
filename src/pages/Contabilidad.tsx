
import React, { useState, useEffect } from 'react'
import { useContabilidad } from '../hooks/useContabilidad'
import { Lock, DollarSign, TrendingUp, TrendingDown, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const Contabilidad: React.FC = () => {
  const {
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
    cerrarSesion
  } = useContabilidad()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [intentoFallido, setIntentoFallido] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    concepto: '',
    monto: 0,
    categoria: 'materiales',
    tipo: 'gasto' as 'ingreso' | 'gasto',
    recurrente: false,
    notas: ''
  })

  const resumen = calcularResumen()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await verificarPassword(password)
    
    if (success) {
      setIntentoFallido(false)
      setPassword('')
    } else {
      setIntentoFallido(true)
      setTimeout(() => setIntentoFallido(false), 3000)
    }
  }

  const handleAgregarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const movimiento = {
      ...nuevoMovimiento,
      fecha: new Date().toISOString(),
      mes: mesSeleccionado
    }

    const success = await agregarMovimiento(movimiento)
    if (success) {
      setNuevoMovimiento({
        concepto: '',
        monto: 0,
        categoria: 'materiales',
        tipo: 'gasto',
        recurrente: false,
        notas: ''
      })
      setShowForm(false)
    }
  }

  const categorias = [
    { value: 'servicios', label: 'Servicios' },
    { value: 'materiales', label: 'Materiales' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'personal', label: 'Personal' },
    { value: 'otros', label: 'Otros' },
    { value: 'ingresos', label: 'Ingresos' }
  ]

  // Pantalla de login
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Acceso a Contabilidad</h1>
            <p className="text-gray-600 mt-2">Área restringida - Solo administrador</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                    intentoFallido ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa la contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {intentoFallido && (
                <p className="text-red-600 text-sm mt-1">Contraseña incorrecta</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Acceder
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Nota:</strong> Solo el administrador puede acceder a esta sección.
              Contraseña por defecto: admin123
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Panel de contabilidad
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contabilidad</h1>
          <p className="text-gray-600">Gestión de ingresos y gastos mensuales</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={cerrarSesion}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Resumen mensual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Ingresos</p>
              <p className="text-2xl font-bold text-green-700">
                ${resumen.totalIngresos.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Gastos</p>
              <p className="text-2xl font-bold text-red-700">
                ${resumen.totalGastos.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="text-red-600" size={32} />
          </div>
        </div>

        <div className={`${resumen.ganancia >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${resumen.ganancia >= 0 ? 'text-blue-600' : 'text-orange-600'} text-sm font-medium`}>
                {resumen.ganancia >= 0 ? 'Ganancia' : 'Pérdida'}
              </p>
              <p className={`text-2xl font-bold ${resumen.ganancia >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ${Math.abs(resumen.ganancia).toLocaleString()}
              </p>
            </div>
            <DollarSign className={`${resumen.ganancia >= 0 ? 'text-blue-600' : 'text-orange-600'}`} size={32} />
          </div>
        </div>
      </div>

      {/* Botón agregar */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          Agregar Movimiento
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Nuevo Movimiento</h3>
          <form onSubmit={handleAgregarMovimiento} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto
                </label>
                <input
                  type="text"
                  value={nuevoMovimiento.concepto}
                  onChange={(e) => setNuevoMovimiento(prev => ({ ...prev, concepto: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  value={nuevoMovimiento.monto}
                  onChange={(e) => setNuevoMovimiento(prev => ({ ...prev, monto: Number(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={nuevoMovimiento.tipo}
                  onChange={(e) => setNuevoMovimiento(prev => ({ ...prev, tipo: e.target.value as 'ingreso' | 'gasto' }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={nuevoMovimiento.categoria}
                  onChange={(e) => setNuevoMovimiento(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={nuevoMovimiento.notas}
                onChange={(e) => setNuevoMovimiento(prev => ({ ...prev, notas: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={nuevoMovimiento.recurrente}
                onChange={(e) => setNuevoMovimiento(prev => ({ ...prev, recurrente: e.target.checked }))}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Movimiento recurrente mensual</label>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de movimientos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Movimientos de {format(new Date(mesSeleccionado + '-01'), 'MMMM yyyy', { locale: es })}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">Cargando movimientos...</div>
        ) : movimientos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay movimientos registrados para este mes
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movimientos.map((movimiento) => (
                  <tr key={movimiento._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(parseISO(movimiento.fecha), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{movimiento.concepto}</div>
                        {movimiento.notas && (
                          <div className="text-gray-500 text-xs">{movimiento.notas}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categorias.find(c => c.value === movimiento.categoria)?.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        movimiento.tipo === 'ingreso' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                        ${movimiento.monto.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditando(movimiento._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => eliminarMovimiento(movimiento._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Contabilidad
