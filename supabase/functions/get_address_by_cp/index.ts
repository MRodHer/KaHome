import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Hello from get_address_by_cp!')

// --- OPTIMIZACIÓN ---
// Crea el cliente UNA VEZ, fuera del handler.
// Usa la clave ANÓNIMA, ya que los códigos postales deben ser datos públicos.
// Asegúrate de que tus tablas 'cat_cp', 'cat_estados', y 'cat_municipios'
// tengan RLS habilitado para LECTURA para 'anon' o 'authenticated'.
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

Deno.serve(async (req) => {
  try {
    // 1. Validar el método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 405,
      })
    }
    
    // 2. Obtener el CP
    const { cp } = await req.json()
    if (!cp) {
       return new Response(JSON.stringify({ error: 'Missing cp (postal code)' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 3. Consultar la base de datos
    // Esta consulta ahora usa la clave anónima (service_role si es necesario, pero anon es mejor)
    const { data, error } = await supabase
      .from('cat_cp')
      .select(`
        cat_estados!inner(estado),
        cat_municipios!inner(municipio)
      `)
      .eq('cp', cp)
      .limit(1) // Siempre es bueno limitar
      .single() // .single() es correcto si esperas solo uno

    if (error) {
      if ((error as any).code === 'PGRST116') {
        // 'PGRST116' es "No rows found" para .single()
         return new Response(JSON.stringify({ error: 'Postal code not found' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      throw error // Lanza otros errores
    }

    // 4. Devolver los datos
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    // 5. Manejo de errores mejorado
    console.error('Error in function:', err?.message || err)
    return new Response(JSON.stringify({ error: err?.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
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
