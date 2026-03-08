/**
 * Script de setup de la base de données Supabase
 * Usage: node scripts/setup-db.mjs <DB_PASSWORD>
 *
 * Exemple:
 *   node scripts/setup-db.mjs MonMotDePasse123
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qibyilidondesgzioajx.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpYnlpbGlkb25kZXNnemlvYWp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkyNjY2MSwiZXhwIjoyMDg4NTAyNjYxfQ.NyfMNCp1-KDy6mbnSAlRZiyw58CA67wuHMlDB4liHhI'

const dbPassword = process.argv[2]
if (!dbPassword) {
  console.error('Usage: node scripts/setup-db.mjs <DB_PASSWORD>')
  process.exit(1)
}

const DB_URL = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.qibyilidondesgzioajx.supabase.co:5432/postgres`

// Test de connexion via l'API REST
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

console.log('🔗 Test de connexion Supabase...')
const { data, error } = await supabase.from('profiles').select('count').limit(1)

if (error && error.code !== 'PGRST116') {
  console.log('ℹ️  Tables non trouvées (normal si première installation)')
}

console.log(`\n📋 URL de connexion DB construite:`)
console.log(`postgresql://postgres:****@db.qibyilidondesgzioajx.supabase.co:5432/postgres`)
console.log(`\nLance cette commande pour pousser le schéma:`)
console.log(`npx supabase db push --db-url "${DB_URL}" --workdir .`)
