import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

console.log('🔧 Tentando criar tabela audit_logs diretamente...')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function createAuditTable() {
  try {
    // Verificar se a tabela já existe
    const { data: existing, error: checkError } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ Tabela audit_logs já existe!')
      return
    }
    
    console.log('⚠️  Tabela não existe. Por favor, execute manualmente o SQL:')
    console.log('\n📁 Arquivo: supabase/migrations/20260117_audit_logs.sql')
    console.log('\n📝 Acesse: https://supabase.com/dashboard/project/dytuwutsjjxxmyefrfed/sql')
    console.log('\nCopie e cole o conteúdo do arquivo SQL acima no editor.')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

createAuditTable()
