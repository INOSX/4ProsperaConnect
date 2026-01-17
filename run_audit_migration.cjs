const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeMigration() {
  try {
    console.log('📦 Lendo arquivo de migration...')
    const sqlFile = path.join(__dirname, 'supabase', 'migrations', '20260117_audit_logs.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    console.log('🚀 Executando migration no Supabase...')
    
    // Dividir em statements individuais
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
    
    console.log(`📝 ${statements.length} statements para executar...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue
      
      console.log(`\n[${i + 1}/${statements.length}] Executando...`)
      console.log(statement.substring(0, 80) + '...')
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
      
      if (error) {
        // Tentar via fetch direto
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ sql: statement + ';' })
        })
        
        if (!response.ok) {
          console.error(`❌ Erro no statement ${i + 1}:`, error.message)
          console.log('Tentando executar todo o SQL de uma vez...')
          break
        }
      }
      
      console.log(`✅ Statement ${i + 1} executado com sucesso`)
    }
    
    // Tentar executar todo o SQL de uma vez
    console.log('\n🔄 Tentando executar migration completa...')
    const { error: fullError } = await supabase.rpc('exec_sql', { sql })
    
    if (fullError) {
      console.error('❌ Erro ao executar migration completa:', fullError.message)
      console.log('\n⚠️  Por favor, execute manualmente no Supabase SQL Editor:')
      console.log('📁 Arquivo: supabase/migrations/20260117_audit_logs.sql')
      process.exit(1)
    }
    
    console.log('\n✅ Migration executada com sucesso!')
    console.log('📊 Tabela audit_logs criada!')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.log('\n⚠️  Por favor, execute manualmente no Supabase SQL Editor:')
    console.log('📁 Arquivo: supabase/migrations/20260117_audit_logs.sql')
    process.exit(1)
  }
}

executeMigration()
