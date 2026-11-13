// Node runs TypeScript directly, but its ESM resolver still wants an extension on every
// relative import — and the app's source is written extensionless, the way the bundler
// expects. This hook retries a failed relative resolve with `.ts`, so `node --test` can
// load the app's modules as they are.
//
// ponytail: twenty lines instead of a test-runner dependency. Swap it for one the day the
// tests need transforms rather than resolution.

import { register } from 'node:module'

register(
  `data:text/javascript,${encodeURIComponent(`
    export async function resolve(specifier, context, next) {
      try {
        return await next(specifier, context)
      } catch (error) {
        if (!specifier.startsWith('.')) throw error
        return next(\`\${specifier}.ts\`, context)
      }
    }
  `)}`,
  import.meta.url,
)
