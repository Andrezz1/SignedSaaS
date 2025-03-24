import { Subscricao, Utilizador, Pagamento, TipoSubscricao } from 'wasp/entities'
import { 
  type GetSubscricao, 
  type GetSubscricaoInfo, 
  type UpdateSubscricaoStatus,
  type GetSubscricaoByUtilizadorId
} from 'wasp/server/operations'

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

  if (!subscricao) {
    throw new Error("Subscricao nao existente")
  }

  const currentDate = new Date()
  const estadoAtualizado = subscricao.DataFim && new Date(subscricao.DataFim) > currentDate

  const updatedSubscricaoStatus = await context.entities.Subscricao.update({
    where: { SubscricaoId: args.SubscricaoId },
    data: { 
      EstadoSubscricao: estadoAtualizado,
     }
  })

  return updatedSubscricaoStatus
}

export const getSubscricaoByUtilizadorId: GetSubscricaoByUtilizadorId<Pick<Utilizador, 'id'>, Subscricao[]>
= async (
  args,
  context
) => {
  if(!args.id) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Subscricao.findMany({
    where: {  UtilizadorId: args.id },
  })
}

