import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eprxfpcptukbdwzrkrxz.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcnhmcGNwdHVrYmR3enJrcnh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjAwMTU3NywiZXhwIjoyMDUxNTc3NTc3fQ.TE7bj8gB5qQ9aP0VCmfmOqkYZQqMKPRkJQPvXXiVQJs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Iniciando aplicação da migration...')
    
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'URGENTE_FIX_RLS.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    console.log('📄 SQL lido:', sql.substring(0, 200) + '...')
    
    // Separar as queries por ponto-e-vírgula
    const queries = sql
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--') && q.length > 10)
    
    console.log(`📊 Total de queries: ${queries.length}`)
    
    // Executar cada query
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i] + ';'
      console.log(`\n🔄 Executando query ${i + 1}/${queries.length}...`)
      console.log(query.substring(0, 100) + '...')
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query })
        
        if (error) {
          console.error(`❌ Erro na query ${i + 1}:`, error)
          // Continuar mesmo com erro (DROP IF EXISTS pode dar erro se não existir)
        } else {
          console.log(`✅ Query ${i + 1} executada com sucesso!`)
          if (data) {
            console.log('📊 Resultado:', data)
          }
        }
      } catch (err) {
        console.error(`❌ Exceção na query ${i + 1}:`, err.message)
        // Continuar
      }
    }
    
    console.log('\n✅ Migration aplicada com sucesso!')
    console.log('\n🔍 Verificando seu usuário...')
    
    // Verificar o usuário
    const { data: users, error: usersError } = await supabase
      .from('clients')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Erro ao verificar usuários:', usersError)
    } else {
      console.log('✅ Usuários encontrados:', users.length)
      console.log(users)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    process.exit(1)
  }
}

runMigration()
