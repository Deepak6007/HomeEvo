import '@testing-library/jest-dom'
import 'jest-location-mock'
import { TextEncoder, TextDecoder } from 'util'

// Expose TextEncoder/Decoder if not present
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any
}

// Copy native Web APIs to the JSDOM window object
if (typeof window !== 'undefined') {
  window.fetch = window.fetch || global.fetch
  window.Request = window.Request || global.Request
  window.Response = window.Response || global.Response
  window.Headers = window.Headers || global.Headers
  window.ReadableStream = window.ReadableStream || global.ReadableStream
  window.WritableStream = window.WritableStream || global.WritableStream
  window.TransformStream = window.TransformStream || global.TransformStream
  window.TextEncoder = window.TextEncoder || global.TextEncoder
  window.TextDecoder = window.TextDecoder || global.TextDecoder
  
  if (typeof window.BroadcastChannel === 'undefined') {
    const workerThreads = require('worker_threads')
    window.BroadcastChannel = workerThreads.BroadcastChannel
  }
}

if (typeof global.BroadcastChannel === 'undefined') {
  const workerThreads = require('worker_threads')
  global.BroadcastChannel = workerThreads.BroadcastChannel
}

// Configure Axios to use the standard fetch adapter in tests
const axios = require('axios')
axios.defaults.adapter = 'fetch'

const { server } = require('./src/mocks/server')

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' })
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers()
})

// Clean up after the tests are finished.
afterAll(() => {
  server.close()
})

// Mock next/navigation
jest.mock('next/navigation', () => {
  const useRouter = () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })
  return {
    useRouter,
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
  }
})

import * as React from 'react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return React.createElement('img', props)
  },
}))

// jest-location-mock handles window.location simulation automatically

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock URL object creation APIs for file upload thumbnails
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = jest.fn().mockReturnValue('mock-object-url')
  window.URL.revokeObjectURL = jest.fn()
}


