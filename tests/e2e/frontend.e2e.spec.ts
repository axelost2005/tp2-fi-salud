import { expect, test } from '@playwright/test'

/**
 * Pruebas de punta a punta del sitio público.
 * Requisito: servidor en http://localhost:3000 con los datos de ejemplo cargados.
 * Ejecutar con: pnpm test:e2e
 */

const BASE = 'http://localhost:3000'

test.describe('Sitio público', () => {
  test('carga el inicio con la marca y la portada', async ({ page }) => {
    await page.goto(BASE)
    await expect(page).toHaveTitle(/Confluencia Salud/)
    await expect(page.locator('h1').first()).toHaveText('Tu salud, en un solo lugar.')
    await expect(page.getByRole('link', { name: /Guardia 24 h/ }).first()).toBeVisible()
  })

  test('filtra la cartilla por especialidad', async ({ page }) => {
    await page.goto(`${BASE}/profesionales?especialidad=pediatria`)
    await expect(page.getByRole('status')).toContainText('Encontramos 2 profesionales')
  })

  test('las novedades viejas en /posts redirigen a /novedades', async ({ page }) => {
    await page.goto(`${BASE}/posts`)
    await expect(page).toHaveURL(`${BASE}/novedades`)
  })

  test('pide un turno de punta a punta', async ({ page }) => {
    await page.goto(`${BASE}/turnos`)

    await page.getByLabel('Especialidad').selectOption({ label: 'Clínica médica' })
    await page.locator('#paso-profesional label').first().click()
    await page.locator('#paso-fecha label').first().click()
    await page.locator('#paso-hora label').first().click()

    await page.getByLabel('Nombre', { exact: true }).fill('Ana')
    await page.getByLabel('Apellido').fill('Prueba')
    await page.getByLabel('DNI (sin puntos)').fill('30123456')
    await page.getByLabel('Teléfono').fill('(0299) 15-555-0000')
    await page.getByLabel('Email').fill('ana.prueba@example.com')
    await page.getByLabel('Obra social').selectOption('particular')

    // Sin consentimiento, el servidor rechaza el pedido y muestra el error
    await page.getByRole('button', { name: 'Pedir el turno' }).click()
    await expect(page.locator('form [role=alert]')).toContainText('consentimiento')

    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Pedir el turno' }).click()

    await expect(page.getByRole('heading', { name: 'Recibimos tu pedido de turno' })).toBeVisible()
    await expect(page.getByText(/^CS-[A-Z0-9]{6}$/)).toBeVisible()
  })
})
