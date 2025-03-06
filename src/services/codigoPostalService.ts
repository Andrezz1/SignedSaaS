import { CodigoPostal } from 'wasp/entities'
import { type GetCodigoPostal } from 'wasp/server/operations'
import { CreateCodigoPostal } from 'wasp/server/operations'

export const getCodigoPostal: GetCodigoPostal<void, CodigoPostal[]> = async (args, context) => {
  return context.entities.CodigoPostal.findMany({
    orderBy: { CodigoPostalId: 'asc' },
  })
}


type CreateCodigoPostalPayLoad = Pick<CodigoPostal, 'Localidade'>


export const createCodigoPostal: CreateCodigoPostal<CreateCodigoPostalPayLoad, CodigoPostal> = async (
  args,
  context
) => {
  return context.entities.CodigoPostal.create({
    data: { Localidade: args.Localidade },
  });
};
