import { CodigoPostal } from 'wasp/entities'
import { type GetCodigoPostal } from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getCodigoPostal: GetCodigoPostal<void, CodigoPostal[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.CodigoPostal.findMany({
    orderBy: { CodigoPostalId: 'asc' },
  })
}
