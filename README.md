# mn_school_db_v2

## Testing

The application includes comprehensive test coverage with unit, integration, and end-to-end tests.

### Setup Test Environment

Before running tests, make sure to:

1. Create a test database: `mn_school_test`
2. Set up test environment variables in `.env.test`

### Running Tests

- Run all tests: `npm test`
- Run unit tests only: `npm run test:unit`
- Run integration tests only: `npm run test:integration`
- Run end-to-end tests only: `npm run test:e2e`
- Generate code coverage report: `npm run test:coverage`
- Run tests in watch mode: `npm run test:watch`
- Run authentication tests only: `npm run test:auth`

### Test Coverage

The project maintains high test coverage with the following thresholds:

- Overall: 80% lines, 70% branches, 75% functions
- Auth Module: 90% lines, 85% branches, 90% functions

### Continuous Integration

Run tests in CI environment: `npm run test:ci`
