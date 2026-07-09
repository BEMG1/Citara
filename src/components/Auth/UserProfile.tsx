import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { clearUserRateLimitCache } from '../../utils/rateLimit'
import toast from 'react-hot-toast'

interface UserProfileProps {
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, profile, signOut } = useAuth()

  if (!user) {
    return null
  }

  const getPlanName = (type?: number | string) => {
    if (Number(type) === 1) return 'Premium'
    return 'Gratuito'
  }

  const handleSignOut = async () => {
    await signOut();
    clearUserRateLimitCache();
    toast.success("Sesión cerrada exitosamente");
    if (onClose) onClose();
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Perfil de Usuario</h2>
      
      <div className="mb-4">
        <p className="text-sm mb-1 font-medium" style={{ color: 'var(--text-2)' }}>Correo</p>
        <p className="font-medium px-3 py-2 rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          {user.email}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm mb-1 font-medium" style={{ color: 'var(--text-2)' }}>Plan Actual</p>
        <span 
          className="inline-block px-3 py-1 rounded text-sm font-semibold mt-1"
          style={{ 
            background: Number(profile?.userType) === 1 ? 'var(--accent)' : 'var(--surface-3)', 
            color: Number(profile?.userType) === 1 ? 'var(--bg)' : 'var(--text)' 
          }}
        >
          {getPlanName(profile?.userType)}
        </span>
      </div>

      <button 
        onClick={handleSignOut}
        className="w-full mt-2 py-2.5 rounded font-medium transition-opacity hover:opacity-90"
        style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#ef4444', 
          border: '1px solid rgba(239, 68, 68, 0.2)' 
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  )
}
