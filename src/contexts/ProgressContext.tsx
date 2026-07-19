import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabaseClient'

interface ProgressContextType {
  xp: number
  streakDays: number
  totalStudyMinutes: number
  todayStudyMinutes: number
  sessionSeconds: number
  rank: number
  totalUsers: number
  addXp: (amount: number) => Promise<void>
  syncCloud: () => Promise<void>
  showLevelUp: boolean
  setShowLevelUp: (show: boolean) => void
  currentLevelName: string
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

// Level thresholds: XP required to reach each level (8 Milestones)
const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, name: 'Anfänger', medicalName: 'Pre-med Student' },
  { level: 2, minXp: 100, name: 'Novize', medicalName: 'Medical Student' },
  { level: 3, minXp: 300, name: 'Lernender', medicalName: 'Cardiology Intern' },
  { level: 4, minXp: 600, name: 'Fortgeschrittener', medicalName: 'Cardiology Resident' },
  { level: 5, minXp: 1000, name: 'Kenner', medicalName: 'Cardiology Fellow' },
  { level: 6, minXp: 1500, name: 'Könner', medicalName: 'Cardiology Specialist' },
  { level: 7, minXp: 2100, name: 'Experte', medicalName: 'Attending Cardiologist' },
  { level: 8, minXp: 2800, name: 'Großmeister', medicalName: 'Chief of Cardiology' }
]

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [xp, setXp] = useState<number>(() => {
    return parseFloat(localStorage.getItem('riefy_xp') || '0')
  })
  const [streakDays, setStreakDays] = useState<number>(() => {
    return parseInt(localStorage.getItem('riefy_streak') || '0')
  })
  const [totalStudyMinutes, setTotalStudyMinutes] = useState<number>(() => {
    return parseInt(localStorage.getItem('riefy_study_minutes') || '0')
  })
  const [todayStudyMinutes, setTodayStudyMinutes] = useState<number>(0)
  const [sessionSeconds, setSessionSeconds] = useState<number>(0)
  const [rank, setRank] = useState<number>(1)
  const [totalUsers, setTotalUsers] = useState<number>(1)
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false)
  
  // Track active mode to dynamically switch level names
  const [activeMode, setActiveMode] = useState(() => localStorage.getItem('riefy_curr_mode') || 'language')
  const [currentLevelName, setCurrentLevelName] = useState<string>('Anfänger')

  const userRef = useRef(user)
  userRef.current = user

  const xpRef = useRef(xp)
  xpRef.current = xp

  const streakDaysRef = useRef(streakDays)
  streakDaysRef.current = streakDays

  const totalStudyMinutesRef = useRef(totalStudyMinutes)
  totalStudyMinutesRef.current = totalStudyMinutes

  // Compute Level details dynamically
  const getLevelName = (xpVal: number, mode: string) => {
    const matched = [...LEVEL_THRESHOLDS].reverse().find(t => xpVal >= t.minXp)
    if (!matched) return mode === 'medical' ? 'Pre-med Student' : 'Anfänger'
    return mode === 'medical' ? matched.medicalName : matched.name
  }

  // Listen to mode switches to update badge labels instantly
  useEffect(() => {
    const handleModeChange = () => {
      const currentMode = localStorage.getItem('riefy_curr_mode') || 'language'
      setActiveMode(currentMode)
      setCurrentLevelName(getLevelName(xp, currentMode))
    }
    window.addEventListener('riefy_mode_change', handleModeChange)
    return () => {
      window.removeEventListener('riefy_mode_change', handleModeChange)
    }
  }, [xp])

  useEffect(() => {
    setCurrentLevelName(getLevelName(xp, activeMode))
  }, [xp, activeMode])

  // Streak checking
  useEffect(() => {
    const checkStreak = () => {
      const todayStr = new Date().toDateString()
      const lastStudyStr = localStorage.getItem('riefy_last_study_date')

      if (!lastStudyStr) {
        // First study session
        return
      }

      const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastStudyStr).getTime())
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day
        // Will be updated when user gets XP or logs in
      } else if (diffDays > 1) {
        // Streak lost
        setStreakDays(0)
        localStorage.setItem('riefy_streak', '0')
      }
    }
    checkStreak()
  }, [])

  // Sync with Supabase (wrapped in useCallback and uses refs to prevent stale closures)
  const syncCloud = useCallback(async () => {
    const currentUser = userRef.current
    if (!currentUser) return

    try {
      // 1. Fetch current cloud progress
      const { data: cloudData, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching progress:', fetchError)
        return
      }

      let targetXp = xpRef.current
      let targetStreak = streakDaysRef.current
      let targetMinutes = totalStudyMinutesRef.current
      const todayDateStr = new Date().toISOString().split('T')[0]

      if (cloudData) {
        // Merge strategy: choose maximum values to avoid progress loss
        targetXp = Math.max(xpRef.current, cloudData.xp || 0)
        targetStreak = Math.max(streakDaysRef.current, cloudData.streak_days || 0)
        targetMinutes = Math.max(totalStudyMinutesRef.current, cloudData.total_study_minutes || 0)

        // If cloud had more progress, sync it locally
        if (targetXp > xpRef.current || targetStreak > streakDaysRef.current || targetMinutes > totalStudyMinutesRef.current) {
          setXp(targetXp)
          setStreakDays(targetStreak)
          setTotalStudyMinutes(targetMinutes)
          localStorage.setItem('riefy_xp', String(targetXp))
          localStorage.setItem('riefy_streak', String(targetStreak))
          localStorage.setItem('riefy_study_minutes', String(targetMinutes))
        }
      }

      // 2. Push merged progress to cloud
      await supabase.from('user_progress').upsert({
        user_id: currentUser.id,
        xp: targetXp,
        streak_days: targetStreak,
        total_study_minutes: targetMinutes,
        last_study_date: todayDateStr,
        updated_at: new Date().toISOString()
      })

      // 3. Fetch current rank
      const { data: rankData, error: rankError } = await supabase
        .rpc('get_user_rank', { target_user_id: currentUser.id })

      if (!rankError && rankData) {
        setRank(rankData.rank || 1)
        setTotalUsers(rankData.total_users || 1)
      }
    } catch (e) {
      console.warn('Network sync failed. Progress will keep saving locally.', e)
    }
  }, [])

  // Handle Auth Changes
  useEffect(() => {
    if (user) {
      syncCloud()
    }
  }, [user, syncCloud])

  // Active Session Study Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => {
        const next = prev + 1
        // Every 60 seconds, increment study minutes
        if (next % 60 === 0) {
          setTotalStudyMinutes(m => {
            const val = m + 1
            localStorage.setItem('riefy_study_minutes', String(val))
            return val
          })
          setTodayStudyMinutes(m => m + 1)
          // Autosave/sync study minutes every minute, deferred to avoid state updates during render
          setTimeout(() => {
            syncCloud()
          }, 0)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [syncCloud])

  // Reward XP function
  const addXp = async (amount: number) => {
    if (amount <= 0) return

    const currentXp = xpRef.current
    const previousLevel = [...LEVEL_THRESHOLDS].reverse().find(t => currentXp >= t.minXp)?.level || 1
    const nextXp = currentXp + amount

    setXp(nextXp)
    localStorage.setItem('riefy_xp', String(nextXp))

    // Update study date and streak
    const todayStr = new Date().toDateString()
    const lastStudyStr = localStorage.getItem('riefy_last_study_date')
    let nextStreak = streakDaysRef.current

    if (lastStudyStr !== todayStr) {
      if (lastStudyStr) {
        const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastStudyStr).getTime())
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          nextStreak = streakDaysRef.current + 1
        } else {
          nextStreak = 1
        }
      } else {
        nextStreak = 1
      }
      setStreakDays(nextStreak)
      localStorage.setItem('riefy_streak', String(nextStreak))
      localStorage.setItem('riefy_last_study_date', todayStr)
    }

    // Check Level Up
    const newLevel = [...LEVEL_THRESHOLDS].reverse().find(t => nextXp >= t.minXp)?.level || 1
    if (newLevel > previousLevel) {
      setShowLevelUp(true)
    }

    // Push update to cloud if logged in
    const currentUser = userRef.current
    if (currentUser) {
      try {
        await supabase.from('user_progress').upsert({
          user_id: currentUser.id,
          xp: nextXp,
          streak_days: nextStreak,
          total_study_minutes: totalStudyMinutesRef.current,
          last_study_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })

        const { data: rankData } = await supabase.rpc('get_user_rank', { target_user_id: currentUser.id })
        if (rankData) {
          setRank(rankData.rank || 1)
          setTotalUsers(rankData.total_users || 1)
        }
      } catch (e) {
        console.warn('Failed syncing XP to database.', e)
      }
    }
  }

  return (
    <ProgressContext.Provider value={{
      xp,
      streakDays,
      totalStudyMinutes,
      todayStudyMinutes,
      sessionSeconds,
      rank,
      totalUsers,
      addXp,
      syncCloud,
      showLevelUp,
      setShowLevelUp,
      currentLevelName
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
