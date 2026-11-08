import '@testing-library/jest-dom/vitest'
// In-memory IndexedDB so Dexie works under jsdom.
import 'fake-indexeddb/auto'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
