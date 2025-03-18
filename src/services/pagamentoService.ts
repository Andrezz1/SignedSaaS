import { Pagamento, Utilizador } from 'wasp/entities'
import { 
  type GetPagamento, 
  type GetPagamentoInfo 
} from 'wasp/server/operations'

export const getPagamento: GetPagamento<void, Pagamento[]> = async (_args, context) => {
  return context.entities.Pagamento.findMany({
    orderBy: { PagamentoId: 'asc' },
  })
}

export const getPagamentoInfo: GetPagamentoInfo<void, Array<{ 
  pagamento: Pagamento, 
  utilizador: Utilizador 
}>> = async (_args, context) => {
  const pagamentos = await context.entities.Pagamento.findMany({
    include: {
      Utilizador: true,
    }
  })

  const PagamentoInfo = pagamentos.map(({ Utilizador , ...pagamento }) => ({
    pagamento,
    utilizador: Utilizador,
  }))
  
  return PagamentoInfo
}
