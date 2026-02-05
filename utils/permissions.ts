// REFACTOR-PHASE-1: Permission checking utilities
// Frontend-only UX improvements - backend remains authoritative

import type { User } from '@/stores/types/login';

/**
 * Check if user can perform approval action
 * This is for UI/UX only - backend must validate permissions
 */
export function canApproveApproval(
    user: User | null,
    requiredRole?: string,
    approvalStatus?: string
): boolean {
    if (!user) return false;
    
    // Can only approve pending approvals
    if (approvalStatus && approvalStatus !== 'Pending') {
        return false;
    }
    
    // If no required role specified, allow (backend will validate)
    if (!requiredRole) {
        return true;
    }
    
    // Check if user role matches required role
    // Role matching is case-insensitive and handles partial matches
    const userRole = user.role?.toLowerCase() || '';
    const required = requiredRole.toLowerCase();
    
    // Exact match
    if (userRole === required) {
        return true;
    }
    
    // Partial match (e.g., "Administrator" matches "Admin")
    if (userRole.includes(required) || required.includes(userRole)) {
        return true;
    }
    
    // Special cases for common role variations
    const roleMappings: Record<string, string[]> = {
        'contracts': ['contracts', 'contract', 'general'],
        'financial': ['financial', 'finance', 'accounting'],
        'general': ['general', 'administrator', 'admin'],
    };
    
    const mappedRoles = roleMappings[required] || [];
    return mappedRoles.some(mapped => userRole.includes(mapped));
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: string): boolean {
    if (!user || !user.role) return false;
    return user.role.toLowerCase() === role.toLowerCase();
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: string[]): boolean {
    if (!user || !user.role) return false;
    const userRole = user.role.toLowerCase();
    return roles.some(role => userRole === role.toLowerCase());
}

