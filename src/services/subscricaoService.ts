import { Subscricao } from 'wasp/entities'
import { type GetSubscricao } from 'wasp/server/operations'

export const getSubscricao: GetSubscricao<void, Subscricao[]> = async (args, context) => {
  return context.entities.Subscricao.findMany({
    orderBy: { SubscricaoId: 'asc' },
  })
}
