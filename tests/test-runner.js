/**
 * test-runner.js
 * Runner de testes automatizados para Node.js.
 * Execução: node tests/test-runner.js
 *
 * Dependências: Node.js >= 18 (fetch nativo), fs, path.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname }            from 'path';
import { fileURLToPath }            from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..');

/* ------------------------------------------------------------------
 * Utilitários de teste
 * ------------------------------------------------------------------ */

let _passed = 0;
let _failed = 0;
const _results = [];

function test(name, fn) {
  try {
    fn();
    _passed++;
    _results.push({ status: 'PASS', name });
    process.stdout.write('.');
  } catch (err) {
    _failed++;
    _results.push({ status: 'FAIL', name, error: err.message });
    process.stdout.write('F');
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(a, b, message) {
  if (a !== b) throw new Error(message || `Expected ${b}, got ${a}`);
}

function assertArray(val, message) {
  if (!Array.isArray(val)) throw new Error(message || `Expected array, got ${typeof val}`);
}

function assertNonEmpty(val, message) {
  if (!val || (Array.isArray(val) && val.length === 0) || val === '')
    throw new Error(message || 'Expected non-empty value');
}

/* ------------------------------------------------------------------
 * Carregamento dos JSONs
 * ------------------------------------------------------------------ */

function loadJSON(filename) {
  const path = join(ROOT, 'data', filename);
  if (!existsSync(path)) throw new Error(`Arquivo não encontrado: data/${filename}`);
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}

/* ------------------------------------------------------------------
 * Importação dos suites de teste
 * ------------------------------------------------------------------ */

import { runDataTests }   from './data-tests.js';
import { runModuleTests } from './module-tests.js';
import { runEngineTests } from './engine-tests.js';
import { runEssayTests }  from './data-tests.js';

/* ------------------------------------------------------------------
 * Execução
 * ------------------------------------------------------------------ */

console.log('\nAristóteles — Test Runner');
console.log('='.repeat(50));

// Carrega dados
let data;
try {
  data = {
    modules:   loadJSON('modules.json'),
    authors:   loadJSON('authors.json'),
    schools:   loadJSON('schools.json'),
    concepts:  loadJSON('concepts.json'),
    texts:     loadJSON('texts.json'),
    lessons:   loadJSON('lessons.json'),
    exercises: loadJSON('exercises.json'),
    arguments: loadJSON('arguments.json'),
    timeline:  loadJSON('timeline.json'),
    essays:    loadJSON('essays.json')
  };
  console.log('Dados carregados com sucesso.\n');
} catch (err) {
  console.error(`\nErro ao carregar dados: ${err.message}`);
  process.exit(1);
}

// Executa suites
console.log('Executando testes:');

runDataTests(data, test, assert, assertEqual, assertArray, assertNonEmpty);
runModuleTests(data, test, assert, assertEqual, assertArray, assertNonEmpty);
runEngineTests(test, assert, assertEqual, assertArray, assertNonEmpty);
runEssayTests(data, test, assert, assertEqual, assertArray, assertNonEmpty);

// Relatório
console.log('\n\n' + '='.repeat(50));
console.log(`Resultado: ${_passed} passou, ${_failed} falhou\n`);

if (_failed > 0) {
  console.log('Falhas:');
  _results
    .filter(r => r.status === 'FAIL')
    .forEach(r => console.log(`  FAIL: ${r.name}\n       ${r.error}`));
  process.exit(1);
} else {
  console.log('Todos os testes passaram.');
  process.exit(0);
}
