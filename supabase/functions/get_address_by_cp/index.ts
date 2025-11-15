import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Hello from get_address_by_cp!')

const supabase = createClient(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get('SUPABASE_URL') ?? '',
  // Supabase API ANON KEY - env var exported by default when deployed.
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  // Create client with Auth context of the user that called the function.
  // This way your row-level-security policies are applied.
  { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
)

Deno.serve(async (req) => {
  try {
    const { cp } = await req.json()

    const { data, error } = await supabase
      .from('cat_cp')
      .select(`
        cat_estados!inner(estado),
        cat_municipios!inner(municipio)
      `)
      .eq('cp', cp)
      .single()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
