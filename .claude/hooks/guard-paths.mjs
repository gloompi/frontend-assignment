#!/usr/bin/env node
// PreToolUse hook for file tools. Scopes what each agent may read or write.
// Usage: node guard-paths.mjs <mode>
//   protect-guardrails  deny writes to guardrail config (implementer)
//   work-only           deny writes outside .work/ and the OS temp dir (reviewer, qa-verifier)
//   black-box           deny reads of src/ and e2e/ (qa-verifier tests behaviour, not code)
import { existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const PROTECTED = [
  'eslint.config.js',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'vitest.config.ts',
  'playwright.config.ts',
  '.prettierrc.json',
  '.prettierignore',
  '.nvmrc',
  'CLAUDE.md',
  'skills-lock.json',
  'src/test/setup.ts',
  'e2e/fixtures.ts',
  '.husky/',
  '.github/',
  '.claude/',
  'scripts/qa/',
]

const mode = process.argv[2]
const input = JSON.parse(readFileSync(0, 'utf8'))
const toolInput = input.tool_input ?? {}
const cwd = input.cwd ?? process.cwd()
const target = toolInput.file_path ?? toolInput.notebook_path ?? toolInput.path
if (!target) process.exit(0)

const absolute = path.resolve(cwd, String(target))

// The checkout (main repo or worktree) containing the path: nearest ancestor with a .git entry.
function checkoutRoot(file) {
  let dir = path.dirname(file)
  for (;;) {
    if (existsSync(path.join(dir, '.git'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

const root = checkoutRoot(absolute)
const relative = root ? path.relative(root, absolute).split(path.sep).join('/') : undefined

function deny(message) {
  process.stderr.write(`Blocked by .claude/hooks/guard-paths.mjs (${mode}): ${message}\n`)
  process.exit(2)
}

const inside = (dir) => absolute === dir || absolute.startsWith(dir + path.sep)

switch (mode) {
  case 'protect-guardrails': {
    const hit =
      relative && PROTECTED.find((p) => (p.endsWith('/') ? relative.startsWith(p) : relative === p))
    if (hit) {
      deny(
        `${relative} is guardrail config. Do not change it; if the ticket truly needs a change, stop and report the proposed change to the orchestrator.`,
      )
    }
    break
  }
  case 'work-only': {
    const projectDir = process.env.CLAUDE_PROJECT_DIR ?? root ?? cwd
    if (!inside(path.join(projectDir, '.work')) && !inside(tmpdir())) {
      deny(
        `this agent may only write under ${path.join(projectDir, '.work')} (reports, scripts, screenshots).`,
      )
    }
    break
  }
  case 'black-box': {
    if (relative && /^(src|e2e)(\/|$)/.test(relative)) {
      deny('QA is black-box: verify behaviour in the browser, not by reading source or tests.')
    }
    break
  }
  default:
    deny(`unknown mode "${String(mode)}"`)
}
