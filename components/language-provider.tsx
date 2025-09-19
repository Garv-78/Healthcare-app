"use client"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { type Language, getMergedTranslations } from "@/lib/translations"

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: ReturnType<typeof getMergedTranslations>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem("hc_lang")) as Language | null
    if (saved) setLanguageState(saved)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try { window.localStorage.setItem("hc_lang", lang) } catch {}
  }

  const t = useMemo(() => getMergedTranslations(language), [language])

  const value: LanguageContextValue = { language, setLanguage, t }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
