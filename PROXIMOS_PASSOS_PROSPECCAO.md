# Próximos Passos - Sistema de Prospecção de CNPJs

## ✅ Implementação Concluída

Todas as funcionalidades do plano foram implementadas:
- ✅ Banco de dados com novas tabelas
- ✅ Serviços de enriquecimento e scoring
- ✅ APIs de prospecção e integrações externas
- ✅ Componentes de UI (Dashboard, Lista, Detalhes, Wizard)
- ✅ Integração com avatar para contexto de prospecção

---

## 🚀 Passos Imediatos

### 1. Executar Scripts SQL no Supabase

**Ordem de execução:**
1. Execute `create_prospecting_enhancements.sql` no SQL Editor do Supabase
   - Cria todas as novas tabelas
   - Adiciona campos nas tabelas existentes
   - Configura RLS policies
   - Cria índices e triggers

2. Execute `create_mock_external_api_data.sql`
   - Insere dados mockados para testes
   - Cria configurações de APIs externas
   - Vincula fontes de dados aos prospects

**Verificação:**
```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'prospect_data_sources',
  'external_api_integrations',
  'prospect_enrichment_history',
  'prospect_scoring_metrics',
  'prospect_enrichment_jobs'
);

-- Verificar campos novos em prospects
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prospects' 
AND column_name IN ('ltv_estimate', 'churn_risk', 'enrichment_status');
```

---

### 2. Testar Funcionalidades Principais

#### A. Dashboard de Prospecção (`/prospecting`)
- [ ] Verificar se KPIs são exibidos corretamente
- [ ] Testar gráfico de distribuição de scores
- [ ] Validar métricas de LTV e Churn Risk
- [ ] Verificar botões de ação rápida

#### B. Lista de Prospects (`/prospecting/list`)
- [ ] Testar busca por nome, CPF ou email
- [ ] Validar filtros (Status, Score, LTV, Churn Risk)
- [ ] Testar seleção múltipla de prospects
- [ ] Verificar botão "Enriquecer Selecionados"
- [ ] Validar colunas LTV, Churn Risk e Enrichment Status

#### C. Detalhes do Prospect (`/prospecting/:id`)
- [ ] Testar todas as abas (Visão Geral, Enriquecimento, Scoring, Dados Externos)
- [ ] Validar cálculo de score avançado
- [ ] Testar botão "Enriquecer Agora"
- [ ] Verificar histórico de enriquecimento
- [ ] Validar exibição de dados externos

#### D. Wizard de Enriquecimento (`/prospecting/enrich`)
- [ ] Testar seleção de prospects
- [ ] Validar seleção de fontes (Uploads, Conexões, APIs)
- [ ] Testar mapeamento de campos
- [ ] Validar revisão e execução
- [ ] Verificar acompanhamento de progresso

#### E. Integração com Avatar
- [ ] Navegar para `/prospecting` e fazer uma pergunta ao avatar
- [ ] Verificar se o avatar responde com contexto de prospecção
- [ ] Testar em página de detalhes (`/prospecting/:id`)
- [ ] Validar estatísticas passadas ao avatar

---

### 3. Validar Integrações

#### A. APIs Externas Mockadas
```bash
# Testar Receita Federal
curl -X POST http://localhost:3000/api/external/receita-federal \
  -H "Content-Type: application/json" \
  -d '{"cpf": "123.456.789-00"}'

# Testar Serasa
curl -X POST http://localhost:3000/api/external/serasa \
  -H "Content-Type: application/json" \
  -d '{"cpf": "123.456.789-00"}'
```

#### B. API de Enriquecimento
```bash
# Testar enriquecimento
curl -X POST http://localhost:3000/api/prospects/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "prospectIds": ["prospect-id-1", "prospect-id-2"],
    "sourceConfigs": [{
      "sourceType": "external_api",
      "sourceId": "api-id",
      "fieldMapping": {}
    }],
    "userId": "user-id"
  }'
```

#### C. API de Scoring Avançado
```bash
# Testar cálculo de score
curl -X POST http://localhost:3000/api/prospects/calculate-advanced-score \
  -H "Content-Type: application/json" \
  -d '{
    "prospectIds": ["prospect-id-1"],
    "weights": {
      "conversionProbability": 0.35,
      "ltv": 0.30,
      "churnRisk": 0.20,
      "engagement": 0.15
    }
  }'
```

---

### 4. Configurar APIs Externas (Opcional)

Se quiser testar com APIs reais (futuro):
1. Acesse a página de configuração de APIs externas
2. Configure credenciais para cada provider
3. Teste conexões
4. Atualize as APIs em `/api/external/*` para usar credenciais reais

---

### 5. Ajustes e Melhorias Sugeridas

#### A. Algoritmos de Scoring
- [ ] Ajustar pesos baseado em feedback de negócio
- [ ] Adicionar mais fatores de conversão
- [ ] Melhorar cálculo de LTV com dados históricos
- [ ] Refinar cálculo de churn risk

#### B. Mapeamento de Campos
- [ ] Implementar mapeamento automático com IA
- [ ] Adicionar validação de campos obrigatórios
- [ ] Melhorar interface de mapeamento visual

#### C. Performance
- [ ] Adicionar paginação na lista de prospects
- [ ] Implementar cache para estatísticas
- [ ] Otimizar queries do banco de dados
- [ ] Adicionar índices adicionais se necessário

#### D. UX/UI
- [ ] Adicionar loading states em todas as operações
- [ ] Melhorar mensagens de erro
- [ ] Adicionar confirmações para ações destrutivas
- [ ] Implementar notificações de conclusão de jobs

---

### 6. Documentação

#### A. Documentação Técnica
- [ ] Documentar estrutura do banco de dados
- [ ] Documentar APIs e endpoints
- [ ] Documentar serviços e suas responsabilidades
- [ ] Criar diagramas de fluxo

#### B. Documentação de Usuário
- [ ] Guia de uso do wizard de enriquecimento
- [ ] Como configurar APIs externas
- [ ] Como interpretar métricas de scoring
- [ ] FAQ sobre prospecção

---

### 7. Deploy e Monitoramento

#### A. Deploy
- [ ] Fazer commit e push das mudanças
- [ ] Verificar se o deploy no Vercel foi bem-sucedido
- [ ] Testar funcionalidades em produção

#### B. Monitoramento
- [ ] Configurar logs para APIs de enriquecimento
- [ ] Monitorar erros em produção
- [ ] Acompanhar performance de queries
- [ ] Coletar métricas de uso

---

## 🔍 Checklist de Validação

### Funcionalidades Críticas
- [ ] Criação de prospects funciona
- [ ] Enriquecimento de prospects funciona
- [ ] Cálculo de scores funciona
- [ ] Listagem e filtros funcionam
- [ ] Integração com avatar funciona

### Integrações
- [ ] APIs externas mockadas respondem
- [ ] Enriquecimento processa corretamente
- [ ] Scoring calcula métricas corretas
- [ ] Vectorstore sincroniza dados

### UI/UX
- [ ] Todas as páginas carregam sem erros
- [ ] Navegação entre páginas funciona
- [ ] Formulários validam corretamente
- [ ] Mensagens de erro são claras

---

## 📝 Notas Importantes

1. **Dados Mockados**: As APIs externas estão mockadas. Para produção, será necessário:
   - Integrar com APIs reais
   - Implementar autenticação adequada
   - Adicionar rate limiting
   - Implementar cache

2. **Jobs Assíncronos**: O enriquecimento é processado de forma assíncrona. Em produção, considere:
   - Usar filas de jobs (ex: Bull, BullMQ)
   - Implementar retry logic
   - Adicionar notificações de conclusão

3. **Segurança**: 
   - Validar todas as entradas do usuário
   - Implementar rate limiting nas APIs
   - Criptografar credenciais de APIs externas adequadamente
   - Revisar políticas RLS

4. **Performance**:
   - Adicionar paginação onde necessário
   - Implementar cache para dados frequentes
   - Otimizar queries complexas
   - Considerar CDN para assets estáticos

---

## 🎯 Próximas Features Sugeridas

1. **Campanhas Inteligentes**
   - Criar campanhas baseadas em scoring
   - Segmentação automática de prospects
   - A/B testing de abordagens

2. **Machine Learning**
   - Modelo preditivo para conversão
   - Aprendizado contínuo com dados históricos
   - Recomendações personalizadas

3. **Analytics Avançado**
   - Dashboard executivo
   - Relatórios customizados
   - Exportação de dados

4. **Automação**
   - Enriquecimento automático periódico
   - Notificações de novos prospects qualificados
   - Workflows automatizados

---

## 🆘 Suporte

Se encontrar problemas:
1. Verificar logs do console do navegador
2. Verificar logs do Vercel
3. Verificar logs do Supabase
4. Consultar documentação das APIs
5. Revisar políticas RLS no Supabase

