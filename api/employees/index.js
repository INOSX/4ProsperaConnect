/**
 * API Route para gestão de colaboradores
 */
const DEFAULT_SUPABASE_URL = 'https://dytuwutsjjxxmyefrfed.supabase.co'
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHV3dXRzamp4eG15ZWZyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkxNTcyNSwiZXhwIjoyMDgxNDkxNzI1fQ.lFy7Gg8jugdDbbYE_9c2SUF5SNhlnJn2oPowVkl6UlQ'

function getAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_KEY
  return createClient(url, serviceKey)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const adminClient = getAdminClient()

  try {
    switch (req.method) {
      case 'GET': {
        const { id, companyId, cpf, userId } = req.query

        if (id) {
          const { data, error } = await adminClient
            .from('employees')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error
          return res.status(200).json({ success: true, employee: data })
        }

        if (companyId) {
          const { data, error } = await adminClient
            .from('employees')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)
            .order('name', { ascending: true })

          if (error) throw error
          return res.status(200).json({ success: true, employees: data || [] })
        }

        if (cpf) {
          const { data, error } = await adminClient
            .from('employees')
            .select('*')
            .eq('cpf', cpf)
            .maybeSingle()

          if (error) throw error
          return res.status(200).json({ success: true, employee: data })
        }

        if (userId) {
          const { data, error } = await adminClient
            .from('employees')
            .select('*')
            .eq('platform_user_id', userId)
            .maybeSingle()

          if (error) throw error
          return res.status(200).json({ success: true, employee: data })
        }

        return res.status(400).json({ error: 'id, companyId, cpf, or userId is required' })
      }

      case 'POST': {
        const { company_id, cpf, name, email, phone, position, department, hire_date, salary, has_platform_access, userId, is_company_admin } = req.body

        if (!company_id || !cpf || !name) {
          return res.status(400).json({ error: 'company_id, cpf, and name are required' })
        }

        // Verificar permissões
        const requestingUserId = userId || req.headers['x-user-id']
        if (!requestingUserId) {
          return res.status(401).json({ error: 'User ID is required' })
        }

        // Buscar o cliente para verificar se é admin do banco
        const { data: client, error: clientError } = await adminClient
          .from('clients')
          .select('role')
          .eq('user_id', requestingUserId)
          .maybeSingle()

        if (clientError) throw clientError
        if (!client) {
          return res.status(404).json({ error: 'Client not found' })
        }

        const isBankAdmin = client.role === 'admin'

        // Se não for admin do banco, verificar se é admin do cliente da empresa
        if (!isBankAdmin) {
          const { data: companyAdminCheck, error: adminCheckError } = await adminClient
            .from('employees')
            .select('id')
            .eq('platform_user_id', requestingUserId)
            .eq('company_id', company_id)
            .eq('is_company_admin', true)
            .eq('is_active', true)
            .maybeSingle()

          if (adminCheckError) throw adminCheckError
          if (!companyAdminCheck) {
            return res.status(403).json({ error: 'Apenas administradores do banco ou administradores da empresa podem criar colaboradores' })
          }
        }

        // Verificar se já existe
        const { data: existing } = await adminClient
          .from('employees')
          .select('*')
          .eq('company_id', company_id)
          .eq('cpf', cpf)
          .maybeSingle()

        if (existing) {
          return res.status(409).json({ error: 'Employee with this CPF already exists in this company', employee: existing })
        }

        const { data, error } = await adminClient
          .from('employees')
          .insert({
            company_id,
            cpf,
            name,
            email,
            phone,
            position,
            department,
            hire_date,
            salary,
            has_platform_access: has_platform_access || false,
            is_company_admin: is_company_admin || false
          })
          .select()
          .single()

        if (error) throw error

        // Atualizar contador de colaboradores da empresa
        await adminClient.rpc('increment_employee_count', { company_id }).catch(() => {})

        return res.status(201).json({ success: true, employee: data })
      }

      case 'PUT': {
        const { id, userId, ...updates } = req.body

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        // Verificar permissões
        const requestingUserId = userId || req.headers['x-user-id']
        if (!requestingUserId) {
          return res.status(401).json({ error: 'User ID is required' })
        }

        // Buscar o employee para verificar company_id
        const { data: employee, error: empError } = await adminClient
          .from('employees')
          .select('company_id, platform_user_id')
          .eq('id', id)
          .single()

        if (empError) throw empError
        if (!employee) {
          return res.status(404).json({ error: 'Employee not found' })
        }

        // Buscar o cliente para verificar se é admin do banco
        const { data: client, error: clientError } = await adminClient
          .from('clients')
          .select('role')
          .eq('user_id', requestingUserId)
          .maybeSingle()

        if (clientError) throw clientError
        if (!client) {
          return res.status(404).json({ error: 'Client not found' })
        }

        const isBankAdmin = client.role === 'admin'
        const isOwnData = employee.platform_user_id === requestingUserId

        // Se não for admin do banco e não for próprio dado, verificar se é admin do cliente da empresa
        if (!isBankAdmin && !isOwnData) {
          const { data: companyAdminCheck, error: adminCheckError } = await adminClient
            .from('employees')
            .select('id')
            .eq('platform_user_id', requestingUserId)
            .eq('company_id', employee.company_id)
            .eq('is_company_admin', true)
            .eq('is_active', true)
            .maybeSingle()

          if (adminCheckError) throw adminCheckError
          if (!companyAdminCheck) {
            return res.status(403).json({ error: 'Apenas administradores do banco, administradores da empresa ou o próprio colaborador podem editar' })
          }
        }

        const { data, error } = await adminClient
          .from('employees')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return res.status(200).json({ success: true, employee: data })
      }

      case 'DELETE': {
        const { id, userId } = req.query

        if (!id) {
          return res.status(400).json({ error: 'id is required' })
        }

        // Verificar permissões
        const requestingUserId = userId || req.headers['x-user-id']
        if (!requestingUserId) {
          return res.status(401).json({ error: 'User ID is required' })
        }

        // Buscar employee para verificar company_id
        const { data: employee, error: empError } = await adminClient
          .from('employees')
          .select('company_id, is_company_admin, platform_user_id')
          .eq('id', id)
          .single()

        if (empError) throw empError
        if (!employee) {
          return res.status(404).json({ error: 'Employee not found' })
        }

        // Buscar o cliente para verificar se é admin do banco
        const { data: client, error: clientError } = await adminClient
          .from('clients')
          .select('role')
          .eq('user_id', requestingUserId)
          .maybeSingle()

        if (clientError) throw clientError
        if (!client) {
          return res.status(404).json({ error: 'Client not found' })
        }

        const isBankAdmin = client.role === 'admin'

        // Se não for admin do banco, verificar se é admin do cliente da empresa
        if (!isBankAdmin) {
          const { data: companyAdminCheck, error: adminCheckError } = await adminClient
            .from('employees')
            .select('id')
            .eq('platform_user_id', requestingUserId)
            .eq('company_id', employee.company_id)
            .eq('is_company_admin', true)
            .eq('is_active', true)
            .maybeSingle()

          if (adminCheckError) throw adminCheckError
          if (!companyAdminCheck) {
            return res.status(403).json({ error: 'Apenas administradores do banco ou administradores da empresa podem deletar colaboradores' })
          }

          // Admin do cliente não pode deletar outros admins
          if (employee.is_company_admin && employee.platform_user_id !== requestingUserId) {
            return res.status(403).json({ error: 'Administradores da empresa não podem deletar outros administradores' })
          }
        }

        // Soft delete
        const { data, error } = await adminClient
          .from('employees')
          .update({ is_active: false })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Atualizar contador
        if (employee) {
          await adminClient.rpc('decrement_employee_count', { company_id: employee.company_id }).catch(() => {})
        }

        return res.status(200).json({ success: true, employee: data })
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in employees API:', error)
    return res.status(500).json({
      error: error.message || 'Failed to process request'
    })
  }
}

