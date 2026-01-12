module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/test_cases/**/*'],
    transformIgnorePatterns: [
        'node_modules/(?!(@aws-sdk|@smithy)/.*/)'
    ],
    transform: {},
};