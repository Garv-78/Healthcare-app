import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, language = "en", role, phone, address, specialty, doctorLanguages } = body || {}

  // Upsert profile base fields
  const { error: upsertErr } = await supabase
    .from("profiles")
    .upsert({ id: user.id, name: name ?? null, language, role: role ?? undefined, phone: phone ?? null })

  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 400 })

  // Persist address in auth user metadata (since profiles.address column may not exist)
  if (typeof address === "string" && address.trim().length > 0) {
    const { error: metaErr } = await supabase.auth.updateUser({ data: { address } })
    if (metaErr) return NextResponse.json({ error: metaErr.message }, { status: 400 })
  }

  // If registering/updating as doctor, upsert doctor fields
  if (role === "doctor" || specialty || doctorLanguages) {
    const { error: docErr } = await supabase
      .from("doctors")
      .upsert({ id: user.id, specialty: specialty ?? null, languages: Array.isArray(doctorLanguages) ? doctorLanguages : undefined })
    if (docErr) return NextResponse.json({ error: docErr.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
