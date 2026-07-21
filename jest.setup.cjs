require('dotenv').config({ quiet: true })
require('@testing-library/jest-dom')

// jsdom doesn't expose TextEncoder/TextDecoder as globals, but React Router
// (react-router-dom) imports them at module load. Borrow Node's versions so any
// test that imports a router-aware component doesn't crash on load.
const { TextEncoder, TextDecoder } = require('node:util')
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder
}

// jsdom's built-in `crypto` only implements getRandomValues, not randomUUID
// (unlike real browsers and Node) — code using crypto.randomUUID() crashes
// under Jest without this. Fall back to Node's implementation.
if (typeof globalThis.crypto?.randomUUID !== 'function') {
  const nodeCrypto = require('node:crypto')
  globalThis.crypto.randomUUID = nodeCrypto.randomUUID.bind(nodeCrypto)
}

// jsdom doesn't implement window.matchMedia. The theme system
// (src/context/theme-provider.tsx) reads it to detect the OS colour scheme,
// so provide a no-op stub that reports "light" and ignores listeners.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
