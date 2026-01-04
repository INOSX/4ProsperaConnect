# 🔧 INSTRUÇÕES PARA LIMPAR CACHE DO VERCEL

## ✅ Deploy Confirmado

**Último deploy em produção:**
- Commit: `b5afec33`
- Mensagem: "fix: Prioriza avatar_id (UUID) sobre id (nome publico) - Corrige erro 400"
- Status: **READY** ✅
- URL: https://4prosperaconnect.vercel.app

---

## 🔴 Problema: Cache do Navegador

O código está correto no Vercel, mas seu navegador está usando uma versão em cache.

---

## 💡 Soluções (Tente nesta ordem):

### 1. Hard Refresh (Mais Rápido)
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 2. Limpar Cache Completo do Site

**Chrome/Edge:**
1. Pressione `F12` (DevTools)
2. **Clique com botão direito** no ícone de atualizar (↻)
3. Selecione: **"Empty Cache and Hard Reload"**

**Firefox:**
1. Pressione `Ctrl+Shift+Delete`
2. Selecione apenas "Cache"
3. Limpar

### 3. Modo Anônimo/Incógnito
```
Chrome/Edge: Ctrl + Shift + N
Firefox: Ctrl + Shift + P
```
Abra: https://4prosperaconnect.vercel.app

### 4. Desabilitar Cache no DevTools
1. `F12` (DevTools)
2. Network tab
3. ✅ Marcar "Disable cache"
4. Manter DevTools aberto
5. Recarregar página

### 5. Limpar Service Workers
1. `F12` → Application tab
2. Service Workers (sidebar)
3. Clique "Unregister" em todos
4. Recarregar página

---

## 🧪 Como Verificar se Funcionou

Após limpar o cache, os logs devem mostrar:

```javascript
✅ CORRETO:
🔵 Bryan encontrado por nome: { 
  id: "64b526e4-741c-43b6-a918-4e40f3261c7a",  // UUID!
  name: "Bryan Casual Front" 
}
🔵 Creating session with avatarId: 64b526e4-741c-43b6-a918-4e40f3261c7a
✅ Session created successfully

❌ ERRADO (cache antigo):
🔵 Bryan encontrado por nome: { 
  id: "Bryan_Casual_Front_public",  // Nome público!
  name: "Bryan Casual Front" 
}
❌ POST /v1/streaming.new 400
```

---

## 🚨 Se NADA Funcionar

Execute este comando:

```powershell
# Forçar invalidação do cache do Vercel
curl -X GET "https://4prosperaconnect.vercel.app/api/clear-cache"
```

Depois:
1. Feche TODAS as abas do site
2. Feche o navegador completamente
3. Abra novamente
4. Acesse o site

---

## 📋 Checklist

- [ ] Hard refresh (`Ctrl+Shift+R`)
- [ ] Limpar cache do site (DevTools → Empty Cache)
- [ ] Tentar modo anônimo
- [ ] Desabilitar cache no DevTools
- [ ] Limpar service workers
- [ ] Fechar e reabrir navegador
- [ ] Verificar logs no console

---

*Última atualização: 2025-01-04 - Commit b5afec33*
