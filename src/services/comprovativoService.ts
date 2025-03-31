import { Comprovativo, Utilizador, Pagamento, Subscricao } from 'wasp/entities'
import { 
  type GetComprovativo, 
  type GetComprovativoInfo, 
  type GetComprovativoByUtilizadorId 
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getComprovativo: GetComprovativo<void, Comprovativo[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

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
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

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

export const getComprovativoByUtilizadorId: GetComprovativoByUtilizadorId<Pick<Utilizador, 'id'>, Comprovativo[]>
= async (
  args,
 context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  if(!args.id) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Comprovativo.findMany({
    where: { UtilizadorId: args.id },
    include: {
      Pagamento: true,
      Subscricao: true,
    }
  })
}
