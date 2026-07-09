import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export const Register: React.FC = () => {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // El plan es siempre 0 (Gratuito) por defecto
    const { error: signUpError } = await signUp(email, password, 0)
    
    if (signUpError) {
      setError(signUpError.message || 'Error al registrar el usuario.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full text-center p-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--accent)' }}>¡Registro Exitoso!</h2>
        <p style={{ color: 'var(--text-2)' }}>Tu cuenta ha sido creada. Puedes iniciar sesión ahora.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Crear Cuenta</h2>
      {error && (
        <div className="p-3 rounded mb-4 text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Correo Electrónico</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded px-3 py-2 outline-none transition-colors"
            style={{ 
              background: 'var(--surface-2)', 
              border: '1px solid var(--border)', 
              color: 'var(--text)' 
            }}
            placeholder="ejemplo@correo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Contraseña</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded px-3 py-2 outline-none transition-colors"
            style={{ 
              background: 'var(--surface-2)', 
              border: '1px solid var(--border)', 
              color: 'var(--text)' 
            }}
            minLength={6}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2.5 rounded font-medium mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  )
}
