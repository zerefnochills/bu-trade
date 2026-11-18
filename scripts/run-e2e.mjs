#!/usr/bin/env node
/**
 * BU Trade — Canonical E2E Test Runner
 * 
 * Executes all registered opaque-box E2E test suites across Tiers 1-4.
 * Outputs formatted test results, execution timings, and 4-tier summary table.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { E2EHarness, getRegisteredTests } from '../e2e/harness.mjs';

// ANSI escape codes for clean terminal output
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

async function main() {
  const startTime = performance.now();
  console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}            BU TRADE — END-TO-END VERIFICATION SUITE                  ${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  // 1. Discover and load test modules from e2e/
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const e2eDir = path.resolve(__dirname, '../e2e');

  if (!fs.existsSync(e2eDir)) {
    console.error(`${RED}Error: e2e directory not found at ${e2eDir}${RESET}`);
    process.exit(1);
  }

  const files = fs.readdirSync(e2eDir)
    .filter(f => (f.endsWith('.mjs') || f.endsWith('.js')) && f !== 'harness.mjs')
    .sort();

  console.log(`${DIM}Discovered ${files.length} test module(s) in e2e/:${RESET}`);
  for (const file of files) {
    console.log(`  ${DIM}• loading e2e/${file}...${RESET}`);
    const filePath = path.join(e2eDir, file);
    await import(pathToFileURL(filePath).href);
  }

  // 2. Retrieve registered test cases
  const allTests = getRegisteredTests();
  if (allTests.length === 0) {
    console.log(`${YELLOW}No test cases registered.${RESET}\n`);
    process.exit(0);
  }

  // CLI argument filtering (optional --tier or --filter)
  const args = process.argv.slice(2);
  let filterTier = null;
  let filterQuery = null;

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      filterTier = arg.split('=')[1].trim();
    } else if (arg.startsWith('--filter=')) {
      filterQuery = arg.split('=')[1].trim().toLowerCase();
    }
  }

  const testsToRun = allTests.filter(t => {
    if (filterTier && !t.tier.toLowerCase().includes(filterTier.toLowerCase())) {
      return false;
    }
    if (filterQuery) {
      const matchId = t.id.toLowerCase().includes(filterQuery);
      const matchName = t.name.toLowerCase().includes(filterQuery);
      return matchId || matchName;
    }
    return true;
  });

  console.log(`\n${BOLD}Executing ${testsToRun.length} registered test case(s)...${RESET}\n`);

  // 3. Execute tests with harness isolation
  const harness = new E2EHarness();
  const results = [];
  let currentTier = '';

  for (const test of testsToRun) {
    if (test.tier !== currentTier) {
      currentTier = test.tier;
      console.log(`\n${BOLD}${CYAN}--- ${currentTier.toUpperCase()} ---${RESET}`);
    }

    // Isolate harness state before each test
    harness.reset();

    const t0 = performance.now();
    let passed = false;
    let errorMsg = null;

    try {
      await test.fn(harness);
      passed = true;
      const durationMs = (performance.now() - t0).toFixed(2);
      console.log(`  ${GREEN}✓${RESET} [${test.id}] ${test.name} ${DIM}(${durationMs}ms)${RESET}`);
      results.push({
        tier: test.tier,
        id: test.id,
        name: test.name,
        passed: true,
        duration: performance.now() - t0
      });
    } catch (err) {
      passed = false;
      errorMsg = err.message || String(err);
      const durationMs = (performance.now() - t0).toFixed(2);
      console.log(`  ${RED}✗${RESET} [${test.id}] ${test.name} ${DIM}(${durationMs}ms)${RESET}`);
      console.log(`    ${RED}↳ Error: ${errorMsg}${RESET}`);
      results.push({
        tier: test.tier,
        id: test.id,
        name: test.name,
        passed: false,
        duration: performance.now() - t0,
        error: errorMsg
      });
    }
  }

  // 4. Generate 4-Tier Summary Table
  const tierNames = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
  // Include any extra tiers discovered
  const discoveredTiers = [...new Set(results.map(r => r.tier))];
  for (const dt of discoveredTiers) {
    if (!tierNames.includes(dt)) {
      tierNames.push(dt);
    }
  }

  console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}                       4-TIER EXECUTION SUMMARY                       ${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}`);

  const colTier = 28;
  const colTotal = 8;
  const colPassed = 8;
  const colFailed = 8;
  const colRate = 12;
  const colTime = 10;

  const pad = (str, len, align = 'left') => {
    const s = String(str);
    if (s.length >= len) return s.slice(0, len);
    const spaces = ' '.repeat(len - s.length);
    return align === 'right' ? spaces + s : s + spaces;
  };

  const header = `| ${pad('Test Tier', colTier)} | ${pad('Total', colTotal, 'right')} | ${pad('Passed', colPassed, 'right')} | ${pad('Failed', colFailed, 'right')} | ${pad('Pass Rate', colRate, 'right')} | ${pad('Time (ms)', colTime, 'right')} |`;
  const sep = `|-${'-'.repeat(colTier)}-|-${'-'.repeat(colTotal)}-|-${'-'.repeat(colPassed)}-|-${'-'.repeat(colFailed)}-|-${'-'.repeat(colRate)}-|-${'-'.repeat(colTime)}-|`;

  console.log(sep);
  console.log(header);
  console.log(sep);

  let grandTotal = 0;
  let grandPassed = 0;
  let grandFailed = 0;
  let grandTime = 0;

  const tierLabels = {
    'Tier 1': 'Tier 1: Feature Coverage',
    'Tier 2': 'Tier 2: Boundary & Corner',
    'Tier 3': 'Tier 3: Pairwise Combination',
    'Tier 4': 'Tier 4: Real-World Scenarios'
  };

  for (const tier of tierNames) {
    const tierResults = results.filter(r => r.tier === tier);
    const total = tierResults.length;
    const passed = tierResults.filter(r => r.passed).length;
    const failed = total - passed;
    const duration = tierResults.reduce((acc, r) => acc + r.duration, 0);
    const rate = total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : 'N/A';

    grandTotal += total;
    grandPassed += passed;
    grandFailed += failed;
    grandTime += duration;

    const label = tierLabels[tier] || tier;
    const rateColor = failed === 0 && total > 0 ? GREEN : (failed > 0 ? RED : DIM);

    console.log(
      `| ${pad(label, colTier)} | ${pad(total, colTotal, 'right')} | ${pad(passed, colPassed, 'right')} | ${pad(failed, colFailed, 'right')} | ${rateColor}${pad(rate, colRate, 'right')}${RESET} | ${pad(duration.toFixed(1), colTime, 'right')} |`
    );
  }

  console.log(sep);
  const grandRate = grandTotal > 0 ? ((grandPassed / grandTotal) * 100).toFixed(1) + '%' : 'N/A';
  const grandColor = grandFailed === 0 && grandTotal > 0 ? GREEN : RED;
  console.log(
    `| ${BOLD}${pad('TOTAL', colTier)}${RESET} | ${BOLD}${pad(grandTotal, colTotal, 'right')}${RESET} | ${BOLD}${pad(grandPassed, colPassed, 'right')}${RESET} | ${BOLD}${pad(grandFailed, colFailed, 'right')}${RESET} | ${BOLD}${grandColor}${pad(grandRate, colRate, 'right')}${RESET} | ${BOLD}${pad(grandTime.toFixed(1), colTime, 'right')}${RESET} |`
  );
  console.log(sep);

  const totalWallTime = (performance.now() - startTime).toFixed(2);
  console.log(`\nWall Clock Time: ${totalWallTime}ms | Total Tests: ${grandTotal} | Passed: ${grandPassed} | Failed: ${grandFailed}\n`);

  if (grandFailed > 0) {
    console.error(`${BOLD}${RED}FAILED: ${grandFailed} test(s) failed.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`${BOLD}${GREEN}SUCCESS: All ${grandPassed} test(s) passed successfully!${RESET}\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error(`${RED}Fatal runner exception:${RESET}`, err);
  process.exit(1);
});
