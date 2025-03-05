import { CodigoPostal } from 'wasp/entities'
import { type GetCP } from 'wasp/server/operations'

export const getCP: GetCP<void, CodigoPostal[]> = async (args, context) => {
  return context.entities.CodigoPostal.findMany({
    orderBy: { CodigoPostalId: 'asc' },
  })
}