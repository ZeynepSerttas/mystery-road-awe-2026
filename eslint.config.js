import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-var": "error",
    },
  },
  eslintConfigPrettier,
  {
    ignores: ["dist/", "public/", "node_modules/"],
  },
];
