// Gera timestamp atual em formato ISO para campos de auditoria.
export const getNowIso = (): string => new Date().toISOString();
