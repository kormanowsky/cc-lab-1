/** @type {import('ts-jest').JestConfigWithTsJest} **/

const isCI = Boolean(process.env.CI)

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  collectCoverage: isCI
};