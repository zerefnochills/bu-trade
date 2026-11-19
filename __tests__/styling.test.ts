import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from '@testing-library/react';

describe('R1 Styling & Design Tokens Configuration', () => {
  const rootDir = process.cwd();
  const globalsCssPath = path.join(rootDir, 'app', 'globals.css');
  const tailwindConfigPath = path.join(rootDir, 'tailwind.config.ts');
  const postcssConfigJsPath = path.join(rootDir, 'postcss.config.js');

  it('verifies app/globals.css contains core Tailwind directives', () => {
    expect(fs.existsSync(globalsCssPath)).toBe(true);
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

    expect(cssContent).toMatch(/@tailwind\s+base;/);
    expect(cssContent).toMatch(/@tailwind\s+components;/);
    expect(cssContent).toMatch(/@tailwind\s+utilities;/);
  });

  it('verifies :root defines Bennett brand colors and custom properties', () => {
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

    // Bennett Primary Navy HSL (219 90% 23%)
    expect(cssContent).toMatch(/--primary:\s*219\s+90%\s+23%;/);
    // Bennett Accent Red HSL (350 85% 42%)
    expect(cssContent).toMatch(/--accent:\s*350\s+85%\s+42%;/);
    // Background pure white
    expect(cssContent).toMatch(/--background:\s*0\s+0%\s+100%;/);
    // Foreground slate
    expect(cssContent).toMatch(/--foreground:\s*222\s+49%\s+15%;/);
    // Card border
    expect(cssContent).toMatch(/--border:\s*220\s+33%\s+91%;/);
    // Card border radius (14px cards)
    expect(cssContent).toMatch(/--radius:\s*0\.875rem;/);
  });

  it('verifies .w-bu campus container utility class exists', () => {
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

    expect(cssContent).toMatch(/\.w-bu\s*\{[^}]*max-width:\s*1160px;/s);
    expect(cssContent).toMatch(/\.w-bu\s*\{[^}]*margin-left:\s*auto;/s);
    expect(cssContent).toMatch(/\.w-bu\s*\{[^}]*margin-right:\s*auto;/s);
  });

  it('verifies tailwind.config.ts configures brand palette and content paths', () => {
    expect(fs.existsSync(tailwindConfigPath)).toBe(true);
    const tailwindContent = fs.readFileSync(tailwindConfigPath, 'utf8');

    // Content globs
    expect(tailwindContent).toContain('"./app/**/*.{ts,tsx}"');
    expect(tailwindContent).toContain('"./components/**/*.{ts,tsx}"');

    // Bennett brand colors
    expect(tailwindContent).toMatch(/navy:\s*["']#062a6e["']/);
    expect(tailwindContent).toMatch(/red:\s*["']#c8102e["']/);
    expect(tailwindContent).toMatch(/slate:\s*["']#14203b["']/);
    expect(tailwindContent).toMatch(/muted:\s*["']#5a6580["']/);
    expect(tailwindContent).toMatch(/border:\s*["']#e1e6f0["']/);
    expect(tailwindContent).toMatch(/soft:\s*["']#f3f5fa["']/);

    // Font family Poppins
    expect(tailwindContent).toContain('var(--font-poppins)');

    // Max width token
    expect(tailwindContent).toMatch(/bu:\s*["']1160px["']/);
  });

  it('verifies PostCSS configuration contains tailwindcss and autoprefixer', () => {
    expect(fs.existsSync(postcssConfigJsPath)).toBe(true);
    const postcssContent = fs.readFileSync(postcssConfigJsPath, 'utf8');

    expect(postcssContent).toContain('tailwindcss');
    expect(postcssContent).toContain('autoprefixer');
  });

  it('renders elements with Bennett utility classes without DOM error', () => {
    const { container } = render(
      React.createElement(
        'div',
        { className: 'max-w-bu bg-primary text-primary-foreground border border-border rounded-lg p-4' },
        React.createElement('h1', { className: 'text-bennett-navy font-poppins' }, 'BU Trade'),
        React.createElement('span', { className: 'text-accent' }, 'Campus Marketplace')
      )
    );

    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv).toHaveClass('max-w-bu', 'bg-primary', 'text-primary-foreground', 'border-border', 'rounded-lg');
  });
});
