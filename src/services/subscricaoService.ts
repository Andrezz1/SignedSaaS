import { Subscricao, Utilizador, Pagamento, TipoSubscricao } from 'wasp/entities'
import { 
  type GetSubscricao, 
  type GetSubscricaoInfo, 
  type GetSubscricaoByUtilizadorId
} from 'wasp/server/operations'
import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'
import { HttpError } from 'wasp/server'


export const getSubscricao: GetSubscricao<void, Subscricao[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

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
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

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

export const getSubscricaoByUtilizadorId: GetSubscricaoByUtilizadorId<Pick<Utilizador, 'id'>, Subscricao[]>
= async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  if(!args.id) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Subscricao.findMany({
    where: {  UtilizadorId: args.id },
  })
}

// Este job não está a utilizar o wasp, não estava a conseguir (tentar implementar no main.wasp futuramente)

const prisma = new PrismaClient()

const updateAllSubscricoesStatus = async () => {
  try {
    const currentDate = new Date()
    const subscricoes = await prisma.subscricao.findMany()

    for (const subscricao of subscricoes) {
      const estadoAtualizado = subscricao.DataFim && new Date(subscricao.DataFim) > currentDate

      await prisma.subscricao.update({
        where: { SubscricaoId: subscricao.SubscricaoId },
        data: { EstadoSubscricao: estadoAtualizado },
      })

      console.log(`Subscricao: ${subscricao.SubscricaoId} estado: ${estadoAtualizado}`)
    }
  } catch (error) {
    console.error('Erro ao atualizar subscrições:', error)
  }
}

cron.schedule('1 0 * * *', async () => {
  console.log('A procurar subscricoes...')
  await updateAllSubscricoesStatus()
})
