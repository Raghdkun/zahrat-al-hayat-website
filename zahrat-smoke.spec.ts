import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];
const paths = ['/ar', '/en', '/ar/blog', '/en/blog', '/ar/book', '/en/book', '/ar/auth/login', '/en/auth/login', '/ar/book/success', '/ar/book/cancel'];

for (const vp of viewports) {
  for (const p of paths) {
    test(`${vp.name} ${p}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const resp = await page.goto('http://localhost:3000' + p, { waitUntil: 'commit', timeout: 60000 });
      expect(resp?.status(), 'http status').toBeLessThan(400);
      const dir = await page.locator('html').getAttribute('dir', { timeout: 30000 });
      const expectedDir = p.startsWith('/ar') ? 'rtl' : 'ltr';
      expect(dir).toBe(expectedDir);
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
      const filtered = errors.filter(e => !e.includes('favicon') && !e.includes('Stripe') && !e.includes('NEXT_REDIRECT') && !e.includes('Failed to load resource') && !e.includes('manifest'));
      expect(filtered, 'console errors:\n' + filtered.join('\n')).toEqual([]);
    });
  }
}
