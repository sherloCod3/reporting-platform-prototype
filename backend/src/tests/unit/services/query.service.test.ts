import { jest } from '@jest/globals';
import type { Pool } from 'mysql2/promise';

// Must execute mockModule before any dynamic imports of the internal codebase
jest.unstable_mockModule('@/services/validation.service.js', () => ({
    validateSql: jest.fn()
}));

jest.unstable_mockModule('@/utils/logger.js', () => ({
    logger: {
        error: jest.fn()
    }
}));

describe('queryService', () => {
    let mockPool: jest.Mocked<Pool>;
    let execute: any;
    let validateSqlMock: jest.Mock<any>;
    let errorFactory: any;

    beforeAll(async () => {
        const queryService = await import('@/services/query.service.js');
        execute = queryService.execute;

        const validationService = await import('@/services/validation.service.js');
        validateSqlMock = validationService.validateSql as jest.Mock<any>;

        const errorsTypes = await import('@/types/errors.types.js');
        errorFactory = errorsTypes.ErrorFactory;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockPool = {
            execute: jest.fn()
        } as unknown as jest.Mocked<Pool>;
    });

    describe('execute', () => {
        it('should execute a valid queries successfully with pagination', async () => {
            validateSqlMock.mockResolvedValue(undefined);

            // 1. Count query
            mockPool.execute.mockResolvedValueOnce([
                [ { total: 15 } ]
            ] as any);

            // 2. Data query
            mockPool.execute.mockResolvedValueOnce([
                [ { id: 1, name: 'Test' }, { id: 2, name: 'Test 2' } ], // rows
                [ { name: 'id' }, { name: 'name' } ] // fields
            ] as any);

            const sql = 'SELECT * FROM users';

            const result = await execute(sql, mockPool, 1, 10);

            expect(validateSqlMock).toHaveBeenCalledWith(sql);
            expect(mockPool.execute).toHaveBeenCalledTimes(2);

            expect(mockPool.execute).toHaveBeenNthCalledWith(1, 'SELECT COUNT(*) as total FROM (SELECT * FROM users) AS count_query_wrapper');
            expect(mockPool.execute).toHaveBeenNthCalledWith(2, 'SELECT * FROM (SELECT * FROM users) AS data_query_wrapper LIMIT ? OFFSET ?', [ '10', '0' ]);

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.columns).toEqual([ 'id', 'name' ]);
                expect(result.data.rowCount).toBe(2);
                expect(result.data.totalRows).toBe(15);
                expect(result.data.totalPages).toBe(2);
                expect(result.data.page).toBe(1);
                expect(result.data.pageSize).toBe(10);
            }
        });

        it('should throw an error if SQL validation fails', async () => {
            const mockError = errorFactory.badRequest('Invalid SQL');
            validateSqlMock.mockRejectedValue(mockError);

            await expect(execute('DELETE FROM users', mockPool)).rejects.toThrow('Invalid SQL');
            expect(mockPool.execute).not.toHaveBeenCalled();
        });

        it('should handle timeout errors correctly', async () => {
            jest.useFakeTimers();

            validateSqlMock.mockResolvedValue(undefined);

            // Make DB promise resolve after timeout to simulate a hang without memory leaking
            mockPool.execute.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50000)));

            const executePromise = execute('SELECT SLEEP(40)', mockPool);

            const assertPromise = expect(executePromise).rejects.toThrow('Database execution failed: Query excedeu tempo limite');

            // Fast-forward past the QUERY_TIMEOUT (30_000ms) and flush promises
            await jest.advanceTimersByTimeAsync(31000);

            await assertPromise;

            jest.clearAllTimers();
            jest.useRealTimers();
        });

        it('should structure caught database errors via ErrorFactory', async () => {
            validateSqlMock.mockResolvedValue(undefined);

            const dbError = new Error('Connection lost');
            mockPool.execute.mockRejectedValueOnce(dbError);

            await expect(execute('SELECT * FROM random_table', mockPool)).rejects.toThrow('Database execution failed: Connection lost');
        });

        it('should strip trailing semicolons from queries', async () => {
            validateSqlMock.mockResolvedValue(undefined);
            mockPool.execute.mockResolvedValue([
                [ { total: 0 } ],
                [ [], [] ]
            ] as any);

            await execute('SELECT * FROM data;', mockPool, 1, 10);

            expect(mockPool.execute).toHaveBeenNthCalledWith(1, 'SELECT COUNT(*) as total FROM (SELECT * FROM data) AS count_query_wrapper');
        });
    });
});
