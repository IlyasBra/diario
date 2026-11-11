import { expect, type Page, test } from '@playwright/test'

/** Every test starts with an empty app (a fresh browser context per test). */
async function openApp(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Hoy', level: 1 })).toBeVisible()
}

async function addTask(page: Page, title: string) {
  await page.getByRole('button', { name: 'Nueva tarea' }).click()
  const dialog = page.getByRole('dialog', { name: 'Nueva tarea' })
  await dialog.getByLabel('Título').fill(title)
  await dialog.getByRole('button', { name: 'Añadir', exact: true }).click()
  await expect(page.getByLabel(title)).toBeVisible()
}

test('a task survives reloading the page', async ({ page }) => {
  await openApp(page)
  await addTask(page, 'Llamar al dentista')

  await page.reload()

  await expect(page.getByLabel('Llamar al dentista')).toBeVisible()
})

test('completing a task can be undone', async ({ page }) => {
  await openApp(page)
  await addTask(page, 'Comprar pan')

  await page.getByLabel('Comprar pan').check()
  await expect(page.getByText('Tarea completada')).toBeVisible()
  await expect(page.getByText('Hoy tienes 1 tarea, 1 completada.')).toBeVisible()

  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.getByLabel('Comprar pan')).not.toBeChecked()
})

// Playwright can drive the mouse, not multi-step touch gestures, so this runs without touch.
test.describe('dragging', () => {
  test.use({ hasTouch: false, isMobile: false, viewport: { width: 390, height: 844 } })

  test('a task can be dragged to another day and moved back with undo', async ({ page }) => {
    await openApp(page)
    await addTask(page, 'Regar las plantas')

    const handle = page.getByRole('button', { name: 'Mover «Regar las plantas» a otro día' })
    const box = await handle.boundingBox()
    if (!box) throw new Error('The drag handle is not visible')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + 60, { steps: 5 })

    // The bar of days appears while dragging; tomorrow is the second one.
    const tomorrow = page.locator('[aria-hidden="true"] li').nth(1)
    await expect(tomorrow).toBeVisible()
    const target = await tomorrow.boundingBox()
    if (!target) throw new Error('The day targets are not visible')
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 })
    await page.mouse.up()

    await expect(page.getByText('Movida a mañana')).toBeVisible()
    await expect(page.getByLabel('Regar las plantas')).toBeHidden()

    await page.getByRole('button', { name: 'Deshacer' }).click()
    await expect(page.locator('main')).toContainText('Regar las plantas')
    await expect(page.getByLabel('Regar las plantas')).toBeVisible()
  })
})

test('a repeating task is created from the form and shown with its rule', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Nueva tarea' }).click()
  const dialog = page.getByRole('dialog', { name: 'Nueva tarea' })
  await dialog.getByLabel('Título').fill('Gimnasio')
  await dialog.getByRole('radio', { name: 'Cada día' }).check({ force: true })
  await dialog.getByRole('button', { name: 'Añadir', exact: true }).click()

  await expect(page.getByText('Cada día', { exact: true })).toBeVisible()
})

test('dark mode is remembered after reloading, without a flash', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.getByRole('radio', { name: 'Oscuro' }).check({ force: true })
  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.reload()

  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('the language follows the phone and can be changed, Arabic included', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'fr-FR' })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.getByRole('heading', { name: "Aujourd'hui", level: 1 })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')

  await page.getByRole('button', { name: 'Réglages' }).click()
  await page.getByLabel("Langue de l'application").selectOption('ar')

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await context.close()
})

test('the app keeps working offline once loaded', async ({ page, context }) => {
  await openApp(page)
  // Wait until the service worker controls the page, i.e. the files are cached.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true)

  await context.setOffline(true)
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Hoy', level: 1 })).toBeVisible()
  await addTask(page, 'Sin conexión')
})
