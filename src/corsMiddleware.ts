import cors from 'cors'
import { config, type MiddlewareConfigFn } from 'wasp/server'

// CORS Middleware
export const serverMiddlewareFn: MiddlewareConfigFn = (middlewareConfig) => {
    // o server apenas aceita requests destes domains (o example apenas servem para demonstrar como adicionar novos domains)
  middlewareConfig.set('cors', cors({ origin: [config.frontendUrl, 'https://example1.com'] }))
  return middlewareConfig
}
