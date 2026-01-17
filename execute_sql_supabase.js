import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function executeSQLScript() {
  console.log('📝 Lendo script SQL...\n');
  
  const sqlContent = fs.readFileSync('create_role_hierarchy_4levels.sql', 'utf8');
  
  // Dividir o SQL em statements individuais (aproximado)
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`📊 Total de ${statements.length} statements para executar\n`);
  console.log('🚀 Executando no Supabase...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Pular comentários e SELECTs de resumo no final
    if (stmt.includes('UNION ALL') || stmt.includes('linha as')) {
      continue;
    }
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
      
      if (error) {
        console.log(`❌ Erro no statement ${i + 1}:`, error.message);
        errorCount++;
      } else {
        successCount++;
        if (i % 10 === 0) {
          console.log(`✅ Executados ${i + 1}/${statements.length} statements...`);
        }
      }
    } catch (err) {
      console.log(`❌ Exceção no statement ${i + 1}:`, err.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADO:');
  console.log('='.repeat(60));
  console.log(`✅ Sucesso: ${successCount} statements`);
  console.log(`❌ Erros: ${errorCount} statements`);
  console.log('='.repeat(60));
  
  if (errorCount === 0) {
    console.log('\n🎉 HIERARQUIA DE ROLES CRIADA COM SUCESSO!');
    console.log('🏆 Você agora é SUPER_ADMIN, Mario!');
  }
}

executeSQLScript().catch(console.error);
