import { Doacao, Utilizador } from 'wasp/entities'
import { 
  type GetDoacoes, 
  type GetDoacaoInfo, 
  type GetDoacaoByUtilizadorId 
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

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
    }[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
> = async ({ page, pageSize, searchTerm }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não tem permissão')
  }

  const skip = (page - 1) * pageSize
  const take = pageSize

  const where: any = {}
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
      },
      orderBy: {
        DoacaoId: 'desc',
      },
      skip,
      take,
    })

  const doacoesInfo = doacoes.map(({ Utilizador, ...doacao }) => ({
    doacao,
    utilizador: Utilizador!
  })
)

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

export const getDoacaoByUtilizadorId: GetDoacaoByUtilizadorId<Pick<Utilizador, 'id'>, Doacao[]>
= async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  if(!args.id) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Doacao.findMany({
    where: { UtilizadorId: args.id },
  })
}
