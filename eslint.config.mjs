import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import"; // Import plugin

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        // Rất quan trọng để ESLint hiểu alias @/ trong Next.js
        typescript: true,
        node: true,
      },
    },
    rules: {
      // Tự động sắp xếp import theo nhóm
      "import/order": [
        "error",
        {
          groups: [
            "builtin",   // Các module có sẵn (fs, path...)
            "external",  // Thư viện từ node_modules (react, next...)
            "internal",  // Alias nội bộ (@/components...)
            ["parent", "sibling"], // File cấp trên hoặc cùng cấp (../, ./)
            "index",     // File index
            "object",
            "type",      // Type imports
          ],
          "newlines-between": "always", // Ép có dòng trống giữa các nhóm
          alphabetize: { order: "asc", caseInsensitive: true }, // Sắp xếp A-Z
        },
      ],
      "import/no-duplicates": "error", // Không cho phép import trùng lặp
      "import/newline-after-import": "error", // Dòng trống sau khối import
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;