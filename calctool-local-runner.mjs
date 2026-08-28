import { createHash } from 'node:crypto'
import { lstat, readFile, realpath } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import { runFinalGate } from './calctool-runtime.mjs'

const LOCAL_GATE_SCHEMA = 'calctool.local-final-gate/1.0'

function safeRelativePath(value) {
  if (typeof value !== 'string' || !value || value !== value.normalize('NFC')
    || isAbsolute(value) || /^[A-Za-z]:/.test(value) || value.includes('\\')
    || /[\u0000-\u001f\u007f]/.test(value)
    || value.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('enginePath must be a safe relative path')
  }
  return value
}

function assertInside(root, target) {
  const path = relative(root, target)
  if (path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith('../'))) return
  throw new Error('enginePath escapes repositoryRoot')
}

async function localEngineFile(repository, enginePath) {
  const root = await realpath(resolve(repository))
  const rootStatus = await lstat(root)
  if (rootStatus.isSymbolicLink() || !rootStatus.isDirectory()) {
    throw new Error('repositoryRoot must be a real directory')
  }
  const path = safeRelativePath(enginePath)
  const target = resolve(root, ...path.split('/'))
  assertInside(root, target)
  const status = await lstat(target)
  if (status.isSymbolicLink() || !status.isFile() || await realpath(target) !== target) {
    throw new Error('enginePath must be a real file')
  }
  return { root, path, target }
}

async function runLocalFinalGate(input) {
  const file = await localEngineFile(input.repositoryRoot, input.enginePath)
  const source = await readFile(file.target)
  let engine
  try {
    engine = JSON.parse(source.toString('utf8'))
  } catch (error) {
    throw new Error(`enginePath is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
  const gate = runFinalGate(engine, {})
  const digest = createHash('sha256').update(source).digest('hex')
  return {
    schemaVersion: LOCAL_GATE_SCHEMA,
    status: gate.passed ? 'complete' : 'blocked',
    authority: 'trusted-local-runner',
    enginePath: file.path,
    engineSha256: digest,
    gate,
    validation: {
      valid: gate.passed,
      guarantee: gate.passed ? 'local-completion-gate-green' : 'local-completion-gate-blocked',
      findings: gate.findings,
    },
  }
}

export { LOCAL_GATE_SCHEMA, runLocalFinalGate }
