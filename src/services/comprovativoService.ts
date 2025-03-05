import { Comprovativo } from 'wasp/entities'
import { type GetComprovativo } from 'wasp/server/operations'

export const getComprovativo: GetComprovativo<void, Comprovativo[]> = async (args, context) => {
  return context.entities.Comprovativo.findMany({
    orderBy: { ComprovativoId: 'asc' },
  })
}