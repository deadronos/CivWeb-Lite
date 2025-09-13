/// <reference types="vite/client" />

// Augment ImportMeta so import.meta.env is typed in TypeScript files
declare global {
  interface ImportMetaEnv {
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
