// Genera las capturas de /screenshots con Playwright usando el Edge/Chrome instalado.
// Uso: npx vite preview --port 4173  (en otra terminal)  →  node scripts/screenshots.mjs
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

const exe = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => existsSync(p))

const browser = await chromium.launch({ executablePath: exe, headless: true })

async function shot(name, route, { width = 1440, height = 900, role = 'admin', logged = true, before } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  await ctx.addInitScript(
    ({ logged, role }) => {
      try {
        localStorage.setItem('tl_lang', 'es')
        localStorage.setItem('tl_theme', 'light')
        if (logged) {
          sessionStorage.setItem('tl_logged', 'true')
          sessionStorage.setItem('tl_role', JSON.stringify(role))
          sessionStorage.setItem('tl_welcome_seen', 'true')
          for (const r of ['admin', 'psico', 'user']) sessionStorage.setItem('tl_tour_completed_' + r, 'true')
        }
      } catch {}
    },
    { logged, role },
  )
  const page = await ctx.newPage()
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(1500)
  if (before) await before(page)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('✓', name)
  await ctx.close()
}

const reveal = async (page) => {
  await page.getByRole('button', { name: 'Ver inversión' }).click()
  await page.waitForTimeout(900)
  await page.locator('[data-tour="investment"]').scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, 120))
  await page.waitForTimeout(400)
}
const scrollInvestment = async (page) => {
  await page.locator('[data-tour="investment"]').scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -250))
  await page.waitForTimeout(300)
}

await shot('01-login', '/login', { logged: false })
await shot('02-propuesta-precio-oculto', '/propuesta', { before: scrollInvestment })
await shot('03-propuesta-precio-revelado', '/propuesta', { before: reveal })
await shot('04-panel-admin', '/admin/panel')
await shot('05-motor-matches-drawer', '/admin/matches?detalle=top', { before: (p) => p.waitForTimeout(1200) })
await shot('06-agenda-psicologa', '/psico/agenda', { role: 'psico' })
await shot('07-onboarding', '/mi/onboarding', { role: 'user' })
await shot('08-perfil-fotos', '/mi/perfil?tab=fotos', { role: 'user', before: (p) => p.evaluate(() => window.scrollTo(0, 380)) })
await shot('09-perfil-musica', '/mi/perfil?tab=musica', { role: 'user', before: (p) => p.evaluate(() => window.scrollTo(0, 380)) })
await shot('10-propuesta-375', '/propuesta', { width: 375, height: 812 })

await browser.close()
