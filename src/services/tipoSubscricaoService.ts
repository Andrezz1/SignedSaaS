import { TipoSubscricao } from 'wasp/entities'
import { type GetTipoSubscricao } from 'wasp/server/operations'

export const getTipoSubscricao: GetTipoSubscricao<void, TipoSubscricao[]> = async (_args, context) => {
  return context.entities.TipoSubscricao.findMany({
    orderBy: { TipoSubscricaoID: 'asc' },
  })
}
