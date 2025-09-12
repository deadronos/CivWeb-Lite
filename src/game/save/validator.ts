import saveSchema from '../../../schema/save.schema.json';
let _ajv: any;
let _validate: ((data: unknown) => boolean) | undefined;

/**
 * @file This file contains functions for validating the save file schema.
 * It uses a lazy-loaded AJV instance to avoid side-effects during import.
 */

// Inform TypeScript that require exists in the runtime
declare const require: any;

/**
 * Ensures that the AJV validator is initialized and returns the validation function.
 * @returns The validation function.
 * @throws An error if the validator fails to initialize.
 */
export function ensureValidator(): (data: unknown) => boolean {
  if (_validate) return _validate;
  // Lazy require AJV to avoid module-evaluation side-effects during import

  const Ajv = require('ajv');
  const AjvCtor = Ajv && Ajv.default ? Ajv.default : Ajv;
  _ajv = new AjvCtor({ allErrors: true, strict: false });
  _validate = (_ajv as any).compile(saveSchema as any);
  if (!_validate) throw new Error('Failed to initialize AJV validator');
  return _validate;
}

/**
 * Gets the AJV instance, initializing it if necessary.
 * @returns The AJV instance.
 */
export function getAjvInstance(): any {
  if (!_ajv) ensureValidator();
  return _ajv;
}
