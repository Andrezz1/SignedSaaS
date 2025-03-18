import { Doacao, Utilizador } from 'wasp/entities'
import { 
  type GetDoacao, 
  type GetDoacaoInfo, 
  type GetDoacaoByUtilizadorId 
} from 'wasp/server/operations'

export const getDoacao: GetDoacao<void, Doacao[]> = async (_args, context) => {
  return context.entities.Doacao.findMany({
    orderBy: { DoacaoId: 'asc' },
  })
}

export const getDoacaoInfo: GetDoacaoInfo<void, Array<{ 
  doacao: Doacao, 
  utilizador: Utilizador 
}>> = async (_args, context) => {
  const doacoes = await context.entities.Doacao.findMany({
    include: {
      Utilizador: true,
    }
  })

  const DoacaoInfo = doacoes.map (({ Utilizador, ...doacao }) => ({
    doacao,
    utilizador: Utilizador,
  }))

  return DoacaoInfo
}

export const getDoacaoByUtilizadorId: GetDoacaoByUtilizadorId<Pick<Utilizador, 'UtilizadorId'>, Doacao[]>
= async (args, context) => {
  if (!args.UtilizadorId) return []

  return context.entities.Doacao.findMany({
    where: { UtilizadorUtilizadorId: args.UtilizadorId },
  })
}
