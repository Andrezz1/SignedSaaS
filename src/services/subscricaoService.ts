import { Subscricao, Utilizador, Pagamento, TipoSubscricao } from 'wasp/entities'
import { type GetSubscricao, type GetSubscricaoInfo, type UpdateSubscricaoStatus } from 'wasp/server/operations'

export const getSubscricao: GetSubscricao<void, Subscricao[]> = async (_args, context) => {
  return context.entities.Subscricao.findMany({
    orderBy: { SubscricaoId: 'asc' },
  })
}

export const getSubscricaoInfo: GetSubscricaoInfo<void, Array<{ 
  subscricao: Subscricao, 
  utilizador: Utilizador, 
  pagamento: Pagamento, 
  tipoSubscricao: TipoSubscricao
}>> = async (_args, context) => {
  const subscricoes = await context.entities.Subscricao.findMany({
    include: {
      Utilizador: true,
      Pagamento: true,
      TipoSubscricao: true,
    }
  })

  const SubscricaoInfo = subscricoes.map(({ TipoSubscricao, Pagamento, Utilizador, ...subscricao }) => ({
    subscricao,
    tipoSubscricao: TipoSubscricao,
    pagamento: Pagamento,
    utilizador: Utilizador,
  }))
  
  return SubscricaoInfo
}

type UpdateSubscricaoStatusPayLoad = Pick<Subscricao, 'EstadoSubscricao' | 'SubscricaoId'>

export const updateSubscricaoStatus: UpdateSubscricaoStatus<UpdateSubscricaoStatusPayLoad, Subscricao> = async (
  args,
  context,
) => {
  const subscricao = await context.entities.Subscricao.findUnique({
    where: { SubscricaoId: args.SubscricaoId },
  })

  const currentDate = new Date()
  const estadoAtualizado = subscricao?.DataFim && new Date(subscricao.DataFim) < currentDate ? false : true

  const updatedSubscricaoStatus = await context.entities.Subscricao.update({
    where: { SubscricaoId: args.SubscricaoId },
    data: { 
      EstadoSubscricao: estadoAtualizado,
     }
  })

  return updatedSubscricaoStatus
}
  