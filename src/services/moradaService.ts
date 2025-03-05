import { Morada } from 'wasp/entities'
import { type GetMorada } from 'wasp/server/operations'

export const getMorada: GetMorada<void, Morada[]> = async (args, context) => {
  return context.entities.Morada.findMany({
    orderBy: { MoradaId: 'asc' },
  })
}