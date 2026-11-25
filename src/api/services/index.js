/**
 * API Services Index
 * Central export point for all API services
 */

export { default as authService } from './authService';
export { default as dashboardService } from './dashboardService';
export { default as userService } from './userService';
export { default as buildingService } from './buildingService';
export { default as reportService } from './reportService';

// Re-export individual functions for convenience
export * from './authService';
export * from './dashboardService';
export * from './userService';
export * from './buildingService';
export * from './reportService';
