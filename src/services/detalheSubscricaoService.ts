import { DetalheSubscricao, Subscricao, TipoSubscricao } from 'wasp/entities'
import { type GetDetalheSubscricao, GetDetalheSubscricaoInfo } from 'wasp/server/operations'

export const getDetalheSubscricao: GetDetalheSubscricao<void, DetalheSubscricao[]> = async (args, context) => {
  return context.entities.DetalheSubscricao.findMany({
    orderBy: { DetalheSubscricaoId: 'asc' },
  })
}

export const getDetalheSubscricaoInfo: GetDetalheSubscricaoInfo<void, Array<{ 
  detalheSubscricao: DetalheSubscricao, 
  subscricao: Subscricao, 
  tipoSubscricao: TipoSubscricao 
}>> = async (_args, context) => {
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
