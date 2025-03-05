import { Subscricao, Utilizador, Pagamento, TipoSubscricao } from 'wasp/entities'
import { type GetSubscricao, GetSubscricaoInfo } from 'wasp/server/operations'
import { getUtilizadores } from './utilizadorService'
import { getPagamento } from './pagamentoService'
import { getTipoSubscricao } from './tipoSubscricaoService'

export const getSubscricao: GetSubscricao<void, Subscricao[]> = async (args, context) => {
  return context.entities.Subscricao.findMany({
    orderBy: { SubscricaoId: 'asc' },
  })
}

export const getSubscricaoInfo: GetSubscricaoInfo<void, Array<{ subscricao: Subscricao, utilizador: Utilizador, pagamento: Pagamento, tipoSubscricao: TipoSubscricao }>> = async (args, context) => {
    const subscricoes = await getSubscricao(args, context)
    const utilizadores = await getUtilizadores(args, context)
    const pagamentos = await getPagamento(args, context)
    const tipoSubscricoes = await getTipoSubscricao(args, context)

    const SubscricaoInfo = subscricoes.map(subscricao => {
    const utilizador = utilizadores.find(u => u.UtilizadorId === subscricao.UtilizadorUtilizadorId)
    const pagamento = pagamentos.find(p => p.PagamentoId === subscricao.PagamentoPagamentoId)
    const tipoSubscricao = tipoSubscricoes.find(ts => ts.TipoSubscricaoID === subscricao.TipoSubscricaoTipoSubscricaoID)
    return {
      subscricao,
      utilizador: utilizador || { UtilizadorId: -1, Nome: 'Unknown', DataNascimento: new Date(0), NIF: 'Unknown', PalavraPasse: 'Unknown', MoradaMoradaId: -1, ContactoContactoId: -1, TipoUtilizadorTipoUtilizadorId: -1 },
      pagamento: pagamento || { PagamentoId: -1, Valor: -1, DataPagamento: new Date(0), EstadoPagamento: 'Unknown', NIFPagamento: 'Unknown', UtilizadorUtilizadorId: -1 },
      tipoSubscricao: tipoSubscricao || { TipoSubscricaoID: -1, Descricao: 'Unknown', Preco: -1 },
    }
  })
  
  return SubscricaoInfo
}
