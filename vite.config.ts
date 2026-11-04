import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // The React Compiler injects memo-cache branches that would distort unit-test
    // coverage, so it's skipped under Vitest. e2e tests run against the compiled build.
    ...(process.env.VITEST ? [] : [babel({ presets: [reactCompilerPreset()] })]),
  ],
})
