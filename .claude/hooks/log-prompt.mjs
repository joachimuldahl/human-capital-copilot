#!/usr/bin/env node
// UserPromptSubmit hook: appends every prompt verbatim to prompts/PROMPT_LOG_AUTO.md.
// Rules: never write to stdout (Claude Code adds it to the model's context), always exit 0
// (exit 2 would block the prompt), log errors to .claude/hooks/log-prompt.err.
// Prompts starting with "nolog:" (any case) are skipped.
import { appendFileSync, existsSync, mkdirSync, realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const hooksDir = dirname(fileURLToPath(import.meta.url))
const errFile = join(hooksDir, 'log-prompt.err')

const HEADER = `# Prompt log (automatic): Human Capital Copilot
Captured verbatim by the UserPromptSubmit hook in .claude/hooks/log-prompt.mjs. Prompts starting with "nolog:" are skipped.
Hand-written task summaries (C-entries) are in prompts/PROMPT_LOG.md and reference the timestamps below.

`

const pad = (n) => String(n).padStart(2, '0')

/** "2026-11-26 14:05:12 +01:00" in local time. */
export function localTimestamp(d = new Date()) {
  const off = -d.getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const abs = Math.abs(off)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

/** Markdown entry for one prompt. Body is quoted line by line. */
export function formatEntry({ date, sessionId, text, raw }) {
  const head = `### ${localTimestamp(date)} · session ${String(sessionId ?? 'unknown').slice(0, 8)}\n`
  const body =
    text !== undefined
      ? text
          .split(/\r?\n/)
          .map((l) => (l === '' ? '>' : `> ${l}`))
          .join('\n')
      : `(prompt field missing, raw hook input:)\n\n\`\`\`json\n${raw}\n\`\`\``
  return `${head}${body}\n\n`
}

export function appendEntry(logFile, entry) {
  mkdirSync(dirname(logFile), { recursive: true })
  if (!existsSync(logFile)) appendFileSync(logFile, HEADER)
  appendFileSync(logFile, entry)
}

function logError(err) {
  try {
    appendFileSync(errFile, `[${localTimestamp()}] ${err && err.stack ? err.stack : String(err)}\n`)
  } catch {
    // nothing else we can do; never block the prompt
  }
}

async function main() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk
  let input = null
  try {
    input = JSON.parse(raw)
  } catch (e) {
    logError(e)
  }
  const text = input && typeof input.prompt === 'string' ? input.prompt : undefined
  if (text !== undefined && /^nolog:/i.test(text.trimStart())) return

  const projectDir = process.env.CLAUDE_PROJECT_DIR || (input && input.cwd) || join(hooksDir, '..', '..')
  const logFile = join(projectDir, 'prompts', 'PROMPT_LOG_AUTO.md')
  appendEntry(logFile, formatEntry({ date: new Date(), sessionId: input && input.session_id, text, raw }))
}

// Only run when executed directly (the backfill script imports the helpers).
const isMain = (() => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
})()
if (isMain) {
  main()
    .catch(logError)
    .finally(() => process.exit(0))
}
