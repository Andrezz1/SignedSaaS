import { Doacao } from 'wasp/entities'
import { type GetDoacao } from 'wasp/server/operations'

export const getDoacao: GetDoacao<void, Doacao[]> = async (args, context) => {
  return context.entities.Doacao.findMany({
    orderBy: { DoacaoId: 'asc' },
  })
}
