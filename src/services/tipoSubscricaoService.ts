import { TipoSubscricao } from 'wasp/entities'
import { type GetTipoSubscricao, type CreateTipoSubscricao, type UpdateTipoSubscricao } from 'wasp/server/operations'

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

type UpdateTipoSubscricaoPayLoad = Pick<TipoSubscricao, 'TipoSubscricaoID' | 'Descricao' | 'Preco'>

export const updateTipoSubscricao: UpdateTipoSubscricao<UpdateTipoSubscricaoPayLoad, TipoSubscricao> = async (
  args,
  context,
) => {
  const updatedTipoSubscricao = await context.entities.TipoSubscricao.update({
    where: { TipoSubscricaoID: args.TipoSubscricaoID },
    data: {
      Descricao: args.Descricao,
      Preco: args.Preco,
    }
  })

  return updatedTipoSubscricao
}
