import { Doacao, Pagamento, Utilizador } from 'wasp/entities'
import { 
  type GetDoacoes,
  type GetDoacaoInfo,
  type GetDoacaoByUtilizadorId,
  type GetDoacoesQuantia,
  type CreateDoacaoCompleta
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'
import { createPagamento } from './pagamentoService'
import { verifyAuthentication } from './utilizadorService'

export const getDoacoes: GetDoacoes<void, number> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const where: any = {}

  const totalDoacoes = await context.entities.Doacao.count({
    where,
  })

  return totalDoacoes
}

export const getDoacoesQuantia: GetDoacoesQuantia<void, number> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const resultado = await context.entities.Doacao.aggregate({
    where: {
      Pagamento: {
        EstadoPagamento: 'concluido'
      }
    },
    _sum: {
      ValorDoacao: true,
    },
  })

  return resultado._sum.ValorDoacao ?? 0
}

export const getDoacaoInfo: GetDoacaoInfo<
  {
    page: number
    pageSize: number
    searchTerm?: string
  },
  {
    data: {
      doacao: Doacao
      utilizador: Utilizador
      pagamento: Pagamento
    }[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
> = async ({ page, pageSize, searchTerm }, context) => {
  // if (!context.user) {
  //   throw new HttpError(401, 'Não tem permissão')
  // }

  const skip = (page - 1) * pageSize
  const take = pageSize

  const where: any = {
    Pagamento: {
      EstadoPagamento: 'concluido'
    }
  }
  
  if (searchTerm) {
    where.OR = [
      { Nota: { contains: searchTerm, mode: 'insensitive' } },
      { Utilizador: { Nome: { contains: searchTerm, mode: 'insensitive' } } },
      { Utilizador: { NIF: { contains: searchTerm, mode: 'insensitive' } } },
    ]
  }

  const doacoes = await context.entities.Doacao.findMany({
      where,
      include: {
        Utilizador: {
          include: {
            Contacto: true,
          },
        },
        Pagamento: {
          include: {
            MetodoPagamento: true,
          }
        }
      },
      orderBy: {
        DoacaoId: 'desc',
      },
      skip,
      take,
    })

  const doacoesInfo = doacoes.map(({ Utilizador, Pagamento, ...doacao }) => ({
    doacao,
    utilizador: Utilizador!,
    pagamento: Pagamento!
  }))

  const totaldoacoes = await context.entities.Doacao.count({
    where, 
  })

  return {
    data: doacoesInfo,
    total: totaldoacoes,
    page,
    pageSize,
    totalPages: Math.ceil(totaldoacoes / pageSize),
  }
}

export const getDoacaoByUtilizadorId: GetDoacaoByUtilizadorId<Pick<Utilizador, 'id'> & { token?: string }, Doacao[]>
= async (args, context) => {
  await verifyAuthentication(context, args.token || '', args.id)

  if(!args.id) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Doacao.findMany({
    where: { UtilizadorId: args.id },
  })
}

type CreateDoacaoCompletaPayload = {
  token: string
  ValorDoacao: number,
  NotaPagamento?: string,
  NotaDoacao?: string,
  UtilizadorId: number,
  MetodoPagamentoId: number,
  NIFPagamento: string,
  TelemovelMbway?: string
}

export const createDoacaoCompleta: CreateDoacaoCompleta<
  CreateDoacaoCompletaPayload,
  { pagamento: Pagamento, doacao: Doacao }
> = async (args, context) => {
  await verifyAuthentication(context, args.token || '', args.UtilizadorId)

  const utilizador = await context.entities.Utilizador.findUnique({
    where: { id: args.UtilizadorId }
  })

  if (!utilizador) {
    throw new Error("Utilizador não encontrado")
  }

  const pagamento = await createPagamento({
    Valor: args.ValorDoacao,
    UtilizadorId: args.UtilizadorId,
    MetodoPagamentoId: args.MetodoPagamentoId,
    NIFPagamento: args.NIFPagamento,
    Nota: args.NotaPagamento,
    TelemovelMbway: args.TelemovelMbway
  }, context.entities) 

  const doacao = await context.entities.Doacao.create({
    data: {
      ValorDoacao: args.ValorDoacao,
      DataDoacao: new Date(),
      Nota: args.NotaDoacao || '',
      UtilizadorId: args.UtilizadorId,
      Pagamento: {
        connect: { PagamentoId: pagamento.PagamentoId }
      }
    },
  })

  return { pagamento, doacao }
}
