import { Comprovativo, Pagamento, Utilizador } from 'wasp/entities'
import { 
  type GetPagamento, 
  type GetPagamentoInfo,
  type GetPagamentoByUtilizadorId
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

export const getPagamentoByUtilizadorId: GetPagamentoByUtilizadorId<Pick<Utilizador, 'id'>, Pagamento[]>
= async (
  args,
  context
) => {
  if(!args.id) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Pagamento.findMany({
    where: {  UtilizadorId: args.id },
  })
}
