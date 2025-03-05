import { Morada } from 'wasp/entities'
import { CodigoPostal } from 'wasp/entities'
import { type GetMorada, type GetMoradaInfo } from 'wasp/server/operations'
import { getCodigoPostal } from './codigoPostalService'

export const getMorada: GetMorada<void, Morada[]> = async (args, context) => {
  return context.entities.Morada.findMany({
    orderBy: { MoradaId: 'asc' },
  })
}

export const getMoradaInfo: GetMoradaInfo<void, Array<{ morada: Morada, codigoPostal: CodigoPostal}>> = async (args, context) => {
  const moradas = await getMorada(args, context)
  const codigosPostais = await getCodigoPostal(args, context)

  const MoradaInfo = moradas.map(morada => {
    const codigoPostal = codigosPostais.find(cp => cp.CodigoPostalId === morada.CodigoPostalCodigoPostalId)
    return {
      morada,
      codigoPostal: codigoPostal || { CodigoPostalId: -1, Localidade: 'Unknown' },

    }
  })

  return MoradaInfo
}
