/** @type {import("prettier").Config} */
const config = {
  singleQuote: true,
  semi: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 80,
  jsxBracketSameLine: false,
  jsxSingleQuote: true,
  useTabs: false,
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
}

module.exports = config
