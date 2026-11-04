#!/usr/bin/env node
// Builds a checkout and serves its production build on a free port, for manual QA.
// Usage: node scripts/qa/serve.mjs [--dir <checkout>] [--url-file <path>]
// Prints APP_URL=<url> once ready (and writes the URL to --url-file); runs until killed.
import { spawn, spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import path from 'node:path'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
  options: { dir: { type: 'string', default: process.cwd() }, 'url-file': { type: 'string' } },
})
const dir = path.resolve(values.dir)

const port = await new Promise((resolve, reject) => {
  const server = createServer()
  server.on('error', reject)
  server.listen(0, () => {
    const address = server.address()
    server.close(() => {
      resolve(address.port)
    })
  })
})

console.log(`Building ${dir} ...`)
const build = spawnSync('npx', ['vite', 'build', '--logLevel', 'error'], {
  cwd: dir,
  stdio: 'inherit',
})
if (build.status !== 0) process.exit(build.status ?? 1)

const url = `http://localhost:${String(port)}`
const preview = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  cwd: dir,
  stdio: ['ignore', 'pipe', 'inherit'],
})
preview.stdout.on('data', (chunk) => {
  if (!String(chunk).includes('Local')) return
  console.log(`APP_URL=${url}`)
  if (values['url-file']) writeFileSync(values['url-file'], url)
})
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    preview.kill()
    process.exit(0)
  })
}
preview.on('exit', (code) => process.exit(code ?? 0))
