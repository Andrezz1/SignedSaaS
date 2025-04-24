import logger from './logger'

type ContextType = {
  entities: any
  user?: { id: number | string }
}

export function loggedQuery<TArgs = any, TResult = any>(
  name: string,
  handler: (args: TArgs, context: ContextType) => Promise<TResult>
): (args: TArgs, context: ContextType) => Promise<TResult> {
  return async (args, context) => {
    const userId = context.user?.id || 'anonymous'

    const message = `${name} '${JSON.stringify(args)}'`

    try {
      logger.info(`${message} | user: ${userId}`)
      const result = await handler(args, context)
      return result
    } catch (error: unknown) {
      let errorMessage = 'Unknown error'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      logger.error(`[ERROR] ${message} | user: ${userId} | error: ${errorMessage}`)
      throw error
    }
  }
}
