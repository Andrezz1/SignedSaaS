import { DetalheSubscricao, Subscricao, TipoSubscricao } from 'wasp/entities'
import { 
  type GetDetalheSubscricao, 
  type GetDetalheSubscricaoInfo 
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getDetalheSubscricao: GetDetalheSubscricao<void, DetalheSubscricao[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.DetalheSubscricao.findMany({
    orderBy: { DetalheSubscricaoId: 'asc' },
  })
}

export const getDetalheSubscricaoInfo: GetDetalheSubscricaoInfo<void, Array<{
  detalheSubscricao: DetalheSubscricao,
  subscricao: Subscricao,
  tipoSubscricao: TipoSubscricao
}>> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const detalhesSubscricoes = await context.entities.DetalheSubscricao.findMany({
    include: {
      Subscricao: true,
      TipoSubscricao: true,
    }
  })

  const detalheSubscricaoInfo = detalhesSubscricoes.map(({ Subscricao, TipoSubscricao, ...detalheSubscricao }) => ({
    detalheSubscricao,
    subscricao: Subscricao,
    tipoSubscricao: TipoSubscricao,
  }))

  return detalheSubscricaoInfo
}
