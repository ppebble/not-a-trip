// Jest setup file for global test configuration
import '@testing-library/jest-dom'

// jsdom에 ResizeObserver가 없으므로 글로벌 mock 추가
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this._callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
