import { useEffect, useState } from 'react'

import { type ISODate, toISODate } from '@/lib/dates'

const CHECK_INTERVAL_MS = 60_000

/**
 * Today's date, kept up to date if the app stays open past midnight or is
 * brought back from the background on another day.
 */
export function useToday(): ISODate {
  const [today, setToday] = useState(() => toISODate(new Date()))

  useEffect(() => {
    const refresh = () => {
      setToday(toISODate(new Date()))
    }
    const interval = window.setInterval(refresh, CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return today
}
