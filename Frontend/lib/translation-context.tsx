"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Language, type Translations } from './translations'

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  format: (template: string, values: Record<string, string | number>) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'silea_language'

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
      if (savedLang && (savedLang === 'en' || savedLang === 'fr' || savedLang === 'ar')) {
        setLanguageState(savedLang)
      } else {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0]
        if (browserLang === 'fr' || browserLang === 'ar') {
          setLanguageState(browserLang)
        }
      }
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
      // Update HTML lang attribute
      document.documentElement.lang = lang
      // Update dir attribute for RTL
      if (lang === 'ar') {
        document.documentElement.dir = 'rtl'
      } else {
        document.documentElement.dir = 'ltr'
      }
    }
  }

  // Update HTML attributes when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language
      if (language === 'ar') {
        document.documentElement.dir = 'rtl'
      } else {
        document.documentElement.dir = 'ltr'
      }
    }
  }, [language])

  // Format template strings with values
  const format = (template: string, values: Record<string, string | number>): string => {
    let result = template
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
    })
    return result
  }

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        format,
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

