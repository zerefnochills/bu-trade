// ============================================================================
// BU Trade — Live HTTP Endpoints & Assets Verification Script
// Tests each route over HTTP on localhost:3000
// ============================================================================

async function testHttpEndpoints() {
  const baseUrl = 'http://localhost:3000';
  console.log(`\nTesting all live HTTP endpoints on ${baseUrl}...\n`);

  const routes = [
    { path: '/', expectedStatus: 200, label: 'Home Page' },
    { path: '/feed', expectedStatus: 200, label: 'Student Feed' },
    { path: '/feedbacks', expectedStatus: 200, label: 'Feedbacks Legacy Route' },
    { path: '/trade-borrow', expectedStatus: 200, label: 'Trade & Borrow' },
    { path: '/sell', expectedStatus: 200, label: 'Sell an Item' },
    { path: '/login', expectedStatus: 200, label: 'Student Login' },
    { path: '/rules', expectedStatus: 200, label: 'Campus Safety Rules' },
    { path: '/safety', expectedStatus: 200, label: 'Safety Guidelines Alias' },
    { path: '/profile', expectedStatus: 200, label: 'Profile (Unauth Redirect to Login)' },
    { path: '/onboarding', expectedStatus: 200, label: 'Onboarding (Unauth Redirect to Login)' },
  ];

  let passed = 0;
  let failed = 0;
  let cssHrefs: string[] = [];

  for (const r of routes) {
    try {
      const res = await fetch(`${baseUrl}${r.path}`, {
        redirect: 'manual',
      });

      const status = res.status;
      const isRedirect = status === 307 || status === 308 || status === 302;
      const effectiveStatus = (r.path === '/profile' || r.path === '/onboarding') && isRedirect ? 200 : status;

      if (status === 200 || (isRedirect && (r.path === '/profile' || r.path === '/onboarding'))) {
        console.log(`  ✓ [HTTP ${status}] ${r.label} (${r.path})`);
        passed++;

        if (status === 200) {
          const html = await res.text();
          // Extract CSS stylesheets from HTML
          const matches = html.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/g);
          if (matches) {
            matches.forEach((m) => {
              const url = m.replace('href="', '').replace('"', '');
              if (!cssHrefs.includes(url)) cssHrefs.push(url);
            });
          }
        }
      } else {
        console.error(`  ✗ [HTTP ${status}] FAIL: ${r.label} (${r.path}) — Expected ${r.expectedStatus}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`  ✗ [ERROR] FAIL: ${r.label} (${r.path}): ${err.message}`);
      failed++;
    }
  }

  // Verify CSS files are actually being served (NOT 404!)
  console.log('\n--- VERIFYING CSS STYLESHEETS ---');
  for (const cssPath of cssHrefs) {
    try {
      const cssRes = await fetch(`${baseUrl}${cssPath}`);
      if (cssRes.status === 200) {
        const cssContent = await cssRes.text();
        const hasTailwind = cssContent.includes('border-box') || cssContent.includes('--tw-');
        console.log(`  ✓ [HTTP 200] CSS Loaded: ${cssPath} (${cssContent.length} bytes, Tailwind Verified: ${hasTailwind})`);
        passed++;
      } else {
        console.error(`  ✗ [HTTP ${cssRes.status}] FAIL: CSS failed to load: ${cssPath}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`  ✗ CSS Fetch Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n======================================================================');
  console.log(`HTTP ENDPOINT RESULTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testHttpEndpoints();
