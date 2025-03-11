import { Comprovativo, Utilizador, Pagamento, Subscricao } from 'wasp/entities'
import { type GetComprovativo, type GetComprovativoInfo } from 'wasp/server/operations'
import { getPagamento } from './pagamentoService'
import { getSubscricao } from './subscricaoService'
import { getUtilizadores } from './utilizadorService'

export const getComprovativo: GetComprovativo<void, Comprovativo[]> = async (args, context) => {
  return context.entities.Comprovativo.findMany({
    orderBy: { ComprovativoId: 'asc' },
  })
}

export const getComprovativoInfo: GetComprovativoInfo<void, Array<{ 
  comprovativo: Comprovativo, 
  utilizador: Utilizador, 
  pagamento: Pagamento, 
  subscricao: Subscricao
}>> = async (args, context) => {
    const comprovativos = await getComprovativo(args, context)
    const utilizadores = await getUtilizadores(args, context)
    const pagamentos = await getPagamento(args, context)
    const subscricoes = await getSubscricao(args, context)

    const ComprovativoInfo = comprovativos.map(comprovativo => {
    const utilizador = utilizadores.find(u => u.UtilizadorId === comprovativo.UtilizadorUtilizadorId)
    const pagamento = pagamentos.find(p => p.PagamentoId === comprovativo.PagamentoPagamentoId)
    const subscricao = subscricoes.find(s => s.SubscricaoId === comprovativo.SubscricaoSubscricaoId)
    return {
      comprovativo,
      utilizador: utilizador || { UtilizadorId: -1, Nome: 'Unknown', DataNascimento: new Date(0), NIF: 'Unknown', PalavraPasse: 'Unknown', MoradaMoradaId: -1, ContactoContactoId: -1, TipoUtilizadorTipoUtilizadorId: -1 },
      pagamento: pagamento || { PagamentoId: -1, Valor: -1, DataPagamento: new Date(0), EstadoPagamento: 'Unknown', NIFPagamento: 'Unknown', UtilizadorUtilizadorId: -1 },
      subscricao: subscricao || { SubscricaoId: -1, DataInicio: new Date(0), DataFim: new Date(0), EstadoSubscricao: false, UtilizadorUtilizadorId: -1, PagamentoPagamentoId: -1, TipoSubscricaoTipoSubscricaoID: -1 },
    }
  })
  
  return ComprovativoInfo
}
