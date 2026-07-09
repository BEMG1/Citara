import { supabase } from '../services/supabase/client'

const ANON_KEY = 'apa_anon_last_gen'
const USER_KEY = 'apa_user_last_gen'

export const checkRateLimit = async (
  userId: string | undefined, 
  userType: number | undefined
): Promise<{ allowed: boolean, remainingMinutes: number }> => {
  // Plan 1: no limits (Premium)
  if (Number(userType) === 1) {
    return { allowed: true, remainingMinutes: 0 }
  }

  const baseCooldown = parseInt(import.meta.env.VITE_FREE_TIER_GENERATE_COOLDOWN_MINUTES || '5', 10)
  
  // Si no está logueado, cooldown triple
  const isAnonymous = !userId
  const cooldown = isAnonymous ? baseCooldown * 3 : baseCooldown
  const cooldownMs = cooldown * 60 * 1000

  // Seleccionar la llave correcta dependiendo de si hay sesión
  const storageKey = isAnonymous ? ANON_KEY : USER_KEY
  const localLastGeneration = localStorage.getItem(storageKey)
  
  let lastGenerationDate: Date | null = localLastGeneration ? new Date(localLastGeneration) : null

  // Fallback to Supabase if logged in but no local storage
  if (!lastGenerationDate && userId) {
    try {
      const { data, error } = await supabase
        .from('GenerateDocument')
        .select('lastGenerate')
        .eq('idusuario', userId)
        .order('lastGenerate', { ascending: false })
        .limit(1)
        .single()
      
      if (!error && data?.lastGenerate) {
        lastGenerationDate = new Date(data.lastGenerate)
        localStorage.setItem(USER_KEY, data.lastGenerate)
      }
    } catch (e) {
      console.error('Error fetching rate limit from db', e)
    }
  }

  if (lastGenerationDate) {
    const now = new Date()
    const diffMs = now.getTime() - lastGenerationDate.getTime()
    if (diffMs < cooldownMs) {
      const remainingMs = cooldownMs - diffMs
      return { allowed: false, remainingMinutes: Math.ceil(remainingMs / 60000) }
    }
  }

  return { allowed: true, remainingMinutes: 0 }
}

export const updateRateLimit = async (userId: string | undefined) => {
  const now = new Date().toISOString()
  
  const storageKey = userId ? USER_KEY : ANON_KEY
  localStorage.setItem(storageKey, now)

  if (userId) {
    try {
      // Buscar si existe un registro para actualizarlo, sino insertarlo
      const { data: existing } = await supabase
        .from('GenerateDocument')
        .select('id')
        .eq('idusuario', userId)
        .limit(1)
        .single()
        
      if (existing) {
        await supabase
          .from('GenerateDocument')
          .update({ lastGenerate: now })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('GenerateDocument')
          .insert([{ idusuario: userId, lastGenerate: now }])
      }
    } catch (e) {
      console.error('Error updating rate limit in db', e)
    }
  }
}

export const clearUserRateLimitCache = () => {
  localStorage.removeItem(USER_KEY)
}
