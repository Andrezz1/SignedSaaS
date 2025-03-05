import { Pagamento } from 'wasp/entities'
import { type GetPagamento } from 'wasp/server/operations'

export const getPagamento: GetPagamento<void, Pagamento[]> = async (args, context) => {
  return context.entities.Pagamento.findMany({
    orderBy: { PagamentoId: 'asc' },
  })
}
