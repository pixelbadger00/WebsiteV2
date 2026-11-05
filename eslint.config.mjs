// Native flat config. eslint-config-next 16 ships flat-config arrays for
// core-web-vitals and typescript, so we import them directly instead of the
// legacy FlatCompat/eslintrc bridge (which crashes validating the plugin
// objects under current eslint).
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
