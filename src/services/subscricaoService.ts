import { Subscricao, Utilizador, Pagamento, TipoSubscricao } from 'wasp/entities'
import { 
  type GetSubscricao, 
  type GetSubscricaoInfo, 
  type GetSubscricaoByUtilizadorId,
  type CreateSubscricaoCompleta,
} from 'wasp/server/operations'
import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'
import { HttpError } from 'wasp/server'
import { createPagamento, connectPagamentoASubscricao } from './pagamentoService'

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
  pagamento: Pagamento | null, 
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
    pagamento: Pagamento || null,
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
}

export async function criarSubscricao(
  input: CreateSubscricaoPayload,
  context: any
) {
  const tipoSubscricao = await context.entities.TipoSubscricao.findUnique({
    where: { TipoSubscricaoID: input.TipoSubscricaoId }
  })

  if (!tipoSubscricao) {
    throw new Error('Tipo de subscrição não encontrado')
  }

  const valorBase = tipoSubscricao.Preco * input.DetalheSubscricao.Quantidade
  const valorFinal = input.DetalheSubscricao.Desconto 
    ? valorBase * (1 - input.DetalheSubscricao.Desconto)
    : valorBase

  const subscricao = await context.entities.Subscricao.create({
    data: {
      DataInicio: input.DataInicio,
      DataFim: input.DataFim,
      EstadoSubscricao: false,
      Utilizador: { connect: { id: input.UtilizadorId } },
      TipoSubscricao: { connect: { TipoSubscricaoID: input.TipoSubscricaoId } }
    }
  })

  await context.entities.DetalheSubscricao.create({
    data: {
      Quantidade: input.DetalheSubscricao.Quantidade,
      Desconto: input.DetalheSubscricao.Desconto,
      ValorFinal: valorFinal,
      SubscricaoSubscricaoId: subscricao.SubscricaoId,
      TipoSubscricaoTipoSubscricaoID: input.TipoSubscricaoId
    }
  })

  return { subscricao, valorFinal }
}


type CreateSubscricaoCompletaPayload = {
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


export const createSubscricaoCompleta: CreateSubscricaoCompleta<CreateSubscricaoCompletaPayload, Subscricao> = async (
  args,
  context
) => {
  const { subscricao, valorFinal } = await criarSubscricao(args, context)

  const pagamento = await createPagamento({
    Valor: valorFinal,
    UtilizadorId: args.UtilizadorId,
    MetodoPagamentoId: args.Pagamento.MetodoPagamentoId,
    DadosEspecificos: args.Pagamento.DadosEspecificos,
    EstadoPagamento: args.Pagamento.EstadoPagamento,
    NIFPagamento: args.Pagamento.NIFPagamento!,
    TelemovelMbway: args.Pagamento?.DadosEspecificos?.telemovelMbway
    
  }, prisma)

  const subscricaoFinal = await connectPagamentoASubscricao(
    subscricao.SubscricaoId,
    pagamento.PagamentoId,
    context
  )

  return subscricaoFinal
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
