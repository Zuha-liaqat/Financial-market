import { useEffect, useRef, useState } from 'react'
import MarketingHeader from './MarketingHeader'
import MarketingFooter from './MarketingFooter'
import './marketing.css'

export default function MarketingPage({ active = 'home', children }) {
  const containerRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return undefined
    const els = root.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [children])

  function handleScroll(e) {
    const el = e.currentTarget
    const height = el.scrollHeight - el.clientHeight
    setProgress(height > 0 ? (el.scrollTop / height) * 100 : 0)
  }

  return (
    <div className="fm-home" ref={containerRef} onScroll={handleScroll}>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />

      <MarketingHeader active={active} />

      {children}

      <MarketingFooter />
    </div>
  )
}
