module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/test_cases/**/*'],
    testEnvironmentOptions: {
        node: {
            experimentalVmModules: true
        }
    },
    transform: {},
}