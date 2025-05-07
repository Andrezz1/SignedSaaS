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
  })
}

type CreateTipoSubscricaoPayLoad = Pick <TipoSubscricao, 'Descricao' | 'Preco'>

export const createTipoSubscricao: CreateTipoSubscricao<CreateTipoSubscricaoPayLoad, TipoSubscricao> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const tiposSubscricoes = await context.entities.TipoSubscricao.create({
    data: {
      Descricao: capitalize(args.Descricao),
      Preco: args.Preco,
    }
  })

  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  try {
    await registarAuditLog('auditTipoSubscricao',{
          entidade: 'TipoSubscricao',
          operacao: 'CREATE',
          idUtilizadorResponsavel,
          parametrosRecebidos,
          dadosAntes: null,
          dadosDepois: tiposSubscricoes,
          resultado: 'SUCCESS',
          mensagemErro: ""
    })

    return tiposSubscricoes

  } catch (error) {
      await registarAuditLog('auditTipoSubscricao',{
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

type UpdateTipoSubscricaoPayLoad = Pick<TipoSubscricao, 'TipoSubscricaoID' | 'Descricao' | 'Preco'>

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
      Preco: args.Preco,
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
