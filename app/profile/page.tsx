"use client"
import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import dynamic from "next/dynamic"

const Patient = dynamic(() => import("../(patient)/profile/page"), { ssr: false })
const Doctor = dynamic(() => import("../(doctor)/profile/page"), { ssr: false })

export default function ProfileRouterPage() {
  const supabase = createSupabaseBrowserClient()
  const [role, setRole] = useState<"patient" | "doctor" | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const uid = userRes.user?.id
      if (!uid) return setRole(null)
      const metaRole = (userRes.user?.user_metadata as any)?.role as string | undefined
      if (metaRole === "doctor" || metaRole === "patient") return setRole(metaRole)
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", uid).single()
      const dbRole = (prof?.role as string) || "patient"
      setRole(dbRole === "doctor" ? "doctor" : "patient")
    }
    load()
  }, [])

  if (!role) return null
  return role === "doctor" ? <Doctor /> : <Patient />
}

