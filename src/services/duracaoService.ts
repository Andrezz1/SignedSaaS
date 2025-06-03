import { Duracao, TipoSubscricao } from 'wasp/entities'
import { 
  type GetDuracao,
  type GetDuracaoByTipoSubscricaoId
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getDuracao: GetDuracao<void, Duracao[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.Duracao.findMany({
    orderBy: { DuracaoId: 'asc' },
  })
}

export const getDuracaoByTipoSubscricaoId: GetDuracaoByTipoSubscricaoId<Pick<TipoSubscricao, 'TipoSubscricaoID'>, any[]> 
= async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  if (!args.TipoSubscricaoID) {
    throw new Error("TipoSubscricaoID não foi fornecido")
  }

  const tipoSubscricaoDuracoes = await context.entities.TipoSubscricaoDuracao.findMany({
    where: {
      TipoSubscricaoID: args.TipoSubscricaoID
    },
    include: {
      Duracao: true,
      TipoSubscricao: true
    }
  })

  return tipoSubscricaoDuracoes.map((tsd) => ({
    ...tsd.Duracao,
    Valor: tsd.Valor,
  }))
}
