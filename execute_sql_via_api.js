const fs = require('fs');
const https = require('https');

const PROJECT_REF = 'dytuwutsjjxxmyefrfed';
const SERVICE_KEY = 'sb_secret_Pt3ZbocF8Fh6DkINLnemIw_zSe4ER2k';
const SQL_FILE = 'create_role_hierarchy_4levels.sql';

// Ler o arquivo SQL
const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');

// Configurar a requisição
const options = {
  hostname: `${PROJECT_REF}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`
  }
};

// Fazer a requisição
const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n✅ SUCESSO! Hierarquia de roles criada!');
    } else {
      console.log('\n❌ ERRO ao executar SQL');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error);
});

// Enviar o SQL
req.write(JSON.stringify({ sql: sqlContent }));
req.end();
