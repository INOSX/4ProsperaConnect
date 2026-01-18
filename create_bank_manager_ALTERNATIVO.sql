-- MÉTODO ALTERNATIVO (mais simples e seguro)
-- Use este se o método anterior não funcionar

-- PASSO 1: Vá até a interface do Supabase
-- Authentication > Users > Add User
-- Email: bank_manager@www.com
-- Senha: 1qazxsw2
-- Confirme o email automaticamente: ✓

-- PASSO 2: Depois de criar o usuário na interface, execute este SQL
-- Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário que você acabou de criar

-- Para encontrar o user_id, execute:
SELECT id, email FROM auth.users WHERE email = 'bank_manager@www.com';

-- Depois, insira na tabela clients:
INSERT INTO public.clients (
  user_id,
  name,
  email,
  role,
  created_at,
  updated_at
)
VALUES (
  'SEU_USER_ID_AQUI', -- ← Substitua pelo ID do SELECT acima
  'Bank Manager Teste',
  'bank_manager@www.com',
  'bank_manager',
  NOW(),
  NOW()
);

-- VERIFICAR
SELECT 
  c.id,
  c.user_id,
  c.name,
  c.email,
  c.role,
  c.created_at
FROM public.clients c
WHERE c.email = 'bank_manager@www.com';
