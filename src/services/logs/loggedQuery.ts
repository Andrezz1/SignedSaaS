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
    logger.info(`[[${name}] called by user ${userId}]`)
    return await handler(args, context)
  }
}
