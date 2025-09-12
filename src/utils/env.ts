/**
 * @file This file contains utility functions for checking the current environment.
 */

/**
 * Checks if the current environment is a test environment.
 * @returns True if the current environment is a test environment, false otherwise.
 */
export const isTest = () =>
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') ||
  import.meta.env?.MODE === 'test';

/**
 * Checks if the current environment is a development environment.
 * @returns True if the current environment is a development environment, false otherwise.
 */
export const isDev = () => import.meta.env?.DEV === true || import.meta.env?.MODE === 'development';

/**
 * Checks if the current environment is a development or test environment.
 * @returns True if the current environment is a development or test environment, false otherwise.
 */
export const isDevOrTest = () => isDev() || isTest();
