// Compatibility shim: re-export the canonical kebab-case implementation.
// Keep as a pure re-export so consumers importing PascalCase paths keep working
// until we remove these shims repository-wide.
export * from './model-registry';
export { default } from './model-registry';