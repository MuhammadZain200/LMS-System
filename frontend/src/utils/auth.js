/**
 * Utility functions for JWT token handling
 */

/**
 * Decodes a JWT token and returns the payload
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Gets the token from localStorage
 */
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * Extracts userId from JWT token
 * Tries common claim names used in ASP.NET Core JWT tokens
 */
export function getUserIdFromToken(token) {
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  // Try common claim names for userId in ASP.NET Core
  // Order matters - try most common first
  return decoded.nameid || 
         decoded.userId || 
         decoded.UserId || 
         decoded.sub || 
         decoded.user_id ||
         decoded.id ||
         null;
}

