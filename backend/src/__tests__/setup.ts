/**
 * Jest global setup: set required environment variables before any module loads.
 * This file is listed in jest.config.ts > setupFiles and runs before each test suite.
 */
process.env.JWT_SECRET = 'test-jwt-secret'
// Prevents prisma.ts from throwing "DATABASE_URL environment variable is required"
// when non-mocked service modules are transitively imported (e.g. via services/index.ts).
// Prisma never actually connects to the DB during tests because all service calls are mocked.
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/testdb'
