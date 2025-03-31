import { TipoUtilizador } from 'wasp/entities'
import { type GetTipoUtilizador } from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getTipoUtilizador: GetTipoUtilizador<void, TipoUtilizador[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.TipoUtilizador.findMany({
    orderBy: { TipoUtilizadorId: 'asc' },
  })
}
