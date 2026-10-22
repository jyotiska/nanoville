import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
      "src/data/**/*.ts",
      "src/lib/**/*.ts",
      "src/features/discussion/*.ts",
      "src/features/discussion/client/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/server/**", "@/features/**/server/**", "**/server/**"],
          message: "Server execution belongs behind API routes; shared and client modules must remain browser-safe.",
        }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
