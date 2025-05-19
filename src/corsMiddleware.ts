import cors from 'cors'
import { config, type MiddlewareConfigFn } from 'wasp/server'

// CORS Middleware
export const serverMiddlewareFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.set('cors', cors({ 
    origin: [
      config.frontendUrl, 
      'https://client-production-3817.up.railway.app',
      'https://server-test.up.railway.app', 
      'server-production-32b3.up.railway.app'
    ] 
  }))
  return middlewareConfig
}