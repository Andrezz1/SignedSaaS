import { TipoSubscricao } from 'wasp/entities'
import { type GetTipoSubscricao, type CreateTipoSubscricao } from 'wasp/server/operations'

export const getTipoSubscricao: GetTipoSubscricao<void, TipoSubscricao[]> = async (_args, context) => {
  return context.entities.TipoSubscricao.findMany({
    orderBy: { TipoSubscricaoID: 'asc' },
  })
}

type CreateTipoSubscricaoPayLoad = Pick <TipoSubscricao, 'Descricao' | 'Preco'>

export const createTipoSubscricao: CreateTipoSubscricao<CreateTipoSubscricaoPayLoad, TipoSubscricao> = async (
  args,
  context
) => {
  const tiposSubscricoes = await context.entities.TipoSubscricao.create({
    data: {
      Descricao: args.Descricao,
      Preco: args.Preco,
    }
  })

  return tiposSubscricoes
}
