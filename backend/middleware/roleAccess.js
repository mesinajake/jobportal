/**
 * Role-Based Access Control (RBAC) Middleware
 * Granular permission system for single-company job portal
 */

// Permission definitions for each role
export const rolePermissions = {
  candidate: [
    'view_public_jobs',
    'apply_job',
    'view_own_applications',
    'update_own_profile',
    'withdraw_application',
    'view_own_interviews'
  ],
  
  recruiter: [
    // Inherits candidate permissions for testing
    'view_public_jobs',
    // Recruiter-specific
    'view_all_jobs',
    'create_job',
    'edit_own_jobs',
    'view_applications',
    'update_application_status',
    'add_application_notes',
    'schedule_interview',
    'view_interviews',
    'view_candidates',
    'search_candidates',
    'export_candidates',
    'view_department_analytics'
  ],
  
  hiring_manager: [
    // Inherits recruiter permissions
    'view_public_jobs',
    'view_all_jobs',
    'create_job',
    'edit_own_jobs',
    'view_applications',
    'update_application_status',
    'add_application_notes',
    'schedule_interview',
    'view_interviews',
    'view_candidates',
    'search_candidates',
    'export_candidates',
    'view_department_analytics',
    // Hiring manager specific
    'edit_department_jobs',
    'approve_job_posting',
    'reject_candidate',
    'advance_candidate',
    'submit_interview_feedback',
    'make_hiring_decision',
    'view_team_analytics'
  ],
  
  hr: [
    // Full HR access
    'view_public_jobs',
    'view_all_jobs',
    'create_job',
    'edit_any_job',
    'delete_job',
    'approve_job_posting',
    'view_applications',
    'update_application_status',
    'add_application_notes',
    'schedule_interview',
    'view_interviews',
    'view_candidates',
    'search_candidates',
    'export_candidates',
    'view_all_analytics',
    'create_offer',
    'send_offer',
    'manage_offer',
    'invite_staff',
    'manage_departments',
    'view_compensation_data',
    'generate_reports',
    'manage_job_templates',
    'bulk_actions'
  ],
  
  admin: [
    // Full system access
    '*'
  ]
};

// Staff roles (non-candidates)
export const staffRoles = ['recruiter', 'hiring_manager', 'hr', 'admin'];

// Check if a role has a specific permission
export const hasPermission = (role, permission) => {
  const permissions = rolePermissions[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
};

// Check if user is staff (non-candidate)
export const isStaff = (role) => {
  return staffRoles.includes(role);
};

/**
 * Middleware to check if user has specific permission
 * @param {string} permission - Required permission
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const permissions = rolePermissions[userRole] || [];

    // Admin has all permissions
    if (permissions.includes('*')) {
      return next();
    }

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`,
        requiredPermission: permission,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 * @param {string[]} permissions - Array of permissions (OR logic)
 */
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const userPermissions = rolePermissions[userRole] || [];

    // Admin has all permissions
    if (userPermissions.includes('*')) {
      return next();
    }

    const hasAny = permissions.some(p => userPermissions.includes(p));
    
    if (!hasAny) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredPermissions: permissions,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has ALL of the specified permissions
 * @param {string[]} permissions - Array of permissions (AND logic)
 */
export const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const userPermissions = rolePermissions[userRole] || [];

    // Admin has all permissions
    if (userPermissions.includes('*')) {
      return next();
    }

    const hasAll = permissions.every(p => userPermissions.includes(p));
    
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Missing required permissions.',
        requiredPermissions: permissions,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Middleware to require staff role (non-candidate)
 */
export const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!isStaff(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff access required.',
      userRole: req.user.role
    });
  }

  next();
};

/**
 * Middleware to require specific roles
 * @param {string[]} roles - Allowed roles
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware to check department access
 * User can only access resources in their department or subordinate departments
 */
export const requireDepartmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admin and HR have access to all departments
  if (['admin', 'hr'].includes(req.user.role)) {
    return next();
  }

  // Get department ID from request (could be in params, query, or body)
  const departmentId = req.params.departmentId || req.query.department || req.body.department;

  // If no department specified, allow (will filter by user's department)
  if (!departmentId) {
    return next();
  }

  // Check if user belongs to this department or has access
  if (req.user.department && req.user.department.toString() === departmentId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your department resources.'
  });
};

/**
 * Helper to attach user permissions to request
 */
export const attachPermissions = (req, res, next) => {
  if (req.user) {
    req.userPermissions = rolePermissions[req.user.role] || [];
    req.hasPermission = (permission) => {
      return req.userPermissions.includes('*') || req.userPermissions.includes(permission);
    };
    req.isStaff = isStaff(req.user.role);
  }
  next();
};

export default {
  rolePermissions,
  staffRoles,
  hasPermission,
  isStaff,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireStaff,
  requireRole,
  requireDepartmentAccess,
  attachPermissions
};
