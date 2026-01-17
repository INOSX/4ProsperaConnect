const fs = require('fs');
const https = require('https');

const PROJECT_REF = 'dytuwutsjjxxmyefrfed';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ';
const SQL_FILE = 'create_role_hierarchy_4levels.sql';

// Ler o arquivo SQL
const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');

console.log('📝 Executando SQL no Supabase...\n');

// Usar a função do Supabase para executar SQL raw
const data = JSON.stringify({
  query: sqlContent
});

const options = {
  hostname: `${PROJECT_REF}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Prefer': 'return=representation'
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseData);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('\n✅ SUCESSO! Hierarquia de roles criada com sucesso!');
      console.log('\n🎉 Você agora é SUPER_ADMIN, Mario!');
    } else {
      console.log('\n❌ ERRO ao executar o SQL');
      console.log('Detalhes:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
  console.log('\n💡 Tentando executar via Supabase Client JS...');
  
  // Fallback: criar um arquivo que pode ser executado no SQL Editor
  console.log('\n📋 Como alternativa, copie o conteúdo de:');
  console.log('   create_role_hierarchy_4levels.sql');
  console.log('\n   E execute no SQL Editor do Supabase:');
  console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
});

req.write(data);
req.end();
