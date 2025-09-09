/* eslint-disable unicorn/filename-case -- filename chosen to mirror component name; see note above */
// TileMesh filename intentionally uses PascalCase to match React component default export.
// Renaming the file to kebab-case would require updating many imports across the codebase
// and will be done in a dedicated refactor PR.
export * from './tile-mesh';
export { default } from './tile-mesh';
