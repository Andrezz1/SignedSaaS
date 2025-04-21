import cors from 'cors'
import { config, type MiddlewareConfigFn } from 'wasp/server'

// CORS Middleware
export const serverMiddlewareFn: MiddlewareConfigFn = (middlewareConfig) => {
    // o server apenas aceita requests destes domains (os examples apenas servem para demonstrar como adicionar novos domains)
  middlewareConfig.set('cors', cors({ origin: [config.frontendUrl, 'https://example1.com', 'https://example2.com'] }))
  return middlewareConfig
}