import { Contacto } from 'wasp/entities'
import { type GetContacto } from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getContacto: GetContacto<void, Contacto[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.Contacto.findMany({
    orderBy: { ContactoId: 'asc' },
  })
}
