import { CodigoPostal } from 'wasp/entities'
import { type GetCodigoPostal } from 'wasp/server/operations'

export const getCodigoPostal: GetCodigoPostal<void, CodigoPostal[]> = async (_args, context) => {
  return context.entities.CodigoPostal.findMany({
    orderBy: { CodigoPostalId: 'asc' },
  })
}
