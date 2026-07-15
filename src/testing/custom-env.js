const JSDOMEnvironment = require('jest-environment-jsdom').default || require('jest-environment-jsdom');

class CustomJSDOMEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();
    
    // Restore Node.js native globals that JSDOM hides or misses
    this.global.fetch = fetch;
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.Headers = Headers;
    this.global.ReadableStream = ReadableStream;
    this.global.WritableStream = WritableStream;
    this.global.TransformStream = TransformStream;
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    this.global.AbortController = AbortController;
    this.global.AbortSignal = AbortSignal;
    
    // Polyfill BroadcastChannel if it's missing in JSDOM environment
    if (typeof this.global.BroadcastChannel === 'undefined') {
      const { BroadcastChannel } = require('worker_threads');
      this.global.BroadcastChannel = BroadcastChannel;
    }
  }
}

module.exports = CustomJSDOMEnvironment;
