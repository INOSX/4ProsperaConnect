-- Script para criar usuário Bank Manager para testes
-- Email: bank_manager@www.com
-- Senha: 1qazxsw2
-- Role: bank_manager

-- PASSO 1: Criar usuário no auth (execute este bloco primeiro)
-- NOTA: Este comando só funciona se você tiver permissões de admin no Supabase
-- Se der erro, use a interface do Supabase Authentication para criar manualmente

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Inserir usuário diretamente na tabela auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'bank_manager@www.com',
    crypt('1qazxsw2', gen_salt('bf')), -- Senha criptografada
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- PASSO 2: Criar registro na tabela clients com role bank_manager
  INSERT INTO public.clients (
    user_id,
    name,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'Bank Manager Teste',
    'bank_manager@www.com',
    'bank_manager',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Usuário Bank Manager criado com sucesso! User ID: %', new_user_id;
END $$;

-- VERIFICAR SE FOI CRIADO
SELECT 
  c.id,
  c.user_id,
  c.name,
  c.email,
  c.role,
  c.created_at
FROM public.clients c
WHERE c.email = 'bank_manager@www.com';
