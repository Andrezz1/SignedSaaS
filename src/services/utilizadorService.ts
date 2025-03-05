import { Utilizador } from 'wasp/entities'
import { type GetUtilizadores } from 'wasp/server/operations'

export const getUtilizadores: GetUtilizadores<void, Utilizador[]> = async (args, context) => {
  return context.entities.Utilizador.findMany({
    orderBy: { UtilizadorId: 'asc' },
  })
}
