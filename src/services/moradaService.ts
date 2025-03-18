import { Morada, CodigoPostal } from 'wasp/entities'
import { 
  type GetMorada, 
  type GetMoradaInfo 
} from 'wasp/server/operations'

export const getMorada: GetMorada<void, Morada[]> = async (_args, context) => {
  return context.entities.Morada.findMany({
    orderBy: { MoradaId: 'asc' },
  })
}

export const getMoradaInfo: GetMoradaInfo<void, Array<{ 
  morada: Morada, 
  codigoPostal: CodigoPostal
}>> = async (_args, context) => {
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
