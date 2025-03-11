import { Pagamento, Utilizador } from 'wasp/entities'
import { type GetPagamento, type GetPagamentoInfo } from 'wasp/server/operations'
import { getUtilizadores } from './utilizadorService'

export const getPagamento: GetPagamento<void, Pagamento[]> = async (args, context) => {
  return context.entities.Pagamento.findMany({
    orderBy: { PagamentoId: 'asc' },
  })
}

export const getPagamentoInfo: GetPagamentoInfo<void, Array<{ 
  pagamento: Pagamento, 
  utilizador: Utilizador 
}>> = async (args, context) => {
    const pagamentos = await getPagamento(args, context)
    const utilizadores = await getUtilizadores(args, context)

    const PagamentoInfo = pagamentos.map(pagamento => {
    const utilizador = utilizadores.find(u => u.UtilizadorId === pagamento.UtilizadorUtilizadorId)
    return {
      pagamento,
      utilizador: utilizador || { UtilizadorId: -1, Nome: 'Unknown', DataNascimento: new Date(0), NIF: 'Unknown', PalavraPasse: 'Unknown', MoradaMoradaId: -1, ContactoContactoId: -1, TipoUtilizadorTipoUtilizadorId: -1 },
    }
  })
  
  return PagamentoInfo
}
