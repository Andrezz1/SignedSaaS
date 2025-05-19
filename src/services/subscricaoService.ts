import { Subscricao, Utilizador, Pagamento, TipoSubscricao } from 'wasp/entities'
import { 
  type GetSubscricao, 
  type GetSubscricaoInfo, 
  type GetSubscricaoByUtilizadorId,
  type CreateSubscricaoCompleta,
  type GetDataSubscricao,
  type CreatePagamentoSubscricaoExistente,
  type GetSubscricoesQuantia
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

export const getSubscricoesQuantia: GetSubscricoesQuantia<void, number> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const subscricoesConcluidas = await context.entities.Subscricao.findMany({
    where: {
      Pagamento: {
        EstadoPagamento: 'concluido'
      }
    },
    select: {
      SubscricaoId: true
    }
  })

  const resultado = await context.entities.DetalheSubscricao.aggregate({
    _sum: {
      ValorFinal: true
    },
    where: {
      SubscricaoSubscricaoId: {
        in: subscricoesConcluidas.map(s => s.SubscricaoId)
      }
    }
  })

  return resultado._sum.ValorFinal ?? 0
}

export const getDataSubscricao: GetDataSubscricao<Pick<Utilizador, 'id'>, { dataInicio: Date | null, dataFim: Date | null }>
= async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const datas = await context.entities.Subscricao.aggregate({
    where: {
      UtilizadorId: args.id,
      EstadoSubscricao: true,
    },
    _min: {
      DataInicio: true,
    },
    _max: {
      DataFim: true,
    }
  })

  return {
    dataInicio: datas._min.DataInicio,
    dataFim: datas._max.DataFim,
  }
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

export const getSubscricaoByUtilizadorId: GetSubscricaoByUtilizadorId<Pick<Utilizador, 'id'>, any[]>
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
    include: {
      TipoSubscricao: true,
      Duracao: true

    }
  })
}

type CreateSubscricaoPayload = {
  DataInicio?: Date
  UtilizadorId: number
  TipoSubscricaoId: number
  DuracaoId: number
  DetalheSubscricao: {
    Quantidade: number
    Desconto?: number
  }
}

export async function createSubscricao(
  input: CreateSubscricaoPayload,
  context: any
) {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const tipoSubscricaoDuracao = await context.entities.TipoSubscricaoDuracao.findFirst({
    where: { 
      TipoSubscricaoID: input.TipoSubscricaoId,
      DuracaoId: input.DuracaoId
    }
  })

  if (!tipoSubscricaoDuracao) {
    throw new Error('Combinação de Tipo de Subscrição e Duração não encontrada')
  }

  const dataInicio = new Date()
  dataInicio.setHours(0, 0, 0, 0)

  const duracao = await context.entities.Duracao.findUnique({
    where: { DuracaoId: input.DuracaoId }
  })

  if (!duracao) {
    throw new Error('Duração não encontrada')
  }

  const dataFim = new Date(dataInicio)
  dataFim.setMonth(dataFim.getMonth() + duracao.Meses)

  const valorBase = tipoSubscricaoDuracao.ValorFinal * input.DetalheSubscricao.Quantidade
  const valorFinal = input.DetalheSubscricao.Desconto 
    ? valorBase * (1 - input.DetalheSubscricao.Desconto)
    : valorBase

  const subscricao = await context.entities.Subscricao.create({
    data: {
      DataInicio: dataInicio,
      DataFim: dataFim,
      EstadoSubscricao: false,
      Utilizador: { connect: { id: input.UtilizadorId } },
      TipoSubscricao: { connect: { TipoSubscricaoID: input.TipoSubscricaoId } },
      Duracao: { connect: { DuracaoId: input.DuracaoId } }
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
  DataInicio?: Date
  UtilizadorId: number
  TipoSubscricaoId: number
  DuracaoId: number
  DetalheSubscricao: {
    Quantidade: number
    Desconto?: number
  }
  Pagamento: {
    DadosEspecificos?: any
    EstadoPagamento?: string
    NIFPagamento?: string
    MetodoPagamentoId: number
    Nota?: string
  }
  PagamentoPagamentoId: number
}

export const createSubscricaoCompleta: CreateSubscricaoCompleta<CreateSubscricaoCompletaPayload, Subscricao> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }
  
  const { subscricao, valorFinal } = await createSubscricao(args, context)

  const pagamento = await createPagamento({
    Valor: valorFinal,
    UtilizadorId: args.UtilizadorId,
    MetodoPagamentoId: args.Pagamento.MetodoPagamentoId,
    DadosEspecificos: args.Pagamento.DadosEspecificos,
    EstadoPagamento: args.Pagamento.EstadoPagamento,
    NIFPagamento: args.Pagamento.NIFPagamento!,
    TelemovelMbway: args.Pagamento?.DadosEspecificos?.telemovelMbway,
    Nota: args.Pagamento.Nota
  }, prisma)

  const subscricaoFinal = await connectPagamentoASubscricao(
    subscricao.SubscricaoId,
    pagamento.PagamentoId,
    context
  )

  return subscricaoFinal
}

const prisma = new PrismaClient()

async function CreateSubscricoesAposExpirar() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const utilizadores = await prisma.utilizador.findMany({
    where: {
      Subscricoes: {
        some: {}
      }
    },
    include: {
      Subscricoes: {
        orderBy: { DataFim: 'desc' },
        take: 1
      }
    }
  })

  for (const utilizador of utilizadores) {
    const ultimaSubscricao = utilizador.Subscricoes[0]
    // log para testes
    //console.log(`Utilizador ${utilizador.id} - DataFim: ${ultimaSubscricao?.DataFim}`)
    if (!ultimaSubscricao) {
      continue
    }

    const dataFim = new Date(ultimaSubscricao.DataFim)
    dataFim.setHours(0, 0, 0, 0)

    if (dataFim >= hoje) {
      continue
    }

    if(!ultimaSubscricao.DuracaoId) {
      continue
    }

    if(utilizador.EstadoUtilizador === false) {
      continue
    }

    const duracao = await prisma.duracao.findUnique({
      where: { DuracaoId: ultimaSubscricao.DuracaoId }
    })

    if (!duracao) {
      continue
    }

    const novaDataInicio = new Date(dataFim)
    novaDataInicio.setDate(novaDataInicio.getDate() + 1)

    const novaDataFim = new Date(novaDataInicio)
    novaDataFim.setMonth(novaDataFim.getMonth() + duracao.Meses)

    await prisma.subscricao.create({
      data: {
        DataInicio: novaDataInicio,
        DataFim: novaDataFim,
        EstadoSubscricao: false,
        Utilizador: { connect: { id: utilizador.id } },
        TipoSubscricao: {
          connect: { TipoSubscricaoID: ultimaSubscricao.TipoSubscricaoTipoSubscricaoID }
        },
        Duracao: { connect: { DuracaoId: ultimaSubscricao.DuracaoId } }
      }
    })

    console.log(`Nova subscrição criada para utilizador #${utilizador.id}`)
  }
}

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

cron.schedule ('1 0 * * *', async()=> {
  console.log("A criar subscricoes...")
  await CreateSubscricoesAposExpirar()
}) 

cron.schedule('1 0 * * *', async () => {
  console.log('A procurar subscricoes...')
  await updateAllSubscricoesStatus()
})

type CreatePagamentoSubscricaoExistentePayload = {
  Valor: number | 0
  UtilizadorId: number
  MetodoPagamentoId: number
  Nota?: string
  DadosEspecificos?: any
  EstadoPagamento?: string
  NIFPagamento: string
  TelemovelMbway?: string
  SubscricaoId: number 
}

export const createPagamentoSubscricaoExistente: CreatePagamentoSubscricaoExistente <CreatePagamentoSubscricaoExistentePayload, Pagamento> = async (args, context) => {
  const subscricao = await context.entities.Subscricao.findUnique({
    where: { SubscricaoId: args.SubscricaoId },
    include: {
      Detalhes: true
    }
  })

  if(!subscricao) {
    throw new Error("Subscricao nao encontrada")
  }

  const valorFinal = subscricao.Detalhes.reduce((total, detalhe) => {
      return total + detalhe.ValorFinal
    }, 0)
    
  const pagamento = await createPagamento(
    {
      Valor: valorFinal,
      UtilizadorId: args.UtilizadorId,
      MetodoPagamentoId: args.MetodoPagamentoId,
      DadosEspecificos: args.DadosEspecificos,
      EstadoPagamento: args.EstadoPagamento || 'pendente',
      NIFPagamento: args.NIFPagamento,
      TelemovelMbway: args?.DadosEspecificos?.telemovelMbway,
    },
    context.entities
  )

  const subscricaoFinal = await connectPagamentoASubscricao(
    args.SubscricaoId,
    pagamento.PagamentoId,
    context
  )

  return subscricaoFinal;
}
