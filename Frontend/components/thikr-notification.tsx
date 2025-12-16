"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sparkles } from "lucide-react"

const THIKR_LIST = [
  { arabic: "أستغفر الله", transliteration: "Astaghfirullah" },
  { arabic: "سبحان الله", transliteration: "SubhanAllah" },
  { arabic: "الحمد لله", transliteration: "Alhamdulillah" },
  { arabic: "الله أكبر", transliteration: "Allahu Akbar" },
  { arabic: "لا إله إلا الله", transliteration: "La ilaha illa Allah" },
  { arabic: "حسبي الله ونعم الوكيل", transliteration: "Hasbiya Allah wa ni'ma al-wakil" },
  { arabic: "لا حول ولا قوة إلا بالله", transliteration: "La hawla wa la quwwata illa billah" },
  { arabic: "اللهم صل على محمد", transliteration: "Allahumma salli ala Muhammad" },
]

export default function ThikrNotification() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [currentThikr, setCurrentThikr] = useState(0)

  // Don't show on admin pages
  const isAdmin = pathname.startsWith('/admin')
  
  useEffect(() => {
    if (isAdmin) return
    // Show first notification after a short delay
    const initialTimeout = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => {
        setIsVisible(false)
        // Change to next thikr AFTER the fade-out transition completes
        setTimeout(() => {
          setCurrentThikr((prev) => (prev + 1) % THIKR_LIST.length)
        }, 1000)
      }, 2000)
    }, 2000)

    // Show notification every 20 seconds
    const intervalId = setInterval(() => {
      setIsVisible(true)
      
      // Hide after 2 seconds
      setTimeout(() => {
        setIsVisible(false)
        // Change to next thikr AFTER the fade-out transition completes (1000ms)
        setTimeout(() => {
          setCurrentThikr((prev) => (prev + 1) % THIKR_LIST.length)
        }, 1000)
      }, 2000)
    }, 20000) // 20000ms = 20 seconds

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
    }
  }, [])

  // Don't render on admin pages
  if (isAdmin) return null

  const thikr = THIKR_LIST[currentThikr]

  return (
    <div 
      className={`fixed top-28 right-4 z-[9999] transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-x-0 scale-100' 
          : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
      }`}
      style={{
        transitionTimingFunction: isVisible 
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
          : 'cubic-bezier(0.4, 0, 1, 1)'
      }}
    >
      <div className="relative">
        {/* Animated glow */}
        <div 
          className={`absolute -inset-1 bg-gradient-to-r from-[#556B2F]/30 via-[#D6A64F]/30 to-[#556B2F]/30 rounded-xl blur-md transition-opacity duration-1000 ${
            isVisible ? 'opacity-60' : 'opacity-0'
          }`} 
        />
        
        {/* Main notification card */}
        <div className={`relative bg-gradient-to-br from-white via-[#FFFEF9] to-white backdrop-blur-sm border border-[#D6A64F]/30 rounded-xl px-3 py-2.5 shadow-xl transition-all duration-700 ${
          isVisible ? 'shadow-[#D6A64F]/20' : 'shadow-transparent'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`transition-all duration-500 ${isVisible ? 'rotate-0 scale-100' : 'rotate-45 scale-0'}`}>
              <Sparkles className="w-4 h-4 text-[#D6A64F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-lg font-bold text-[#556B2F] font-arabic leading-tight transition-all duration-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`} dir="rtl">
                {thikr.arabic}
              </p>
              <p className={`text-xs text-[#D6A64F] font-medium transition-all duration-500 delay-100 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}>
                {thikr.transliteration}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
