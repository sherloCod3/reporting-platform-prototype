export function validateSql(query: string) {
    const normalized = query.trim().toUpperCase();

    if (!normalized.startsWith('SELECT')) {
        throw new Error('❌ Apenas consultas SELECT são permitidas');
    }

    const forbidden = [ 'DROP', 'DELETE', 'UPDATE', 'ALTER', 'TRUNCATE' ];
    if (forbidden.some(word => normalized.includes(word))) {
        throw new Error('❌ Comando SQL não permitido!');
    }
}