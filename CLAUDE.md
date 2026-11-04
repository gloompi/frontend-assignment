# frontend-assignment

React 19 + TypeScript (strict) + Vite 8, with the React Compiler enabled.

## Commands

| Command            | What it does                                                                      |
| ------------------ | --------------------------------------------------------------------------------- |
| `npm run dev`      | Dev server                                                                        |
| `npm run check`    | **Fast gate:** format check, lint, typecheck, unit tests with coverage thresholds |
| `npm run verify`   | **Full gate:** `check` + production build + e2e tests                             |
| `npm test`         | Unit tests once (`npx vitest run <file>` for one file)                            |
| `npm run test:e2e` | Playwright e2e tests against a production build (desktop + mobile)                |
| `npm run format`   | Prettier write                                                                    |

## Guardrails

Every layer below is enforced. Make a check pass by fixing the code, never by weakening the check.

- **TypeScript:** `strict`, plus `noUncheckedIndexedAccess`, `noImplicitReturns`,
  `noPropertyAccessFromIndexSignature` and friends.
- **ESLint** (`--max-warnings=0`): `typescript-eslint` strict + stylistic type-checked, React Hooks,
  `jsx-a11y` strict, Vitest and Playwright rules. Focused or skipped tests are errors, and every
  `eslint-disable` needs a description.
- **Unit tests** fail on any `console.error` / `console.warn` (`src/test/setup.ts`). Coverage
  thresholds are 80% for lines, branches, functions and statements.
- **e2e tests** fail on any console error, page error or failed request (`e2e/fixtures.ts`), and
  `checkA11y()` runs axe (WCAG 2.1 AA).
- **Git hooks** (husky): pre-commit runs prettier, eslint and related unit tests on staged files,
  then a typecheck. Pre-push runs `npm run check`.
- **CI** (`.github/workflows/ci.yml`) runs the `check` steps, the build, and the e2e tests.
- **Claude Code hooks** (`.claude/hooks/`) block `--no-verify`, `HUSKY=0` and force pushes for
  every session, and scope each pipeline agent (see below).

**Protected files** are changed only with explicit human approval: `eslint.config.js`,
`tsconfig*.json`, `vitest.config.ts`, `playwright.config.ts`, `.prettierrc.json`, `.prettierignore`,
`src/test/setup.ts`, `e2e/fixtures.ts`, `.husky/`, `.github/`, `.claude/`, `scripts/qa/`, this file,
and the `scripts` / `lint-staged` sections of `package.json`.

## Coding standards

- Components are function components with named props types. Use semantic, accessible HTML
  (real buttons, labels, landmarks, headings).
- Keep domain logic in plain TypeScript modules, out of components, so it's testable without React.
- No `any`, no non-null `!`, no `@ts-ignore`. A `@ts-expect-error` needs a reason.
- No `console.log` in committed code.
- Use the project's domain vocabulary (`GLOSSARY.md` once it exists) in names and tests.

## Testing

**Unit and component tests** (Vitest + Testing Library) are co-located as `*.test.ts(x)` next to the
code. The pre-agreed seams are:

- **Domain modules:** test their exported functions with plain inputs and outputs.
- **Components:** render them and interact as a user would (`userEvent`). Query by role, label or
  text. Assert what's visible, not internal state.
- **Hooks:** test them through a component that uses them, unless the hook is itself a public
  module interface.
- **Network/IO:** mock at the module boundary (the API client), never inside components.

**e2e tests** (Playwright) live in `e2e/<feature>.spec.ts` and import `{ test, expect }` from
`./fixtures`. Each ticket's acceptance criteria map to tests titled `AC<n>: <criterion>` and tagged
`@ticket-<id>`, for example `npx playwright test --grep @ticket-12`.

## Agent pipeline

Tickets come from `/to-tickets` and are delivered with **`/deliver <tickets | spec>`**:

| Role         | Agent                        | Model                   | Does                                                                                  |
| ------------ | ---------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| Orchestrator | main session                 | Fable (project default) | Works the ticket graph, spawns agents, merges, runs `verify`, pushes, updates tracker |
| Implementer  | `.claude/agents/implementer` | Sonnet                  | One ticket, test-first, in its own worktree. The only role that writes code           |
| Reviewer     | `.claude/agents/reviewer`    | Opus                    | Read-only: re-runs checks, guardrail integrity, AC → test traceability, `code-review` |
| QA verifier  | `.claude/agents/qa-verifier` | Opus                    | Black-box: drives the built app in Chromium and verifies every AC with screenshots    |

Pipeline working files (ticket snapshots, reports, screenshots) live in the git-ignored `.work/`.
