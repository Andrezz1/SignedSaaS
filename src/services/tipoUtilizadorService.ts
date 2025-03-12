import { TipoUtilizador } from 'wasp/entities'
import { type GetTipoUtilizador } from 'wasp/server/operations'

export const getTipoUtilizador: GetTipoUtilizador<void, TipoUtilizador[]> = async (_args, context) => {
  return context.entities.TipoUtilizador.findMany({
    orderBy: { TipoUtilizadorId: 'asc' },
  })
}
