/** @type {import('eslint/lib/shared/types').ConfigData} */
const config = {
  root: true,
  extends: ["next/core-web-vitals", "prettier"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
  },
}

module.exports = config
