import { DetalheSubscricao, Subscricao, TipoSubscricao } from 'wasp/entities'
import { type GetDetalheSubscricao, GetDetalheSubscricaoInfo } from 'wasp/server/operations'
import { getSubscricao } from './subscricaoService'
import { getTipoSubscricao } from './tipoSubscricaoService'

export const getDetalheSubscricao: GetDetalheSubscricao<void, DetalheSubscricao[]> = async (args, context) => {
  return context.entities.DetalheSubscricao.findMany({
    orderBy: { DetalheSubscricaoId: 'asc' },
  })
}

export const getDetalheSubscricaoInfo: GetDetalheSubscricaoInfo<void, Array<{ 
  detalheSubscricao: DetalheSubscricao, 
  subscricao: Subscricao, 
  tipoSubscricao: TipoSubscricao 
}>> = async (args, context) => {
    const detalhesSubscricoes = await getDetalheSubscricao(args, context)
    const subscricoes = await getSubscricao(args, context)
    const tipoSubscricoes = await getTipoSubscricao(args, context)

    const detalheSubscricaoInfo = detalhesSubscricoes.map(detalheSubscricao => {
    const subscricao = subscricoes.find(s => s.SubscricaoId === detalheSubscricao.SubscricaoSubscricaoId)
    const tipoSubscricao = tipoSubscricoes.find(ts => ts.TipoSubscricaoID === detalheSubscricao.TipoSubscricaoTipoSubscricaoID)
    return {
      detalheSubscricao,
      subscricao: subscricao || { SubscricaoId: -1, DataInicio: new Date(0), DataFim: new Date(0), EstadoSubscricao: false, UtilizadorUtilizadorId: -1, PagamentoPagamentoId: -1, TipoSubscricaoTipoSubscricaoID: -1 },
      tipoSubscricao: tipoSubscricao || { TipoSubscricaoID: -1, Descricao: 'Unknown', Preco: -1 },
    }
  })
  
  return detalheSubscricaoInfo
}
