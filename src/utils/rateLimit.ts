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
        .from('users')
        .select('last_generation')
        .eq('id', userId)
        .limit(1)
        .single()
      
      if (!error && data?.last_generation) {
        lastGenerationDate = new Date(data.last_generation)
        localStorage.setItem(USER_KEY, data.last_generation)
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
      const { error } = await supabase
        .from('users')
        .update({ last_generation: now })
        .eq('id', userId)
        
      if (error) {
        console.error('Supabase error updating rate limit:', error)
      } else {
        console.log('Successfully updated last_generation in DB to', now)
      }
    } catch (e) {
      console.error('Exception updating rate limit in db', e)
    }
  }
}

export const clearUserRateLimitCache = () => {
  localStorage.removeItem(USER_KEY)
}
