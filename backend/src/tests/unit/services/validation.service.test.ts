import { validationService } from '@/services/validation.service.js';

describe('ValidationService.validateQuery', () => {

    // ── Deve PASSAR ────────────────────────────────────────────────
    describe('queries válidas', () => {
        it.each([
            [ 'SELECT simples', 'SELECT * FROM orders WHERE id = 1' ],
            [ 'SELECT com alias', 'SELECT id, name AS label FROM clients' ],
            [ 'WITH (CTE)', 'WITH cte AS (SELECT id FROM t) SELECT * FROM cte' ],
            [ 'SELECT maiúsculo', 'SELECT * FROM orders' ],
            [ 'SELECT minúsculo', 'select * from orders' ],
            // Casos que QUEBRAVAM com o bug || — garantia de regressão
            [ 'substring DELETE em coluna', 'SELECT updated_at, deleted_at FROM reports' ],
            [ 'substring UPDATE em coluna', 'SELECT updated_count FROM metrics' ],
            [ 'keyword em literal string', "SELECT 'DROP TABLE' AS label FROM dual" ],
        ])('%s', async (_: string, sql: string) => {
            const result = await validationService.validateQuery(sql);
            expect(result.isValid).toBe(true);
        });
    });

    // ── Deve REJEITAR ───────────────────────────────────────────────
    describe('queries inválidas — DML/DDL', () => {
        it.each([
            [ 'DELETE', 'DELETE FROM orders WHERE id = 1' ],
            [ 'DROP', 'DROP TABLE users' ],
            [ 'UPDATE', 'UPDATE users SET role = "admin" WHERE id = 1' ],
            [ 'INSERT', "INSERT INTO logs VALUES (1, 'x')" ],
            [ 'ALTER', 'ALTER TABLE clients ADD COLUMN hack TEXT' ],
            [ 'TRUNCATE', 'TRUNCATE TABLE reports' ],
        ])('%s rejeitado', async (_: string, sql: string) => {
            const result = await validationService.validateQuery(sql);
            expect(result.isValid).toBe(false);
            expect(result.reason).toBeDefined();
        });
    });

    describe('queries inválidas — estrutura', () => {
        it('rejeita query que não começa com SELECT ou WITH', async () => {
            const result = await validationService.validateQuery('SHOW TABLES');
            expect(result.isValid).toBe(false);
        });

        it('rejeita query acima do limite de 35.000 caracteres', async () => {
            const longSql = 'SELECT ' + 'a,'.repeat(20000) + ' 1 FROM dual';
            const result = await validationService.validateQuery(longSql);
            expect(result.isValid).toBe(false);
        });

        it('rejeita string vazia', async () => {
            const result = await validationService.validateQuery('');
            expect(result.isValid).toBe(false);
        });
    });
});
