import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
  
  // Regras customizadas para qualidade de código
  {
    rules: {
      // ==========================================
      // REGRAS DE QUALIDADE
      // ==========================================
      
      // Prevenir console.log em produção (warn para não quebrar dev)
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // Variáveis não usadas
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      
      // Preferir const
      "prefer-const": "error",
      
      // Sem var
      "no-var": "error",
      
      // ==========================================
      // REACT / NEXT.JS
      // ==========================================
      
      // Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // setState em useEffect - padrão comum em apps React
      // Desabilitar regra experimental que é muito restritiva
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      
      // Keys em listas
      "react/jsx-key": "error",
      
      // ==========================================
      // TYPESCRIPT
      // ==========================================
      
      // Preferir tipos explícitos em funções públicas
      "@typescript-eslint/explicit-function-return-type": "off",
      
      // Permitir any em casos específicos (warn em vez de error)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Sem imports não usados
      "@typescript-eslint/no-unused-expressions": "error",
    },
  },
]);

export default eslintConfig;
