export const isTest = () => (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') || import.meta.env?.MODE === 'test';
export const isDev = () => import.meta.env?.DEV === true || import.meta.env?.MODE === 'development';
export const isDevOrTest = () => isDev() || isTest();

