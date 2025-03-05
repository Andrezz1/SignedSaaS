import { Contacto } from 'wasp/entities'
import { type GetContacto } from 'wasp/server/operations'

export const getContacto: GetContacto<void, Contacto[]> = async (args, context) => {
  return context.entities.Contacto.findMany({
    orderBy: { ContactoId: 'asc' },
  })
}
