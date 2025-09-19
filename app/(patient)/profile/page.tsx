"use client"
import { useEffect, useMemo, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function PatientProfilePage() {
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("en")
  const [address, setAddress] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: userRes } = await supabase.auth.getUser()
      const uid = userRes.user?.id
      const addr = (userRes.user?.user_metadata as any)?.address || ""
      if (uid) {
        const { data: prof } = await supabase.from("profiles").select("name, phone, language").eq("id", uid).single()
        setName(prof?.name || "")
        setPhone(prof?.phone || "")
        setLanguage((prof?.language as string) || "en")
        setAddress(addr)
      }
      setLoading(false)
    }
    load()
  }, [])

  const totalFields = 4
  const completed = [name, phone, language, address].filter((v) => !!v && String(v).trim().length > 0).length
  const progress = useMemo(() => Math.round((completed / totalFields) * 100), [completed])

  const save = async () => {
    try {
      setSaving(true)
      setStatus(null)
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, language, role: "patient", address }),
      })
      setStatus("Saved")
    } catch (e: any) {
      setStatus(e?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Patient Profile</CardTitle>
            <CardDescription>Complete your profile to book appointments faster</CardDescription>
            <div className="mt-4">
              <Progress value={progress} />
              <div className="mt-2 text-sm text-muted-foreground">{progress}% complete</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +919876543210" />
            </div>
            <div>
              <label className="block text-sm">Preferred language</label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en | hi | pa" />
            </div>
            <div>
              <label className="block text-sm">Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House No, Street, City" />
            </div>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
            <div className="pt-2">
              <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

