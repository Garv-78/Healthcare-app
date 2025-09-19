"use client"
import { useEffect, useMemo, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function DoctorProfilePage() {
  const supabase = createSupabaseBrowserClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("en")
  const [address, setAddress] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [doctorLanguages, setDoctorLanguages] = useState<string>("")
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
        const { data: doc } = await supabase.from("doctors").select("specialty, languages").eq("id", uid).single()
        setSpecialty(doc?.specialty || "")
        setDoctorLanguages(Array.isArray(doc?.languages) ? (doc!.languages as string[]).join(", ") : "")
      }
      setLoading(false)
    }
    load()
  }, [])

  const totalFields = 6
  const completed = [name, phone, language, address, specialty, doctorLanguages].filter((v) => !!v && String(v).trim().length > 0).length
  const progress = useMemo(() => Math.round((completed / totalFields) * 100), [completed])

  const save = async () => {
    try {
      setSaving(true)
      setStatus(null)
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, language, role: "doctor", address, specialty, doctorLanguages: doctorLanguages.split(",").map((s) => s.trim()).filter(Boolean) }),
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
            <CardTitle>Doctor Profile</CardTitle>
            <CardDescription>Complete your profile to be discoverable and accept bookings</CardDescription>
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
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Clinic address" />
            </div>
            <div>
              <label className="block text-sm">Specialty</label>
              <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g., General Medicine" />
            </div>
            <div>
              <label className="block text-sm">Languages you speak</label>
              <Input value={doctorLanguages} onChange={(e) => setDoctorLanguages(e.target.value)} placeholder="Comma separated, e.g., en, hi, pa" />
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

