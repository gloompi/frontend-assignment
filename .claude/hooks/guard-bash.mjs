#!/usr/bin/env node
// PreToolUse hook for Bash. Blocks commands that bypass the repo's guardrails.
// Usage: node guard-bash.mjs [role]
//   (no role)    applies to every session: no hook bypasses, no force pushes
//   implementer  additionally: no `git push` (the orchestrator integrates and pushes)
//   readonly     additionally: no git history changes at all (reviewer, qa-verifier)
import { readFileSync } from 'node:fs'

const role = process.argv[2] ?? 'all'
const input = JSON.parse(readFileSync(0, 'utf8'))
const raw = String(input.tool_input?.command ?? '')

// Ignore quoted text and heredoc bodies so commit messages can mention these flags.
const command = raw
  .replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?\n\s*\1\b/g, ' ')
  .replace(/'[^']*'/g, "''")
  .replace(/"(?:\\.|[^"\\])*"/g, '""')

const rules = [
  [
    /--no-verify\b/,
    'Skipping git hooks (--no-verify) is not allowed. Fix the failing check instead.',
  ],
  [/\bgit\s+commit\b[^|;&]*\s-[a-zA-Z]*n/, 'Skipping git hooks (git commit -n) is not allowed.'],
  [/\bHUSKY=0\b/, 'Disabling husky (HUSKY=0) is not allowed.'],
  [/core\.hooksPath/, 'Changing core.hooksPath is not allowed.'],
  [
    /\bgit\s+push\b[^|;&]*(\s--force(-with-lease)?\b|\s-[a-zA-Z]*f\b|\s\+\S)/,
    'Force pushes are not allowed. Ask the human to do it if it is really needed.',
  ],
]

if (role === 'implementer' || role === 'readonly') {
  rules.push([/\bgit\s+push\b/, 'Only the orchestrator pushes. Commit locally and report back.'])
}
if (role === 'readonly') {
  rules.push([
    /\bgit\s+(commit|merge|rebase|reset|cherry-pick|revert|am|apply|checkout\s+--|restore|clean|stash|branch\s+-[dDmM]|worktree\s+remove)\b/,
    'This agent is read-only: it must not change git state or files. Report findings instead.',
  ])
}

for (const [pattern, message] of rules) {
  if (pattern.test(command)) {
    process.stderr.write(`Blocked by .claude/hooks/guard-bash.mjs: ${message}\n`)
    process.exit(2)
  }
}
