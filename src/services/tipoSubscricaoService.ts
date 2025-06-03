import { TipoSubscricao, Duracao, TipoSubscricaoDuracao, Entidade } from 'wasp/entities'
import { 
  type GetTipoSubscricao, 
  type GetTipoSubscricaoInfo,
  type CreateTipoSubscricao, 
  type UpdateTipoSubscricao
} from 'wasp/server/operations'
import { capitalize } from './utils'
import { HttpError } from 'wasp/server'
import { registarAuditLog } from './auditService'

export const getTipoSubscricao: GetTipoSubscricao<void, TipoSubscricao[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.TipoSubscricao.findMany({
    orderBy: { TipoSubscricaoID: 'asc' },
    include: {
      Duracoes: {
        include: {
          Duracao: true,
        }
      }
    }
  })
}

// Esta funcao foi feita para utilizar na tabela de planos.
export const getTipoSubscricaoInfo: GetTipoSubscricaoInfo<{
  page: number,
  pageSize: number,
  searchTerm?: string,
  filters?: {
    duracaoId?: number,
  }
},
{
  data: {
    tipoSubscricao: TipoSubscricao
    duracao: Duracao
    tipoSubscricaoduracao: TipoSubscricaoDuracao
    entidade: Entidade
  }[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> = async ({ page, pageSize, searchTerm, filters }, context) => {
  const skip = (page - 1) * pageSize
  const take = pageSize

  const where: any = {}

  if (searchTerm) {
    where.OR = [
      { Nome: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }

  if (filters?.duracaoId) {
    where.Duracoes = {
      some: {
        DuracaoId: { equals: filters?.duracaoId }
      }
    }
  }

  const tiposSubscricao = await context.entities.TipoSubscricao.findMany({
    where,
    orderBy: { TipoSubscricaoID: 'desc' },
    include: {
      Duracoes: {
        include: {
          Duracao: true,
        }
      },
      Entidade: true
    },
    skip,
    take,
  })

  const totalSubscricao = await context.entities.TipoSubscricao.count({
    where,
  })

  const tiposSubscricaoInfo = tiposSubscricao.flatMap(tipo => 
    tipo.Duracoes.map(duracaoRel => ({
      tipoSubscricao: {
        TipoSubscricaoID: tipo.TipoSubscricaoID,
        Nome: tipo.Nome,
        Descricao: tipo.Descricao,
        EntidadeId: tipo.EntidadeId
      },
      duracao: duracaoRel.Duracao,
      tipoSubscricaoduracao: {
        TipoSubscricaoDuracaoId: duracaoRel.TipoSubscricaoDuracaoId,
        TipoSubscricaoID: duracaoRel.TipoSubscricaoID,
        DuracaoId: duracaoRel.DuracaoId,
        Valor: duracaoRel.Valor,
      },
      entidade: tipo.Entidade
    })))

  return {
    data: tiposSubscricaoInfo,
    total: totalSubscricao,
    page,
    pageSize,
    totalPages: Math.ceil(totalSubscricao / pageSize),
  }
}

type CreateTipoSubscricaoPayload = {
  Nome: string
  Descricao: string
  EntidadeId : number
  Duracoes: { DuracaoId: number; Valor: number }[]
}

export const createTipoSubscricao: CreateTipoSubscricao<CreateTipoSubscricaoPayload, TipoSubscricao> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const { Nome, Descricao, Duracoes } = args
  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  try {
    const duracoesExistentes = await context.entities.Duracao.findMany({
      where: {
        DuracaoId: { in: Duracoes.map(d => d.DuracaoId) }
      }
    })

    Duracoes.forEach(({ DuracaoId }) => {
      const encontrada = duracoesExistentes.find(d => d.DuracaoId === DuracaoId)
      if (!encontrada) {
        throw new Error(`Duração com ID ${DuracaoId} não encontrada`)
      }
    })

    const tipoSubscricao = await context.entities.TipoSubscricao.create({
      data: {
        Nome: capitalize(Nome),
        Descricao,
        Duracoes: {
          create: Duracoes.map(({ DuracaoId, Valor }) => ({
            Duracao: { connect: { DuracaoId } },
            Valor
          }))
        },
        EntidadeId: args.EntidadeId
      },
      include: {
        Duracoes: true
      }
    })

    await registarAuditLog('auditTipoSubscricao', {
      entidade: 'TipoSubscricao',
      operacao: 'CREATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: null,
      dadosDepois: tipoSubscricao,
      resultado: 'SUCCESS',
      mensagemErro: ""
    })

    return tipoSubscricao

  } catch (error) {
    await registarAuditLog('auditTipoSubscricao', {
      entidade: 'TipoSubscricao',
      operacao: 'CREATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: null,
      dadosDepois: null,
      resultado: 'FAILURE',
      mensagemErro: error instanceof Error ? error.message : JSON.stringify(error)
    })

    throw error
  }
}

// Nao funciona ainda, apenas corrigi os erros apos mudança do schema, refazer funcao depois

type UpdateTipoSubscricaoPayLoad = Pick<TipoSubscricao, 'TipoSubscricaoID' | 'Descricao'>

export const updateTipoSubscricao: UpdateTipoSubscricao<UpdateTipoSubscricaoPayLoad, TipoSubscricao> = async (
  args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const tipoSubscricao = await context.entities.TipoSubscricao.findUnique({
    where: { TipoSubscricaoID: args.TipoSubscricaoID },
  })

  const updatedTipoSubscricao = await context.entities.TipoSubscricao.update({
    where: { TipoSubscricaoID: args.TipoSubscricaoID },
    data: {
      Descricao: capitalize(args.Descricao),
    }
  })

  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  try {
    await registarAuditLog('auditTipoSubscricao',{
      entidade: 'TipoSubscricao',
      operacao: 'UPDATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: tipoSubscricao,
      dadosDepois: updatedTipoSubscricao,
      resultado: 'SUCCESS',
      mensagemErro: ""
    })

    return updatedTipoSubscricao
  } catch (error) {
    await registarAuditLog('auditTipoSubscricao',{
      entidade: 'TipoSubscricao',
      operacao: 'UPDATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: null,
      dadosDepois: null,
      resultado: 'FAILURE',
      mensagemErro: error instanceof Error ? error.message : JSON.stringify(error)
    })

    throw error
  }
}
