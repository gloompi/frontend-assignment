# frontend-assignment

React 19 + TypeScript + Vite (with the React Compiler enabled).

## Scripts

```bash
npm install      # install dependencies
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint     # run ESLint
npm run preview  # preview the production build
```

`npm run check` is the fast gate (format, lint, typecheck, unit tests + coverage) and
`npm run verify` is the full gate (check + build + e2e). Git hooks run them on commit and push.

## Working with Claude Code

See [`CLAUDE.md`](./CLAUDE.md) for the guardrails, testing conventions and the agent pipeline.

1. `/setup-matt-pocock-skills` (once): choose the issue tracker.
2. `/grill-with-docs` → `/to-spec` → `/to-tickets`: turn an idea into tickets with acceptance criteria.
3. `/deliver <tickets or spec>`: the orchestrator (Fable) has implementers (Sonnet) build each
   ticket test-first. A reviewer and a browser QA agent (both Opus) gate every ticket before it
   merges.
