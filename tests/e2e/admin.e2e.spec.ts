import { expect, test, type Page } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

/**
 * Pruebas de punta a punta del panel de administración (Payload) en español.
 * Requisito: servidor en http://localhost:3000.
 */

test.describe('Panel de administración', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('muestra la bienvenida y el tablero de turnos', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page.getByText('Este es el panel de Confluencia Salud')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Turnos de hoy' })).toBeVisible()
  })

  test('abre el listado de turnos', async () => {
    await page.goto('http://localhost:3000/admin/collections/turnos')
    await expect(page.locator('h1', { hasText: 'Turnos' }).first()).toBeVisible()
  })

  test('abre el formulario para crear una página', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages/create')
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    await expect(page.locator('input[name="title"]')).toBeVisible()
  })
})
