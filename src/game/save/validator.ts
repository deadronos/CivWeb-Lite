import saveSchema from '../../../schema/save.schema.json';
let _ajv: any = null;
let _validate: ((data: unknown) => boolean) | null = null;

// Inform TypeScript that require exists in the runtime
declare const require: any;

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

export function getAjvInstance(): any {
  if (!_ajv) ensureValidator();
  return _ajv;
}
