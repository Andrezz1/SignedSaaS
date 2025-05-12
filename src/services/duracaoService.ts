import { Duracao } from 'wasp/entities'
import { type GetDuracao, } from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getDuracao: GetDuracao<void, Duracao[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.Duracao.findMany({
    orderBy: { DuracaoId: 'asc' },
  })
}