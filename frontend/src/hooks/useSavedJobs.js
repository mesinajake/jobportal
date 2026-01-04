import { useEffect, useState } from 'react'

export default function useSavedJobs() {
  const [saved, setSaved] = useState(() => {
    try {
      const s = localStorage.getItem('savedJobs')
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('savedJobs', JSON.stringify(saved)) } catch {}
  }, [saved])

  const toggle = (slug) => {
    setSaved(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])
  }

  return { saved, toggle }
}
