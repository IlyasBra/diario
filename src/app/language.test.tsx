import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setLanguagePreference, useDocumentLanguage } from '@/i18n'
import { LANGUAGE_STORAGE_KEY } from '@/i18n/store'
import { createTestRepositories } from '@/test/repositories'
import { makeTask } from '@/test/factories'
import { TestProviders } from '@/test/TestProviders'

import { MainScreen } from './MainScreen'

const TODAY = '2026-11-08'

function DocumentLanguage() {
  useDocumentLanguage()
  return null
}

function renderApp() {
  const repositories = createTestRepositories()
  void repositories.tasks.replaceAll([makeTask({ title: 'Llamar', date: TODAY })])
  render(
    <TestProviders repositories={repositories}>
      <MainScreen today={TODAY} isPersistent />
    </TestProviders>,
  )
  return userEvent.setup()
}

describe('language', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('switches the whole interface from the settings and remembers the choice', async () => {
    const user = renderApp()
    await user.click(await screen.findByRole('button', { name: 'Ajustes' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajustes' })

    await user.selectOptions(within(dialog).getByLabelText('Idioma de la aplicación'), 'fr')

    expect(await screen.findByRole('dialog', { name: 'Réglages' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: "Aujourd'hui" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: "Aujourd'hui", level: 1 })).toBeInTheDocument()
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('"fr"')
  })

  it('writes Arabic right to left and restores left to right afterwards', async () => {
    const user = renderApp()
    await user.click(await screen.findByRole('button', { name: 'Ajustes' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajustes' })

    await user.selectOptions(within(dialog).getByLabelText('Idioma de la aplicación'), 'ar')
    expect(await screen.findByRole('dialog', { name: 'الإعدادات' })).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('لغة التطبيق'), 'en')
    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
  })

  it('follows the language of the phone while set to automatic', () => {
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['de-DE', 'en'])
    setLanguagePreference('auto', { persist: false })
    render(<DocumentLanguage />)
    expect(document.documentElement.lang).toBe('de')
    expect(document.documentElement.dir).toBe('ltr')
    vi.restoreAllMocks()
  })

  it('sets the document direction for Arabic', () => {
    setLanguagePreference('ar', { persist: false })
    render(<DocumentLanguage />)
    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('translates the default tags until the user renames them', async () => {
    const user = renderApp()
    await user.click(await screen.findByRole('button', { name: 'Ajustes' }))
    const dialog = screen.getByRole('dialog', { name: 'Ajustes' })
    expect(within(dialog).getByText('Casa')).toBeInTheDocument()

    await user.selectOptions(within(dialog).getByLabelText('Idioma de la aplicación'), 'en')
    expect(await within(dialog).findByText('Home')).toBeInTheDocument()
  })
})
