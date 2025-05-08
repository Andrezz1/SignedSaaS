import { TipoSubscricao } from 'wasp/entities'
import { 
  type GetTipoSubscricao, 
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

type CreateTipoSubscricaoPayload = {
  Nome: string
  PrecoBaseMensal: number
  Descricao: string
  Duracoes: { DuracaoId: number; Desconto?: number }[]
}

export const createTipoSubscricao: CreateTipoSubscricao<CreateTipoSubscricaoPayload, TipoSubscricao> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const { Nome, PrecoBaseMensal, Descricao, Duracoes } = args
  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  try {
    const duracoes = await context.entities.Duracao.findMany({
      where: {
        DuracaoId: { in: Duracoes.map(d => d.DuracaoId) }
      }
    })

    const tipoSubscricao = await context.entities.TipoSubscricao.create({
      data: {
        Nome: capitalize(Nome),
        Descricao,
        PrecoBaseMensal,
        Duracoes: {
          create: Duracoes.map(({ DuracaoId, Desconto }) => {
            const duracao = duracoes.find(d => d.DuracaoId === DuracaoId)
            if (!duracao) throw new Error(`Duração com ID ${DuracaoId} não encontrada`)

            const meses = duracao.Meses
            const desconto = Desconto ?? 0
            const valorBase = PrecoBaseMensal * meses
            const valorFinal = valorBase * (1 - desconto)

            return {
              Duracao: { connect: { DuracaoId } },
              Desconto: desconto,
              ValorFinal: valorFinal
            }
          })
        }
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

type UpdateTipoSubscricaoPayLoad = Pick<TipoSubscricao, 'TipoSubscricaoID' | 'Descricao' | 'PrecoBaseMensal'>

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
      PrecoBaseMensal: args.PrecoBaseMensal,
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
