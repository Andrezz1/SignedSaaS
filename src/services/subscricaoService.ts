import { Subscricao, Utilizador, Pagamento, TipoSubscricao } from 'wasp/entities'
import { 
  type GetSubscricao, 
  type GetSubscricaoInfo, 
  type GetSubscricaoByUtilizadorId,
  type CreateSubscricao
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

type CreateSubscricaoPayload = {
  DataInicio: Date
  DataFim: Date
  UtilizadorId: number
  TipoSubscricaoId: number
  DetalheSubscricao: {
    Quantidade: number
    Desconto?: number
  }
  Pagamento: {
    DadosEspecificos?: any
    EstadoPagamento?: string
    NIFPagamento?: string
    MetodoPagamentoId: number
  }
  PagamentoPagamentoId: number
}

export const createSubscricao: CreateSubscricao<CreateSubscricaoPayload, Subscricao> = async (
  args,
  context,
) => {
  
  const tipoSubscricao = await context.entities.TipoSubscricao.findUnique({
    where: { TipoSubscricaoID: args.TipoSubscricaoId }
  })

  if (!tipoSubscricao) {
    throw new Error('Tipo de subscrição não encontrado')
  }

  const valorBase = tipoSubscricao.Preco * args.DetalheSubscricao.Quantidade
  const valorFinal = args.DetalheSubscricao.Desconto 
    ? valorBase * (1 - args.DetalheSubscricao.Desconto)
    : valorBase

  const subscricao = await context.entities.Subscricao.create({
    data: {
      DataInicio: args.DataInicio,
      DataFim: args.DataFim,
      EstadoSubscricao: false,
      UtilizadorId: args.UtilizadorId,
      TipoSubscricaoTipoSubscricaoID: args.TipoSubscricaoId,
      PagamentoPagamentoId: args.PagamentoPagamentoId
    }
  })

  const detalheSubscricao = await context.entities.DetalheSubscricao.create({
    data: {
      Quantidade: args.DetalheSubscricao.Quantidade,
      Desconto: args.DetalheSubscricao.Desconto,
      ValorFinal: valorFinal,
      SubscricaoSubscricaoId: subscricao.SubscricaoId,
      TipoSubscricaoTipoSubscricaoID: args.TipoSubscricaoId
    }
  })

  const pagamento = await prisma.pagamento.create({
    data: {
      Valor: valorFinal,
      DadosEspecificos: args.Pagamento.DadosEspecificos,
      DataPagamento: new Date(),
      EstadoPagamento: args.Pagamento.EstadoPagamento || 'pendente',
      NIFPagamento: args.Pagamento.NIFPagamento!,
      MetodoPagamentoId: args.Pagamento.MetodoPagamentoId,
      UtilizadorId: args.UtilizadorId
    }
  })

  const subscricaoAtualizada = await context.entities.Subscricao.update({
    where: { SubscricaoId: subscricao.SubscricaoId },
    data: {
      PagamentoPagamentoId: pagamento.PagamentoId
    },
    include: {
      Pagamento: true,
      Detalhes: true,
      TipoSubscricao: true
    }
  })

  return subscricaoAtualizada
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
