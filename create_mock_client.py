# -*- coding: utf-8 -*-
"""
Script para criar cliente empresa ficticio no Supabase com .env
"""

import os
import sys
from pathlib import Path

# Carregar variáveis do .env
try:
    from dotenv import load_dotenv
    env_path = Path('.') / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        print("[INFO] Arquivo .env carregado")
    else:
        print("[AVISO] Arquivo .env nao encontrado")
except ImportError:
    print("[AVISO] python-dotenv nao instalado. Tentando carregar variaveis manualmente...")
    # Tentar carregar manualmente
    env_file = Path('.') / '.env'
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
        print("[INFO] Variaveis carregadas manualmente")

from supabase import create_client, Client

# Obter credenciais do ambiente
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

print(f"[DEBUG] SUPABASE_URL: {'[definido]' if SUPABASE_URL else '[NAO DEFINIDO]'}")
print(f"[DEBUG] SUPABASE_ANON_KEY: {'[definido]' if SUPABASE_KEY else '[NAO DEFINIDO]'}")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("\n[ERRO] Variaveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY sao necessarias")
    print("Por favor, configure no arquivo .env")
    print("\nFormato esperado no .env:")
    print("SUPABASE_URL=https://seu-projeto.supabase.co")
    print("SUPABASE_ANON_KEY=sua-chave-anonima")
    sys.exit(1)

# Criar cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\nIniciando criacao de cliente empresa ficticio...\n")

try:
    # PASSO 1: Buscar usuario valido
    print("Passo 1: Buscando usuario valido...")
    
    try:
        user_response = supabase.auth.get_user()
        if user_response and hasattr(user_response, 'user') and user_response.user:
            user_id = user_response.user.id
            print(f"[OK] Usuario encontrado: {user_response.user.email}")
            print(f"   User ID: {user_id}\n")
        else:
            print("[AVISO] Nenhum usuario autenticado.")
            user_id_input = input("Digite o user_id (ou Enter para sair): ").strip()
            if not user_id_input:
                print("Operacao cancelada.")
                sys.exit(0)
            user_id = user_id_input
    except Exception as e:
        print(f"[AVISO] Erro ao buscar usuario: {e}")
        user_id_input = input("Digite o user_id (ou Enter para sair): ").strip()
        if not user_id_input:
            print("Operacao cancelada.")
            sys.exit(0)
        user_id = user_id_input
    
    # PASSO 2: Criar empresa ficticia
    print("Passo 2: Criando empresa ficticia...")
    
    company_data = {
        "cnpj": "12.345.678/0001-99",
        "company_name": "TechSolutions Desenvolvimento de Software LTDA",
        "trade_name": "TechSolutions",
        "company_type": "LTDA",
        "email": "contato@techsolutions-ficticio.com.br",
        "phone": "(11) 98765-4321",
        "address": {
            "street": "Rua das Inovacoes",
            "number": "123",
            "complement": "Sala 45",
            "neighborhood": "Centro Empresarial",
            "city": "Sao Paulo",
            "state": "SP",
            "zip_code": "01234-567"
        },
        "banking_status": "partial",
        "products_contracted": ["conta_corrente_pj", "cartao_corporativo"],
        "employee_count": 15,
        "annual_revenue": 1200000.00,
        "industry": "Tecnologia da Informacao",
        "registration_date": "2020-03-15",
        "is_active": True,
        "owner_user_id": user_id
    }
    
    # Verificar se empresa ja existe
    existing_company = supabase.table('companies').select('id').eq('cnpj', company_data['cnpj']).execute()
    
    if existing_company.data:
        company_id = existing_company.data[0]['id']
        print(f"[AVISO] Empresa com CNPJ {company_data['cnpj']} ja existe.")
        print(f"   ID: {company_id}\n")
    else:
        company_result = supabase.table('companies').insert(company_data).execute()
        
        if company_result.data:
            company_id = company_result.data[0]['id']
            print(f"[OK] Empresa criada!")
            print(f"   ID: {company_id}")
            print(f"   CNPJ: {company_data['cnpj']}")
            print(f"   Nome: {company_data['company_name']}\n")
        else:
            print(f"[ERRO] Falha ao criar empresa")
            sys.exit(1)
    
    # PASSO 3: Criar cliente do banco
    print("Passo 3: Criando cliente do banco (gestor)...")
    
    client_data = {
        "user_id": user_id,
        "client_code": "CLI-TECH-001",
        "name": "Joao Silva Santos",
        "email": "joao.silva@techsolutions-ficticio.com.br",
        "company_id": company_id,
        "user_type": "company"
    }
    
    existing_client = supabase.table('clients').select('id').eq('client_code', client_data['client_code']).execute()
    
    if existing_client.data:
        client_id = existing_client.data[0]['id']
        print(f"[AVISO] Cliente com codigo {client_data['client_code']} ja existe.")
        print(f"   ID: {client_id}\n")
    else:
        client_result = supabase.table('clients').insert(client_data).execute()
        
        if client_result.data:
            client_id = client_result.data[0]['id']
            print(f"[OK] Cliente criado!")
            print(f"   ID: {client_id}")
            print(f"   Codigo: {client_data['client_code']}")
            print(f"   Nome: {client_data['name']}\n")
        else:
            print(f"[ERRO] Falha ao criar cliente")
            sys.exit(1)
    
    # PASSO 4: Criar colaboradores
    print("Passo 4: Criando colaboradores...")
    
    employees_data = [
        {
            "company_id": company_id,
            "cpf": "123.456.789-01",
            "name": "Maria Oliveira Costa",
            "email": "maria.oliveira@techsolutions-ficticio.com.br",
            "phone": "(11) 98765-1111",
            "position": "Gerente de TI",
            "department": "Tecnologia",
            "hire_date": "2020-06-01",
            "salary": 8500.00,
            "has_platform_access": False,
            "is_active": True
        },
        {
            "company_id": company_id,
            "cpf": "234.567.890-12",
            "name": "Pedro Henrique Almeida",
            "email": "pedro.almeida@techsolutions-ficticio.com.br",
            "phone": "(11) 98765-2222",
            "position": "Desenvolvedor Senior",
            "department": "Tecnologia",
            "hire_date": "2021-01-15",
            "salary": 7000.00,
            "has_platform_access": False,
            "is_active": True
        },
        {
            "company_id": company_id,
            "cpf": "345.678.901-23",
            "name": "Ana Paula Rodrigues",
            "email": "ana.rodrigues@techsolutions-ficticio.com.br",
            "phone": "(11) 98765-3333",
            "position": "Analista Financeiro",
            "department": "Financeiro",
            "hire_date": "2021-08-20",
            "salary": 5500.00,
            "has_platform_access": False,
            "is_active": True
        }
    ]
    
    employees_created = 0
    for emp_data in employees_data:
        existing_emp = supabase.table('employees').select('id').eq('company_id', company_id).eq('cpf', emp_data['cpf']).execute()
        
        if existing_emp.data:
            print(f"   [AVISO] {emp_data['name']} ja existe")
        else:
            emp_result = supabase.table('employees').insert(emp_data).execute()
            if emp_result.data:
                employees_created += 1
                print(f"   [OK] {emp_data['name']} - {emp_data['position']}")
    
    print(f"\n[OK] {employees_created} colaboradores criados.\n")
    
    # PASSO 5: Criar beneficios
    print("Passo 5: Criando beneficios...")
    
    benefits_data = [
        {
            "company_id": company_id,
            "benefit_type": "meal_voucher",
            "name": "Vale Refeicao",
            "description": "Cartao de beneficio alimentacao com R$ 30,00 por dia util",
            "configuration": {
                "daily_value": 30.00,
                "provider": "Alelo",
                "card_type": "refeicao"
            },
            "eligibility_rules": {
                "minimum_hours_per_day": 6,
                "probation_period_days": 90
            },
            "is_active": True
        },
        {
            "company_id": company_id,
            "benefit_type": "transportation",
            "name": "Vale Transporte",
            "description": "Vale transporte para deslocamento casa-trabalho",
            "configuration": {
                "provider": "ValeTransporte SP",
                "calculation": "automatic"
            },
            "eligibility_rules": {
                "exclude_from_salary": True
            },
            "is_active": True
        },
        {
            "company_id": company_id,
            "benefit_type": "health_insurance",
            "name": "Plano de Saude",
            "description": "Plano de saude empresarial com cobertura nacional",
            "configuration": {
                "provider": "Unimed",
                "plan_type": "enfermaria",
                "coparticipation": False
            },
            "eligibility_rules": {
                "probation_period_days": 180,
                "dependent_coverage": True
            },
            "is_active": True
        }
    ]
    
    benefits_created = 0
    for benefit_data in benefits_data:
        existing_benefit = supabase.table('company_benefits').select('id').eq('company_id', company_id).eq('name', benefit_data['name']).execute()
        
        if existing_benefit.data:
            print(f"   [AVISO] {benefit_data['name']} ja existe")
        else:
            benefit_result = supabase.table('company_benefits').insert(benefit_data).execute()
            if benefit_result.data:
                benefits_created += 1
                print(f"   [OK] {benefit_data['name']}")
    
    print(f"\n[OK] {benefits_created} beneficios criados.\n")
    
    # RESUMO FINAL
    print("=" * 60)
    print("CLIENTE EMPRESA FICTICIO CRIADO COM SUCESSO!")
    print("=" * 60)
    print(f"\nRESUMO:\n")
    print(f"Empresa:")
    print(f"   ID: {company_id}")
    print(f"   CNPJ: {company_data['cnpj']}")
    print(f"   Nome: {company_data['company_name']}")
    print(f"   Setor: {company_data['industry']}")
    print(f"   Colaboradores: {company_data['employee_count']}")
    print(f"   Faturamento: R$ {company_data['annual_revenue']:,.2f}")
    print(f"\nCliente (Gestor):")
    print(f"   ID: {client_id}")
    print(f"   Codigo: {client_data['client_code']}")
    print(f"   Nome: {client_data['name']}")
    print(f"   Email: {client_data['email']}")
    print(f"\nColaboradores: {len(employees_data)}")
    print(f"Beneficios: {len(benefits_data)}")
    print("\n" + "=" * 60)
    print("\nPronto para usar no sistema 4Prospera!\n")

except Exception as e:
    print(f"\n[ERRO] {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
