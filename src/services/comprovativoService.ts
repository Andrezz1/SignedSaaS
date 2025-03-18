import { Comprovativo, Utilizador, Pagamento, Subscricao } from 'wasp/entities'
import { 
  type GetComprovativo, 
  type GetComprovativoInfo, 
  type GetComprovativoByUtilizadorId 
} from 'wasp/server/operations'

export const getComprovativo: GetComprovativo<void, Comprovativo[]> = async (_args, context) => {
  return context.entities.Comprovativo.findMany({
    orderBy: { ComprovativoId: 'asc' },
  })
}

export const getComprovativoInfo: GetComprovativoInfo<void, Array<{
  comprovativo: Comprovativo,
  utilizador: Utilizador,
  pagamento: Pagamento,
  subscricao: Subscricao
}>> = async (_args, context) => {
  const comprovativos = await context.entities.Comprovativo.findMany({
    include: {
      Utilizador: true,
      Pagamento: true,
      Subscricao: true,
    }
  })

  const comprovativoInfo = comprovativos.map(({ Utilizador, Pagamento, Subscricao, ...comprovativo }) => ({
    comprovativo,
    utilizador: Utilizador,
    pagamento: Pagamento,
    subscricao: Subscricao,
  }))

  return comprovativoInfo
}

export const getComprovativoByUtilizadorId: GetComprovativoByUtilizadorId<Pick<Utilizador, 'UtilizadorId'>, Comprovativo[]>
= async (
  args,
 context
) => {
  if(!args.UtilizadorId) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Comprovativo.findMany({
    where: { UtilizadorUtilizadorId: args.UtilizadorId },
    include: {
      Pagamento: true,
      Subscricao: true,
    }
  })
}
