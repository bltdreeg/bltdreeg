// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  // الطبقات (زي layering_test.dart في Flutter): الواجهة → hooks → actions → api. الـ types مسموحة.
  {
    files: ["src/components/**", "src/screens/**", "src/app/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/lib/actions/*", "@/lib/api/*"], allowTypeImports: true, message: "UI reads data through lib/hooks." }] }],
    },
  },
  {
    files: ["src/lib/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/components/*", "@/screens/*", "@/app/*"], message: "lib/ must not depend on UI." }] }],
    },
  },
]);
