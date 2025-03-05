import { DetalheSubscricao } from 'wasp/entities'
import { type GetDetalheSubscricao } from 'wasp/server/operations'

export const getDetalheSubscricao: GetDetalheSubscricao<void, DetalheSubscricao[]> = async (args, context) => {
  return context.entities.DetalheSubscricao.findMany({
    orderBy: { DetalheSubscricaoId: 'asc' },
  })
}