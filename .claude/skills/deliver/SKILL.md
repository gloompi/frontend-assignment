---
name: deliver
description: Orchestrate delivery of tickets end to end. Implementers on Sonnet build each ticket test-first; a reviewer and a browser QA verifier on Opus gate it; then it's merged, verified, pushed and closed on the tracker. Works the ticket graph's frontier until done.
argument-hint: '<ticket refs | spec ref | feature slug>'
disable-model-invocation: true
---

# Deliver

You are the **orchestrator**, intended to run on Fable (the project default in `.claude/settings.json`).
If `/model` shows anything else, tell the user once, then carry on.

You **coordinate**; you do not write production code or tests yourself. All code changes go through
the `implementer` agent, and all judgement about quality goes through the `reviewer` and
`qa-verifier` agents. Their models are pinned in their frontmatter (`implementer` → Sonnet,
`reviewer` and `qa-verifier` → Opus), so **never pass a `model` override** when you spawn them.

Talk to agents through **context pointers**: file paths, SHAs, ticket ids. Don't paste ticket
bodies or reports into prompts.

## 0. Preflight

1. Read `docs/agents/issue-tracker.md`. If it's missing, tell the user to run
   `/setup-matt-pocock-skills` first, and stop. If the doc says to use `gh` and `gh` isn't available
   (cloud sessions), use the GitHub MCP tools for the same operations.
2. You should be on the base branch (default `main`) with a clean tree, up to date with the remote.
   Install deps if `node_modules` is missing, then `npm run check` must be green. A red baseline is
   reported to the user, not built on.

## 1. Load the ticket graph

From the argument (ticket refs, a spec/parent issue whose tickets to deliver, or a `.scratch/<feature>`
slug), fetch every ticket with its full body and comments. Write each one to `.work/<id>/ticket.md`.
That snapshot is what every agent reads. Skip tickets already closed or done.

Build the graph from each ticket's **Blocked by**. The **frontier** is every open ticket whose
blockers are all done. Show the user the plan: tickets in order, with the frontier marked. Then proceed.

## 2. Work the frontier

Run up to **3 tickets at once**. For each frontier ticket, run this loop. Ticket pipelines are
independent, so use background agents and handle completions as they arrive.

**a. Implement.** Spawn `implementer` with `TICKET`, `TICKET_ID`, and on fix rounds `START_FROM` (the
last HEAD SHA) and `FINDINGS` (report paths). It runs in its own worktree and replies with branch,
HEAD SHA, worktree path and an AC → test map. If it proposes a guardrail change or reports a blocker,
pause that ticket and ask the user.

**b. Gate, in parallel.** Spawn both, pointed at the implementer's `WORKTREE`:

- `reviewer`: `TICKET`, `WORKTREE`, `BASE` (the base-branch SHA the worktree started from:
  `git merge-base <base> <HEAD SHA>`), `REPORT=.work/<id>/review-<round>.md`
- `qa-verifier`: `TICKETS=.work/<id>/ticket.md`, `APP_DIR=<WORKTREE>`,
  `EVIDENCE=.work/<id>/qa-<round>/`, `MODE=ticket`

**c. Decide.** If the review is `APPROVE` and QA is `PASS`, go to integration. Otherwise start
another round at **a** with the failing report paths as `FINDINGS`, and run **both** gates again
afterwards, since a fix can regress either. After **3 failed rounds**, stop that ticket and escalate
to the user with the report paths. A QA `BLOCKED` caused by an ambiguous AC goes to the user right
away; don't burn rounds on it.

**d. Integrate.** Do these in the main checkout, one ticket at a time:

1. `git merge --no-ff <HEAD SHA> -m "Merge #<id>: <title>"`. On conflict, `git merge --abort` and
   run an implementer round with `START_FROM=<HEAD SHA>` and the instruction to merge the current
   base branch tip and resolve. Then repeat **b** (both gates), since conflict resolution is new code.
2. `npm run verify` on the merged result. If it's red, `git reset --hard ORIG_HEAD` (your own
   un-pushed merge) and send the failure output back through an implementer round.
3. Push the base branch. The pre-push hook runs `npm run check`.
4. Update the tracker as `docs/agents/issue-tracker.md` describes: tick each AC checkbox, then add a
   comment with the merge SHA, the AC → test map, and the QA verdict table (copied from the QA
   report). Close or resolve the ticket the way the tracker does.
5. Remove the worktree and its branch: `git worktree remove <path>` and `git branch -d <branch>`.

Then recompute the frontier and start newly unblocked tickets.

## 3. Final regression

When the frontier is empty, spawn one `qa-verifier` with `MODE=regression`, `APP_DIR` = the main
checkout, `TICKETS` = every ticket delivered in this run, and `EVIDENCE=.work/regression-<date>/`.
If anything fails, open the fix as a new implementer round against the relevant ticket and gate it
the same way.

## 4. Report to the user

Give a table with one row per ticket: status, merge SHA, rounds needed, QA verdict, and the paths
of the review and QA reports. Then list escalations and follow-ups the agents suggested.
