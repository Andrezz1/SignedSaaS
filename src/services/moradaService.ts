import { Morada, CodigoPostal } from 'wasp/entities'
import { 
  type GetMorada, 
  type GetMoradaInfo 
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getMorada: GetMorada<void, Morada[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.Morada.findMany({
    orderBy: { MoradaId: 'asc' },
  })
}

export const getMoradaInfo: GetMoradaInfo<void, Array<{ 
  morada: Morada, 
  codigoPostal: CodigoPostal
}>> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const moradas = await context.entities.Morada.findMany({
    include: {
      CodigoPostal: true,
    }
  })

  const MoradaInfo = moradas.map(({ CodigoPostal, ...morada }) => ({
    morada,
    codigoPostal: CodigoPostal,
  }))

  return MoradaInfo
}
