import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Guardrail: any console.error/console.warn during a test (React act() warnings,
// prop-type errors, failed effects...) fails that test.
const consoleProblems: string[] = []

beforeEach(() => {
  consoleProblems.length = 0
  for (const level of ['error', 'warn'] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      consoleProblems.push(`console.${level}: ${args.map(String).join(' ')}`)
    })
  }
})

afterEach(() => {
  cleanup()
  if (consoleProblems.length > 0) {
    throw new Error(`Unexpected console output during test:\n${consoleProblems.join('\n')}`)
  }
})
