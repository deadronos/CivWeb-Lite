// Compatibility shim: re-export the canonical kebab-case component.
// Provide both the default export and a named export for consumers that import the PascalCase symbol.
export { default as UnitBadgeContainer } from './unit-badge-container';
export { default } from './unit-badge-container';
