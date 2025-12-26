/**
 * Funções helper para verificar permissões de usuário
 */

/**
 * Verificar se usuário é admin
 * @param {string} userRole - Role do usuário ('admin' ou 'user')
 * @returns {boolean}
 */
export const isAdmin = (userRole) => {
  return userRole === 'admin'
}

/**
 * Verificar se pode criar empresa
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export const canCreateCompany = (userRole) => {
  return isAdmin(userRole)
}

/**
 * Verificar se pode criar conexão de banco
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export const canCreateConnection = (userRole) => {
  return isAdmin(userRole)
}

/**
 * Verificar se pode acessar admin panel
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export const canAccessAdminPanel = (userRole) => {
  return isAdmin(userRole)
}

/**
 * Verificar se pode executar sincronizações
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export const canRunSync = (userRole) => {
  return isAdmin(userRole)
}

/**
 * Verificar se pode acessar Prospecção de Clientes
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export const canAccessProspecting = (userRole) => {
  return isAdmin(userRole) // Apenas Admin do Banco
}

/**
 * Verificar se pode acessar Campanhas de Marketing
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export const canAccessCampaigns = (userRole) => {
  return isAdmin(userRole) // Apenas Admin do Banco
}

/**
 * Verificar se pode gerenciar colaboradores
 * @param {string} userRole - Role do usuário
 * @param {boolean} isCompanyAdmin - Se é Admin do Cliente
 * @returns {boolean}
 */
export const canManageEmployees = (userRole, isCompanyAdmin = false) => {
  return isAdmin(userRole) || isCompanyAdmin // Admin do Banco OU Admin do Cliente
}

