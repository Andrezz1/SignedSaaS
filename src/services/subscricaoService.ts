import { Subscricao, Utilizador, Pagamento, TipoSubscricao } from 'wasp/entities'
import { type GetSubscricao, type GetSubscricaoInfo, type UpdateSubscricaoStatus } from 'wasp/server/operations'
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

type UpdateSubscricaoStatusPayLoad = Pick<Subscricao, 'EstadoSubscricao' | 'SubscricaoId'>

export const updateSubscricaoStatus: UpdateSubscricaoStatus<UpdateSubscricaoStatusPayLoad, Subscricao> = async (
  { SubscricaoId }: any,
  context: { entities: { Subscricao: { 
    findUnique: (arg: { where: { SubscricaoId: any } }) => Promise<{ DataFim: Date | null } | null>,
    update: (arg: { where: { SubscricaoId: any }; data: { EstadoSubscricao: boolean } }) => any 
  } } }
) => {
  // Isto vai buscar a DataFim igual que pertence ao SubscricaoId
  const subscricao = await context.entities.Subscricao.findUnique({
    where: { SubscricaoId },
  });

  if (!subscricao) {
    throw new Error("Subscription not found");
  }

  const currentDate = new Date();
  // Isto compara a DataFim com o horário atual e altera o estado da subscricao conforme
  const estadoAtualizado = subscricao.DataFim && new Date(subscricao.DataFim) < currentDate ? false : true;

  return context.entities.Subscricao.update({
    where: { SubscricaoId },
    data: { EstadoSubscricao: estadoAtualizado },
  });
};